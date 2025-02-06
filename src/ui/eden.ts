import { treaty } from "@elysiajs/eden";
import type { Server } from "server";

export const eden = treaty<Server>(
  typeof window !== "undefined"
    ? window.location.origin
    : (process.env.URL as string)
);
