import { Cron } from "croner";
import { createUpdateSchema } from "drizzle-typebox";
import { Elysia, t } from "elysia";
import { table } from "db";
import { authPlugin } from "plugins/auth/auth.controller";
import { HmExtractor } from "./extractors/hm";
import { ReservedExtractor } from "./extractors/reserved";
import { VintedExtractor } from "./extractors/vinted";
import { ZaraExtractor } from "./extractors/zara";
import { ItemNotFound, ItemServiceError } from "./item.errors";
import { ItemService } from "./item.service";

const _updateItemSchema = createUpdateSchema(table.items, {});

export const itemPlugin = new Elysia({ name: "item" })
  .use(authPlugin)
  .state(
    "ItemService",
    new ItemService([
      new VintedExtractor(),
      new ZaraExtractor(),
      new HmExtractor(),
      new ReservedExtractor(),
    ])
  )
  .model({
    updateItem: t.Pick(_updateItemSchema, ["isTracked"]),
  })
  .state((store) => ({
    ...store,
    updateItemsCron: new Cron("0 */2 * * *", () => {
      store.ItemService.updateAllItemStatus();
    }),
  }))
  .onError(({ error, set }) => {
    if (error instanceof ItemServiceError) {
      set.status = 400;
      return error.message;
    }
  })
  .group("/api/items", (app) =>
    app
      .get("/status", ({ store }) => ({
        msToNext: store.updateItemsCron.msToNext(),
      }))
      .get(
        "/",
        async ({ store, user }) =>
          await store.ItemService.getAllUserItems(user.id),
        { isLoggedIn: true }
      )
      .post(
        "/",
        async ({ store, user, body: { url } }) => {
          return await store.ItemService.addItem(user.id, url);
        },
        {
          isLoggedIn: true,
          body: t.Object({ url: t.String() }),
        }
      )
      .put(
        "/:itemId",
        async ({ store, user, params, body }) => {
          return await store.ItemService.updateItem(
            user.id,
            params.itemId,
            body
          );
        },
        {
          params: t.Object({ itemId: t.Number() }),
          body: "updateItem",
          isLoggedIn: true,
        }
      )
      .post(
        "/:itemId/updateStatus",
        async ({ store, user, params }) => {
          const items = await store.ItemService.getVisibleItems({
            userId: user.id,
            itemId: params.itemId,
          });
          const item = items[0];
          if (!item) throw new ItemNotFound();
          await store.ItemService.updateItemStatus(item);
          return { ok: true };
        },
        {
          params: t.Object({ itemId: t.Number() }),
          isLoggedIn: true,
        }
      )
      .delete(
        "/:itemId",
        async ({ store, user, params }) => {
          await store.ItemService.deleteItem(user.id, params.itemId);
          return { ok: true };
        },
        {
          params: t.Object({ itemId: t.Number() }),
          isLoggedIn: true,
        }
      )
  );
