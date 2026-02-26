import { env } from "../env";

const allowedUsernames = env.ALLOWED_USERNAMES ? new Set(env.ALLOWED_USERNAMES) : null;

export function checkAllowlist(username: string): Response | null {
  if (!allowedUsernames) return null;
  if (!allowedUsernames.has(username.toLowerCase()))
    return Response.json({ error: "Username not allowed" }, { status: 403 });
  return null;
}
