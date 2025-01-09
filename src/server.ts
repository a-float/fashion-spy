import { Elysia, file } from "elysia";
import { renderToReadableStream } from "react-dom/server";
import App from "./ui/App";
import { createElement } from "react";
import { staticPlugin } from "@elysiajs/static";
import { authPlugin } from "plugins/user";

await Bun.build({
  entrypoints: ["./src/ui/bootstrap.tsx"],
  outdir: "./public",
  minify: true,
});

const app = new Elysia()
  .use(staticPlugin())
  .get("/favicon.ico", () => file("public/favicon.ico"))
  .group("/api", (app) => app.use(authPlugin))
  .get("/", async () => {
    const page = createElement(App);
    const stream = await renderToReadableStream(page, {
      bootstrapModules: ["/public/bootstrap.js"],
    });
    return new Response(stream, { headers: { "Content-Type": "text/html" } });
  })
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
