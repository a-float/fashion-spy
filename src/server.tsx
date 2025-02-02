import fs from "node:fs/promises";
import { staticPlugin } from "@elysiajs/static";
import { dehydrate, QueryClient } from "@tanstack/react-query";
import { Cookie, Elysia, file } from "elysia";
import path from "path";
import { renderToReadableStream } from "react-dom/server";
import { itemPlugin } from "plugins/item";
import App, { AppProps } from "ui/App";
import { createAppRouter } from "ui/router";

await Bun.build({
  entrypoints: ["./src/ui/bootstrap.tsx"],
  outdir: "./public",
  minify: true,
});

const getCSSLinks = async () => {
  // TODO cache
  const publicPath = path.resolve("public");
  const cssFiles = (await fs.readdir(publicPath)).filter(
    (file) => file.includes("styles") && file.endsWith(".css")
  );
  return cssFiles.map((file) => `/public/${file}`);
};

const links = await getCSSLinks();

const renderUI = async (
  location: string,
  cookie: Record<string, Cookie<string | undefined>>
) => {
  const token = cookie.token?.value;
  const colorScheme = cookie.colorScheme?.value;

  const queryClient = new QueryClient();
  const router = createAppRouter({ ctx: { queryClient, token } });
  await router.prefetchRoutesForPathname(location);
  const dehydratedState = dehydrate(queryClient);
  const ssrProps: AppProps = {
    styleLinks: links,
    dehydratedState,
    location,
  };
  const app = <App {...ssrProps} colorScheme={colorScheme} />;
  const stream = await renderToReadableStream(app, {
    bootstrapModules: ["/public/bootstrap.js"],
    bootstrapScriptContent: `window.__INITIAL_DATA__ = ${JSON.stringify(
      ssrProps
    )}`,
  });

  return new Response(stream, { headers: { "Content-Type": "text/html" } });
};

const app = new Elysia()
  .use(staticPlugin())
  // TODO why auth routes ignored when item plugin registered
  // .use(authPlugin)
  .use(itemPlugin)
  .get("/favicon.ico", () => file("public/favicon.ico"))
  .get("/*", ({ params, cookie }) => renderUI("/" + params["*"], cookie))
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);

export type Server = typeof app;
