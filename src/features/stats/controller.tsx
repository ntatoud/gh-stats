import type { Context } from "hono";
import { ImageResponse } from "@takumi-rs/image-response";
import { Result } from "better-result";
import { fetchUser } from "@/github/client.ts";
import { githubErrorResponse } from "@/shared/error-response.ts";
import { computeStats } from "@/features/stats/service.ts";
import { StatsCard } from "@/features/stats/card.tsx";

export async function statsController(
  c: Context,
  { username }: { username: string }
) {
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
}
