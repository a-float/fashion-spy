import { db, table } from "db";
import { and, eq, InferSelectModel, SQL, sql } from "drizzle-orm";
import { Extractor, StoreName } from "./extractors/base";
import {
  ItemAlreadyExistsError,
  ItemNotFound,
  TooManyItems,
  UserDoesNotExist,
} from "./item.errors";

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

type Item = InferSelectModel<typeof table.items>;

export class ItemService {
  constructor(private extractors: Extractor[]) {}

  private async fetchItemData(url: string) {
    const extractor = this.extractors.find((e) => e.appliesTo(url));
    if (!extractor) throw new UserDoesNotExist();

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
    const items = await this.getAllVisibleItems();
    console.log(`Starting update of ${items.length} items at ...`);
    for (const item of items) {
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
                updatedAt: sql`(current_timestamp)`,
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
      // rate limiting
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

  private sanitizeUrl(rawUrl: string) {
    const url = new URL(rawUrl);
    return `${url.origin}${url.pathname}`;
  }

  async addItem(userId: number, rawUrl: string) {
    const user = await db.query.users.findFirst({
      where: eq(table.users.id, userId),
      with: { items: { where: eq(table.items.isTracked, 1) } }, // aggregate?
    });
    if (!user) throw new UserDoesNotExist();
    const url = this.sanitizeUrl(rawUrl);
    // const item = await db.query.items.findFirst({
    //   where: and(eq(table.items.ownerId, userId), eq(table.items.url, url)),
    // });
    const item = user.items.find((item) => item.url === url);
    if (item) throw new ItemAlreadyExistsError();
    if (user.items.length >= user.maxTrackedItems) throw new TooManyItems();

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

  private async getAllVisibleItems(userId?: number) {
    return await db.query.items.findMany({
      where: (item, { eq, and }) => {
        const args: SQL[] = [eq(item.isTracked, 1)];
        if (userId) args.push(eq(item.ownerId, userId));
        return and(...args);
      },
      with: { status: true },
    });
  }

  async getAllUserItems(userId: number) {
    const items = await db.query.items.findMany({
      where: eq(table.items.ownerId, userId),
      with: { status: true },
    });
    return items as ((typeof items)[number] & { store: StoreName })[];
  }

  async getItem(itemId: number) {
    return await db.query.items.findFirst({
      where: eq(table.items.id, itemId),
      with: { user: { columns: { maxTrackedItems: true } } },
    });
  }

  async updateItem(userId: number, itemId: number, data: Partial<Item>) {
    const item = await this.getItem(itemId);
    if (!item || item.ownerId !== userId) throw new ItemNotFound();
    const visibleUserItems = (await this.getAllVisibleItems(item.ownerId))
      .length;
    console.log({ visibleUserItems, item, data });
    if (
      !item.isTracked &&
      data.isTracked &&
      item.user.maxTrackedItems <= visibleUserItems
    ) {
      throw new TooManyItems();
    }
    return await db
      .update(table.items)
      .set(data)
      .where(eq(table.items.id, itemId));
  }
}
