import { Elysia, file } from "elysia";
import { renderToReadableStream } from "react-dom/server";
import App from "./ui/App";
import { staticPlugin } from "@elysiajs/static";
import { itemPlugin } from "plugins/item";

await Bun.build({
  entrypoints: ["./src/ui/bootstrap.tsx"],
  outdir: "./public",
  minify: true,
});

const app = new Elysia()
  .use(staticPlugin())
  // TODO why auth routes ignored when item plugin registered
  // .use(authPlugin)
  .use(itemPlugin)
  .get("/favicon.ico", () => file("public/favicon.ico"))
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
