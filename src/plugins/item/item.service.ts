import { db, table } from "db";
import { and, eq, sql } from "drizzle-orm";
import { Extractor, StoreName } from "./extractors/base";
import {
  ItemAlreadyExistsError,
  NoApplicableExtractorError,
} from "./item.errors";

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class ItemService {
  constructor(private extractors: Extractor[]) {}

  private async fetchItemData(url: string) {
    const extractor = this.extractors.find((e) => e.appliesTo(url));
    if (!extractor) throw new NoApplicableExtractorError();

    const cachedHtml = Bun.file(`./cache/${url.replaceAll("/", "-")}.html`);

    const onDev = process.env.BUN_ENV === "dev";
    if (!onDev && (await cachedHtml.exists())) {
      console.log(`Using cached response for ${url}`);
      return await extractor.extractData(await cachedHtml.text());
    } else {
      console.log(`Fetching response for ${url}`);
      const res = await fetch(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0",
          Referer: "https://google.com",
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.9",
          Connection: "keep-alive",
        },
      });
      if (!res.ok) throw new Error(`Page returned ${res.status}`);
      const html = await res.text();
      Bun.write(cachedHtml, html);
      return await extractor.extractData(html);
    }
  }

  async updateAllItemStatus() {
    // TODO use a logger with time
    const items = await this.getAllItems();
    console.log(`Starting update of ${items.length} items at ...`);
    for (const item of items.filter((item) => !item.hidden)) {
      await this.fetchItemData(item.url)
        .then((data) => {
          const lastStatus = item.status.at(-1)!;
          // do not add new item if nothing has changed
          return lastStatus.amount !== data.amount
            ? db.insert(table.itemStatus).values({
                itemId: item.id,
                amount: data.amount,
                currency: data.currency,
              })
            : db.update(table.itemStatus).set({
                updated_at: sql`(current_timestamp)`,
              });
        })
        .catch((err) => {
          console.log(`Failed to update item[id=${item.id}], ${err}`);
          db.insert(table.itemStatus).values({
            itemId: item.id,
            amount: null,
            currency: null,
          });
        });
      // simple rate limiting
      sleep(1000 + Math.random() * 1000);
    }
    console.log(`Update done`);
  }

  async deleteItem(userId: number, itemId: number) {
    const [item] = await db
      .delete(table.items)
      .where(and(eq(table.items.id, itemId), eq(table.items.ownerId, userId)))
      .returning({ imagePath: table.items.imagePath });
    const file = Bun.file(item.imagePath);
    if (await file.exists()) await file.delete();
  }

  async addItem(userId: number, url: string) {
    const item = await db.query.items.findFirst({
      where: and(eq(table.items.ownerId, userId), eq(table.items.url, url)),
    });
    if (item) throw new ItemAlreadyExistsError();
    const data = await this.fetchItemData(url);

    await db.transaction(async (tx) => {
      const [item] = await tx
        .insert(table.items)
        .values({
          name: data.name,
          store: data.store,
          ownerId: userId,
          url: url,
          imagePath: data.image,
        })
        .returning();

      await tx.insert(table.itemStatus).values({
        itemId: item.id,
        amount: data.amount,
        currency: data.currency,
      });

      return item;
    });
  }

  private async getAllItems() {
    return await db.query.items.findMany({ with: { status: true } });
  }

  async getAllUserItems(userId: number) {
    const items = await db.query.items.findMany({
      where: eq(table.items.ownerId, userId),
      with: { status: true },
    });
    return items as ((typeof items)[number] & { store: StoreName })[];
  }
}
