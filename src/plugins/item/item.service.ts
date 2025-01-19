import { db, table } from "db";
import { and, eq } from "drizzle-orm";
import { Extractor } from "./extractors/base";
import {
  ItemAlreadyExistsError,
  NoApplicableExtractorError,
} from "./item.errors";

export class ItemService {
  constructor(private extractors: Extractor[]) {}

  private async fetchItemData(url: string) {
    const extractor = this.extractors.find((e) => e.appliesTo(url));
    if (!extractor) throw new NoApplicableExtractorError();

    const cachedHtml = Bun.file(`./cache/${url.replaceAll("/", "-")}.html`);

    if (await cachedHtml.exists()) {
      console.log(`Using cached response for ${url}`);
      return await extractor.extractData(await cachedHtml.text());
    } else {
      console.log(`Fetching response for ${url}`);
      const res = await fetch(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0",
        },
      });
      if (!res.ok) throw new Error(`Page returned ${res.status}`);
      const html = await res.text();
      Bun.write(cachedHtml, html);
      return await extractor.extractData(html);
    }
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

  async getAllItems(userId: number) {
    const userItems = await db.query.items.findMany({
      where: eq(table.items.ownerId, userId),
      with: { status: true },
    });
    return userItems;
  }
}
