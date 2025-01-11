import { treaty } from "@elysiajs/eden";
import type { Server } from "server";
export const eden = treaty<Server>("localhost:3000");
