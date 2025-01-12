import { Elysia, file } from "elysia";
import { renderToReadableStream } from "react-dom/server";
import App from "./ui/App";
import { staticPlugin } from "@elysiajs/static";
import { authPlugin } from "plugins/auth";
import { itemsPlugin } from "plugins/items";

await Bun.build({
  entrypoints: ["./src/ui/bootstrap.tsx"],
  outdir: "./public",
  minify: true,
});

const app = new Elysia()
  .use(staticPlugin())
  .get("/favicon.ico", () => file("public/favicon.ico"))
  .use(authPlugin)
  .use(itemsPlugin)
  .get("/", async ({ user }) => {
    const ssrProps = { user: user ? { email: user.email } : null };
    const app = <App {...ssrProps} />;
    const stream = await renderToReadableStream(app, {
      bootstrapModules: ["/public/bootstrap.js"],
      bootstrapScriptContent: `window.__INITIAL_DATA__ = ${JSON.stringify(
        ssrProps
      )}`,
    });
    return new Response(stream, { headers: { "Content-Type": "text/html" } });
  })
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);

export type Server = typeof app;
