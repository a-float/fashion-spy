import React from "react";
import { Router } from "./Router";
import { OutletContext } from "./Outlet";

const RouterContext = React.createContext<{ router: Router<any> } | null>(null);

type PushState = (typeof history)["pushState"];

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
