import { Elysia } from "elysia";
import { renderToReadableStream } from "react-dom/server";
import App from "./ui/App";
import { createElement } from "react";
import { staticPlugin } from "@elysiajs/static";

await Bun.build({
  entrypoints: ["./src/ui/bootstrap.tsx"],
  outdir: "./public",
  minify: true,
});

const app = new Elysia()
  .use(staticPlugin())
  .get("/", () => "Hello Elysia")
  .get("/react", async () => {
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
