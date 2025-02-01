import React from "react";

type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

type PushState = (typeof history)["pushState"];

type Route<C extends unknown = unknown> = {
  path: string;
  children: Route<C>[];
  parent: null | Route<any>;
  component: React.FC;
  prefetcher?: (ctx: C) => Promise<void>;
  addChildren: (route: Route<C>[]) => void;
};

type RootRoute<C> = Route<C> & {
  path: "";
  parent: null;
};

export function createRoute<C = unknown>(
  config: PartialBy<Omit<Route<C>, "addChildren" | "parent">, "children">
): Route<C> {
  return {
    ...config,
    children: [],
    parent: null,
    addChildren(routes) {
      routes.forEach((route) => {
        route.parent = this;
        this.children.push(route);
      });
    },
  };
}

export function createRootRoute<C = unknown>(
  config: Omit<Parameters<typeof createRoute<C>>[0], "path">
) {
  return createRoute<C>({ ...config, path: "" }) as RootRoute<C>;
}

class Router<C = unknown> {
  constructor(
    private state: {
      rootRoute: RootRoute<C>;
      notFoundComponent?: React.FC;
      context: C;
    }
  ) {}

  public async prefetchRoutesForPathname(pathname: string) {
    const routes = this.getRoutesForPathname(pathname);
    return Promise.all(
      routes.map((r) =>
        r.prefetcher ? r.prefetcher(this.state.context) : Promise.resolve()
      )
    );
  }

  private createNotFoundRoute(): Route<C> {
    return createRoute({
      component: this.state.notFoundComponent ?? (() => null),
      path: "NOT_FOUND",
    });
  }

  navigate(to: string) {
    history.pushState({}, "", to);
  }

  getRoutesForPathname(pathname: string): Route<C>[] {
    let node: Route<C> = this.state.rootRoute;
    const routes = [node];
    let path = pathname;
    while (true) {
      for (const child of node.children) {
        const r = new RegExp(`^${child.path}(\/|$)`);
        const m = path.match(r);
        if (m) {
          routes.push(child);
          node = child;
          path = pathname.replace(r, "");
          continue;
        }
      }
      break;
    }
    if (path === "" || path === "/") return routes;
    return [...routes, this.createNotFoundRoute()];
  }

  public get notFoundComponent(): React.FC {
    return this.state.notFoundComponent ?? (() => "Not found");
  }
}

export function createRouter<C = unknown>(
  config: ConstructorParameters<typeof Router<C>>[0]
): Router<C> {
  return new Router<C>(config);
}

type LinkProps = Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
  to: string;
};

export function Link({ to, ...rest }: LinkProps) {
  const { router } = useRouter();
  return (
    <a
      {...rest}
      href={to}
      onClick={(e) => {
        e.preventDefault();
        router.navigate(to);
      }}
    />
  );
}

const RouterContext = React.createContext<{ router: Router<any> } | null>(null);

export const useRouter = () => {
  const ctx = React.use(RouterContext);
  if (!ctx) throw new Error("Outlet must be used inside RouterProvider");
  return ctx;
};

export function RouterProvider<C>(props: {
  router: Router<C>;
  staticPathname?: string;
}): React.ReactNode {
  if (typeof window === "undefined" && !props.staticPathname) {
    throw new Error("statisPathname is required during ssr");
  }
  const [pathname, setPathname] = React.useState<string>(
    typeof window !== "undefined"
      ? window.location.pathname
      : props.staticPathname ?? "/" // TODO remove?
  );
  const pushRef = React.useRef<PushState>(null);

  const updatePathname = (pathname?: string) => {
    if (pathname) return setPathname(pathname);
    if (typeof window !== "undefined") setPathname(window.location.pathname);
  };

  const handlePopState = (e: PopStateEvent) => {
    updatePathname();
  };

  const handleHistoryPush: PushState = (data, unused, url) => {
    if (typeof url === "string") setPathname(url);
    else if (url) setPathname(url.pathname);
  };

  React.useEffect(() => {
    pushRef.current = window.history.pushState;
    window.history.pushState = (...args: Parameters<PushState>) => {
      handleHistoryPush(...args);
      if (pushRef.current) pushRef.current.apply(window.history, args);
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      if (pushRef.current) window.history.pushState = pushRef.current;
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  const routes = props.router.getRoutesForPathname(pathname);
  const Component = routes[0].component;

  return (
    <RouterContext.Provider value={{ router: props.router }}>
      <OutletContext.Provider value={{ routes, depth: 1 }}>
        <Component />
      </OutletContext.Provider>
    </RouterContext.Provider>
  );
}

const useOutletContext = () => {
  const ctx = React.use(OutletContext);
  if (!ctx) throw new Error("Outlet must be used inside RouterProvider");
  return ctx;
};

const OutletContext = React.createContext<{
  routes: Route<any>[];
  depth: number;
} | null>(null);

export function Outlet() {
  const { routes, depth } = useOutletContext();
  const route = routes.at(depth);
  if (route) {
    const Component = route.component;
    return (
      <OutletContext.Provider value={{ routes, depth: depth + 1 }}>
        <Component />
      </OutletContext.Provider>
    );
  }
  console.warn(`Empty Outlet at depth ${depth}`);
}
