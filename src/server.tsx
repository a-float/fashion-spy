import { staticPlugin } from "@elysiajs/static";
import { dehydrate, QueryClient } from "@tanstack/react-query";
import { Cron } from "croner";
import { Cookie, Elysia, file } from "elysia";
import { rateLimit } from "elysia-rate-limit";
import { logger, loggerPlugin } from "logger";
import { renderToReadableStream } from "react-dom/server";
import { backupDatabase } from "db/backup";
import { AuthServiceError } from "plugins/auth/auth.errors";
import { itemPlugin } from "plugins/item/item.controller";
import { ItemServiceError } from "plugins/item/item.errors";
import App, { AppProps } from "ui/App";
import { createAppRouter } from "ui/router";

if (process.env.NODE_ENV !== "production") {
  await Bun.build({
    entrypoints: ["./src/ui/bootstrap.tsx"],
    outdir: "./public",
    minify: true,
  });
}

const getCSSLinks = async () => {
  return ["/public/bootstrap.css", "/public/global.css"];
};

const cssLinks = await getCSSLinks();

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
    styleLinks: cssLinks,
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
  .use(loggerPlugin)
  .onError(({ code, error, log, set }) => {
    log?.route("error", error.toString());
    if (
      error instanceof AuthServiceError ||
      error instanceof ItemServiceError
    ) {
      set.status = 400;
      return error.message;
    }
    if (code === "VALIDATION") {
      return error.validator.Errors(error.value).First().message;
    }
    return "Oops. Something went wrong.";
  })
  .use(staticPlugin({ alwaysStatic: false }))
  .use(
    rateLimit({
      errorResponse: "Too many requests",
      duration: 60 * 1000,
      max: 240,
      skip: (req) => {
        const url = new URL(req.url);
        if (process.env.NODE_ENV === "dev") return true;
        // only count api requests
        return url.pathname.startsWith("/api");
      },
    })
  )
  .state("backupDatabaseCron", new Cron("5 */12 * * *", backupDatabase))
  // TODO Elysia issue - why auth routes ignored when item plugin registered
  // .use(authPlugin)
  .use(itemPlugin)
  .get("/favicon.ico", () => file("public/favicon.ico"))
  .get("/*", ({ params, cookie }) => renderUI("/" + params["*"], cookie))
  .listen(3000);

logger.info(
  `🦊 Elysia is running at ${process.env.URL} (${app.server?.hostname}:${app.server?.port}) in ${process.env.NODE_ENV} mode`
);

export type Server = typeof app;
