import { QueryClient } from "@tanstack/react-query";
import { createRootRoute, createRoute, createRouter } from "ui/lib/routing";
import AdminPage from "ui/routes/AdminPage";
import Homepage from "ui/routes/Homepage";
import {
  getFetchItemsOptions,
  getFetchProfileOptions,
  getFetchUsersOptions,
} from "ui/query";
import Root from "ui/routes/Root";
import NotFound from "ui/routes/NotFound";

type Context = {
  queryClient: QueryClient;
  token?: string;
};

const rootRoute = createRootRoute({
  component: Root,
  prefetcher: async (ctx: Context) =>
    ctx.queryClient.prefetchQuery(getFetchProfileOptions(ctx.token)),
});

const homeRoute = createRoute({
  component: Homepage,
  path: "/",
  prefetcher: async (ctx: Context) =>
    ctx.queryClient.prefetchQuery(getFetchItemsOptions(ctx.token)),
});

const adminRoute = createRoute({
  component: AdminPage,
  path: "/admin",
  prefetcher: async (ctx: Context) =>
    ctx.queryClient.prefetchQuery(getFetchUsersOptions(ctx.token)),
});

rootRoute.addChildren([homeRoute, adminRoute]);

export const createAppRouter = (config: {
  staticLocation?: string;
  ctx: Context;
}) =>
  createRouter({
    rootRoute,
    notFoundComponent: NotFound,
    context: config.ctx,
  });
