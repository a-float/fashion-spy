import { Elysia, t } from "elysia";
import { authPlugin } from "plugins/auth";
import { VintedExtractor } from "./extractors/vinted";
import { ZaraExtractor } from "./extractors/zara";
import { ItemService } from "./item.service";
import { ReservedExtractor } from "./extractors/reserved";
import { HmExtractor } from "./extractors/hm";
import { Cron } from "croner";
import { table } from "db";
import { createUpdateSchema } from "drizzle-typebox";

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
    cron: {
      updateStatus: new Cron("0 */2 * * *", () => {
        store.ItemService.updateAllItemStatus();
      }),
    },
  }))
  .group("/api/items", (app) =>
    app
      .get("/status", ({ store }) => ({
        msToNext: store.cron.updateStatus.msToNext(),
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
        async ({ store, user, params, set, body }) => {
          const items = await store.ItemService.getVisibleItems({
            userId: user.id,
            itemId: params.itemId,
          });
          const item = items[0];
          if (!item) {
            set.status = "Bad Request";
            return;
          }
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
