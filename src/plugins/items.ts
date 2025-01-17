import { db, table } from "db";
import { Elysia, error, t } from "elysia";
import { and, eq } from "drizzle-orm";
import { getUserMacro } from "./auth";
import { VintedExtractor } from "extractor/vinted";
import { ZaraExtractor } from "extractor/zara";
import fs from "node:fs";

const extractors = [new VintedExtractor(), new ZaraExtractor()];

const fetchItemData = async (url: string) => {
  const extractor = extractors.find((e) => e.appliesTo(url));
  if (!extractor) throw new Error(`Url not supported`);

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
};

export const itemsPlugin = new Elysia({ name: "items" })
  .use(getUserMacro)
  .group("/api/items", (app) =>
    app
      .get(
        "/",
        async ({ user }) => {
          const userItems = await db.query.items.findMany({
            where: eq(table.items.ownerId, user.id),
            with: { status: true },
          });
          return userItems;
        },
        { isLoggedIn: true }
      )
      .post(
        "/",
        async ({ user, body: { url } }) => {
          const item = await db.query.items.findFirst({
            where: and(
              eq(table.items.ownerId, user.id),
              eq(table.items.url, url)
            ),
          });
          console.log({ itemInDb: item });
          if (item) return error(400, "Item already exists");

          const data = await fetchItemData(url);
          console.log({ data });
          await db.transaction(async (tx) => {
            const [item] = await tx
              .insert(table.items)
              .values({
                name: data.name,
                store: data.store,
                ownerId: user.id,
                url: url,
                imagePath: data.image,
              })
              .returning({ id: table.items.id });

            await tx.insert(table.itemStatus).values({
              itemId: item.id,
              amount: data.amount,
              currency: data.currency,
            });
          });
          return { url, ...data };
        },
        {
          isLoggedIn: true,
          body: t.Object({ url: t.String() }),
        }
      )
      .delete(
        "/",
        async ({ user, body }) => {
          const [item] = await db
            .delete(table.items)
            .where(
              and(
                eq(table.items.id, body.itemId),
                eq(table.items.ownerId, user.id)
              )
            )
            .returning({ image: table.items.imagePath });
          // TODO use Bun when possible
          console.log("removing image", item.image);
          if (fs.existsSync(item.image)) await fs.rmSync(item.image);
          return { ok: true };
        },
        {
          isLoggedIn: true,
          body: t.Object({ itemId: t.Number() }),
        }
      )
  );
