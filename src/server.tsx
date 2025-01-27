import { Elysia, file } from "elysia";
import { renderToReadableStream } from "react-dom/server";
import { staticPlugin } from "@elysiajs/static";
import { itemPlugin } from "plugins/item";
import path from "path";
import fs from "node:fs/promises";
import App, { AppProps } from "ui/App";
import { createAppRouter } from "ui/router/appRouter";
import { getRouteForPathname } from "ui/router/router";
import { dehydrate, QueryClient } from "@tanstack/react-query";

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

const renderUI = async (location: string, token?: string) => {
  // const queryClient = new QueryClient();
  // const memoryHistory = createMemoryHistory({ initialEntries: [location] });
  // const router = createRouter({
  //   context: { queryClient },
  //   history: memoryHistory,
  // });
  // const route = getRouteApi("/");
  // console.log({ route });

  // const dehydratedState = dehydrate(queryClient);

  const router = createAppRouter();
  const queryClient = new QueryClient();
  router.ssrLocation = location;
  router.context = { queryClient, token };
  const route = getRouteForPathname(router, location)!;
  await route?.loader?.(router.context);
  const dehydratedState = dehydrate(queryClient);
  const ssrProps: AppProps = {
    styleLinks: links,
    dehydratedState,
    location,
  };
  const app = <App {...ssrProps} />;
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
  .get("/*", ({ params, cookie: { token } }) =>
    renderUI("/" + params["*"], token?.value)
  )
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);

export type Server = typeof app;
