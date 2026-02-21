import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { ImageResponse } from "@takumi-rs/image-response";
import { Result } from "better-result";
import { fetchUser } from "@/github/client.ts";
import { computeStats } from "@/github/stats.ts";
import { StatsCard } from "@/cards/stats.tsx";
import { usernameParam } from "@/routes/schemas.ts";
import { githubErrorResponse } from "@/routes/errors.ts";

export const statsRoute = new Hono();

statsRoute.get("/stats/:username", zValidator("param", usernameParam), async (c) => {
  const { username } = c.req.valid("param");

  const result = await Result.gen(async function* () {
    const user = yield* Result.await(fetchUser(username));
    const stats = yield* Result.await(computeStats(username));
    return Result.ok({ user, stats });
  });

  if (result.isErr()) {
    return githubErrorResponse(c, result.error);
  }

  const { user, stats } = result.value;

  return new ImageResponse(<StatsCard user={user} stats={stats} />, {
    width: 560,
    height: 185,
    format: "png",
    headers: { "Cache-Control": "public, max-age=3600, s-maxage=3600" },
  }) as Response;
});
