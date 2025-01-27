import { QueryClient } from "@tanstack/react-query";
import { createRoute, createRouter } from "ui/router/router";
import AdminPage from "ui/components/AdminPage";
import Homepage from "ui/components/Homepage";
import { fetchProfile, fetchItems, fetchUsers } from "ui/query";

export const createAppRouter = () =>
  createRouter<{ queryClient?: QueryClient; token?: string }>({
    context: { queryClient: undefined },
    routes: [
      createRoute({
        component: Homepage,
        path: "/",
        loader: async (ctx) => {
          console.log("Start prefetching");
          await Promise.allSettled([
            ctx.queryClient?.prefetchQuery({
              queryKey: ["user"],
              queryFn: () => fetchProfile(ctx.token),
            }),
            ctx.queryClient?.prefetchQuery({
              queryKey: ["items"],
              queryFn: () => fetchItems(ctx.token),
            }),
          ]);
          console.log("End prefetching");
        },
      }),
      createRoute({
        component: AdminPage,
        path: "/admin",
        loader: async (ctx) => {
          await Promise.allSettled([
            ctx.queryClient?.prefetchQuery({
              queryKey: ["user"],
              queryFn: () => fetchProfile(ctx.token),
            }),
            ctx.queryClient?.prefetchQuery({
              queryKey: ["users"],
              queryFn: fetchUsers,
            }),
          ]);
        },
      }),
    ],
  });
