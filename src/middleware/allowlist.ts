import type { MiddlewareHandler } from "hono";
import { env } from "../env.ts";

// Built once at startup from the validated env value
const allowedUsernames = env.ALLOWED_USERNAMES
  ? new Set(env.ALLOWED_USERNAMES)
  : null;

export const allowlist: MiddlewareHandler = async (c, next) => {
  if (allowedUsernames === null) return next();

  // c.req.param is always available for matched path params
  const username = c.req.param("username");
  if (!username || !allowedUsernames.has(username.toLowerCase())) {
    return c.json({ error: "Username not allowed" }, 403);
  }

  return next();
};
