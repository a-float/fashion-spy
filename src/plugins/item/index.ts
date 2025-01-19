import { Elysia, t } from "elysia";
import { authPlugin } from "plugins/auth";
import { VintedExtractor } from "./extractors/vinted";
import { ZaraExtractor } from "./extractors/zara";
import { ItemService } from "./item.service";

export const itemPlugin = new Elysia({ name: "item",  })
  .use(authPlugin)
  .state(
    "ItemService",
    new ItemService([new VintedExtractor(), new ZaraExtractor()])
  )
  .get("/item_test", () => "test")
  .group("/api/item", (app) =>
    app
      .get(
        "/",
        async ({ store, user }) => await store.ItemService.getAllItems(user.id),
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
