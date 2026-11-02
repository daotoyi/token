import { config } from "./config.js";

export class AppError extends Error {
  constructor(status, code, message, details) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export function asyncRoute(handler) {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}

export function assertSameOrigin(req) {
  const origin = req.get("origin");
  if (!origin) return true;
  const requestOrigin = new URL(req.protocol + "://" + req.get("host")).origin;
  if (origin === requestOrigin || origin === config.publicOrigin) return true;
  if (process.env.NODE_ENV !== "production") {
    const hostname = new URL(origin).hostname;
    return hostname === "localhost" || hostname === "127.0.0.1";
  }
  return false;
}

