import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { ImageResponse } from "@takumi-rs/image-response";
import { Result } from "better-result";
import { fetchUser } from "@/github/client.ts";
import { computeTopLanguages } from "@/github/langs.ts";
import { LangsCard } from "@/cards/langs.tsx";
import { usernameParam } from "@/routes/schemas.ts";

export const langsRoute = new Hono();

langsRoute.get("/langs/:username", zValidator("param", usernameParam), async (c) => {
  const { username } = c.req.valid("param");

  const result = await Result.gen(async function* () {
    const user = yield* Result.await(fetchUser(username));
    const langs = yield* Result.await(computeTopLanguages(username));
    return Result.ok({ user, langs });
  });

  if (result.isErr()) {
    const msg = result.error instanceof Error ? result.error.message : "Unknown error";
    return c.json({ error: msg }, msg.includes("not found") ? 404 : 500);
  }

  const { user, langs } = result.value;

  if (langs.length === 0) {
    return c.json({ error: "No language data found for this user" }, 404);
  }

  return new ImageResponse(<LangsCard username={user.login} langs={langs} />, {
    width: 340,
    format: "png",
    headers: { "Cache-Control": "public, max-age=3600, s-maxage=3600" },
  }) as Response;
});
