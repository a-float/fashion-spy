import React from "react";

type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type Route<C = unknown> = {
  path: string;
  children: Route<C>[];
  component: React.FC;
  prefetcher?: (ctx: C) => Promise<void>;
  addChildren: (route: Route<C>[]) => void;
};

export type RootRoute<C> = Route<C> & {
  path: "";
};

export function createRoute<C = unknown>(
  config: PartialBy<Omit<Route<C>, "addChildren">, "children">
): Route<C> {
  return {
    ...config,
    children: [],
    addChildren(routes) {
      routes.forEach((route) => {
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

export function createRouter<C = unknown>(
  config: ConstructorParameters<typeof Router<C>>[0]
): Router<C> {
  return new Router<C>(config);
}

export class Router<C = unknown> {
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
        const r = new RegExp(`^${child.path}(/|$)`);
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
