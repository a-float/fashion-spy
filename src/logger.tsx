import Elysia from "elysia";
import winston from "winston";

const { combine, timestamp, printf, colorize, errors } = winston.format;

const logFormat = combine(
  timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  printf(({ level, message, timestamp, stack }) => {
    return `${timestamp} [${level}]: ${stack || message}`;
  })
);

export const logger = winston.createLogger({
  level: "debug",
  format: combine(errors({ stack: true }), logFormat),
  transports: [
    new winston.transports.Console({
      format: combine(colorize(), logFormat),
    }),
    new winston.transports.File({ filename: "logs/error.log", level: "error" }),
    new winston.transports.File({ filename: "logs/combined.log" }),
  ],
});

const ignoreRegex = /^\/(public|favicon.ico)/;

export const loggerPlugin = new Elysia({ name: "logger" })
  .derive(({ request }) => {
    return {
      log: {
        route(level: "info" | "warn" | "error" | "http", message?: string) {
          const pathname = new URL(request.url).pathname;
          const method = request.method;
          logger[level](`${method} ${pathname}${message ? " " + message : ""}`);
        },
      },
    };
  })
  .onBeforeHandle({ as: "global" }, ({ request, log }) => {
    const url = new URL(request.url);
    const pathname = url.pathname + url.search;
    if (ignoreRegex.test(pathname)) return;
    log?.route("http");
  })
  .as("plugin");
