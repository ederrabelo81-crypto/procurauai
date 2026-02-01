import { env } from "@/config/env";

export type LogContext = Record<string, unknown>;

type LogLevel = "info" | "warn" | "error";

const isProduction = env.VITE_ENVIRONMENT === "production";

const log = (level: LogLevel, message: string, context?: LogContext) => {
  if (!isProduction || level === "error") {
    const payload = context ? { context } : undefined;
    switch (level) {
      case "info":
        console.info(message, payload);
        break;
      case "warn":
        console.warn(message, payload);
        break;
      case "error":
        console.error(message, payload);
        break;
      default:
        console.log(message, payload);
    }
  }
};

export const logger = {
  info: (message: string, context?: LogContext) => log("info", message, context),
  warn: (message: string, context?: LogContext) => log("warn", message, context),
  error: (message: string, context?: LogContext) => log("error", message, context),
};
