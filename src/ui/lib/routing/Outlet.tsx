import React from "react";
import { Route } from "./Router";

export const OutletContext = React.createContext<{
  routes: Route<any>[];
  depth: number;
} | null>(null);

const useOutletContext = () => {
  const ctx = React.use(OutletContext);
  if (!ctx) throw new Error("Outlet must be used inside RouterProvider");
  return ctx;
};

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
