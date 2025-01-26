import { db, table } from "db";
import {
  and,
  desc,
  eq,
  InferInsertModel,
  InferSelectModel,
  SQL,
  sql,
} from "drizzle-orm";
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
type ItemStatus = InferInsertModel<typeof table.itemStatus>;

export class ItemService {
  constructor(private extractors: Extractor[]) {}

  private async fetchItemData(url: string) {
    const extractor = this.extractors.find((e) => e.appliesTo(url));
    if (!extractor) throw new UserDoesNotExist();

    const cachedHtml = Bun.file(`./cache/${url.replaceAll("/", "-")}.html`);

    const onDev = process.env.BUN_ENV === "dev";
    if (onDev && (await cachedHtml.exists())) {
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

  private hashStatus(status: ItemStatus): string {
    const { createdAt, updatedAt, id, ...rest } = status;
    return JSON.stringify(rest);
  }

  async updateItemStatus(
    item: Awaited<ReturnType<typeof this.getVisibleItems>>[number]
  ) {
    const data = await this.fetchItemData(item.url).catch((e) => {
      console.log(`Failed to update item[id=${item.id}], ${e}`);
      return {
        amount: null,
        currency: null,
        details: {},
      };
    });
    const lastStatus = item.status.at(-1);
    const newStatus: ItemStatus = {
      itemId: item.id,
      amount: data.amount,
      currency: data.currency,
      details: data.details,
    };

    console.log({ newStatus });
    const shouldInsert =
      !lastStatus || this.hashStatus(lastStatus) !== this.hashStatus(newStatus);

    if (shouldInsert) {
      await db.insert(table.itemStatus).values(newStatus);
    } else {
      console.log("updating status with id", lastStatus.id);
      await db
        .update(table.itemStatus)
        .set({
          updatedAt: sql`(current_timestamp)`,
        })
        .where(eq(table.itemStatus.id, lastStatus.id));
    }
  }

  async updateAllItemStatus() {
    // TODO use a logger with time
    const items = await this.getVisibleItems();
    console.log(`Starting update of ${items.length} items at ...`);
    for (const item of items) {
      await this.updateItemStatus(item);
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
        details: data.details,
      });

      return item;
    });
  }

  async getVisibleItems(opts: { userId?: number; itemId?: number } = {}) {
    return await db.query.items.findMany({
      where: (item, { eq, and }) => {
        const args: SQL[] = [eq(item.isTracked, 1)];
        if (opts.userId) args.push(eq(item.ownerId, opts.userId));
        if (opts.itemId) args.push(eq(item.id, opts.itemId));
        return and(...args);
      },
      with: {
        status: { orderBy: [desc(table.itemStatus.updatedAt)], limit: 1 },
      },
    });
  }

  async getAllUserItems(userId: number) {
    const items = await db.query.items.findMany({
      where: eq(table.items.ownerId, userId),
      with: {
        status: { orderBy: [desc(table.itemStatus.updatedAt)], limit: 1 },
      },
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
    const visibleUserItems = (
      await this.getVisibleItems({ userId: item.ownerId })
    ).length;
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
