import { treaty } from "@elysiajs/eden";
import type { Server } from "server";

export const eden = treaty<Server>(process.env.URL as string);
