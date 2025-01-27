import React from "react";

type Route<Context extends unknown = undefined> = {
  path: string;
  component: React.FC;
  loader?: (ctx: Context) => Promise<void>;
};

export function getRouteForPathname<C = undefined>(
  router: Router<C>,
  pathname: string
): undefined | Route<C> {
  return (
    router.routes
      .filter((route) => {
        const p = pathname.endsWith("/") ? pathname : pathname + "/";
        return p.startsWith(route.path);
      })
      .at(-1) ?? router.notFoundRoute
  );
}

type Router<Context extends unknown = undefined> = {
  routes: Route<Context>[];
  notFoundRoute?: Route<Context>;
  ssrLocation?: string;
} & (Context extends undefined ? {} : { context: Context });

export function createRoute<C = undefined>(config: Route<C>): Route<C> {
  return { ...config };
}

export function createRouter<C = undefined>(config: Router<C>): Router<C> {
  return { ...config, routes: config.routes as Route<C>[] };
}

type LinkProps = Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
  to: string;
};

export function Link({ to, ...rest }: LinkProps) {
  return (
    <a
      {...rest}
      href={to}
      onClick={(e) => {
        e.preventDefault();
        history.pushState({}, "", to);
      }}
    />
  );
}

export function RouterProvider<Context = never>(props: {
  router: Router<Context>;
}): React.ReactNode {
  const [pathname, setPathname] = React.useState<string>(
    typeof window !== "undefined"
      ? window?.location.pathname
      : props.router.ssrLocation ?? "/"
  );
  const pushRef = React.useRef<(typeof history)["pushState"]>(null);

  const updatePathname = (pathane?: string) => {
    if (pathane) return setPathname(pathane);
    if (typeof window !== "undefined") setPathname(window.location.pathname);
  };

  const handlePopState = (e: PopStateEvent) => {
    updatePathname();
  };

  const handleHistoryPush: (typeof history)["pushState"] = (
    data,
    unused,
    url
  ) => {
    if (typeof url === "string") setPathname(url);
    else if (url) setPathname(url.pathname);
  };

  React.useEffect(() => {
    pushRef.current = window.history.pushState;
    window.history.pushState = (
      ...args: Parameters<(typeof history)["pushState"]>
    ) => {
      handleHistoryPush(...args);
      if (pushRef.current) pushRef.current.apply(window.history, args);
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      if (pushRef.current) window.history.pushState = pushRef.current;
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  const route = getRouteForPathname(props.router, pathname);
  const Component = route?.component || (() => "Not found");

  return <Component />;
}
