import type { Context } from "hono";
import { ImageResponse } from "@takumi-rs/image-response";
import { Result } from "better-result";
import { fetchUser } from "../../github/client.js";
import { githubErrorResponse } from "../../shared/error-response.js";
import { computeStats, computeRank } from "./service.js";
import { RankCard } from "./card.js";
import { imageCache } from "../../shared/cache.js";

const CACHE_HEADERS = { "Cache-Control": "public, max-age=86400, s-maxage=86400" };

export async function rankController(
  c: Context,
  { username }: { username: string },
): Promise<Response> {
  const cached = imageCache.get(`rank:${username}`);
  if (cached) {
    return new Response(cached, {
      headers: { "Content-Type": "image/png", ...CACHE_HEADERS },
    });
  }

  const result = await Result.gen(async function* () {
    const user = yield* Result.await(fetchUser(username));
    const stats = yield* Result.await(computeStats(username));
    return Result.ok({ user, stats });
  });

  if (result.isErr()) {
    return githubErrorResponse(c, result.error) as Response;
  }

  const { user, stats } = result.value;
  const rank = computeRank(stats, user);

  const response = new ImageResponse(<RankCard user={user} stats={stats} rank={rank} />, {
    width: 400,
    height: 300,
    format: "png",
  }) as Response;

  const bytes = await response.arrayBuffer();
  imageCache.set(`rank:${username}`, bytes);

  return new Response(bytes, {
    headers: { "Content-Type": "image/png", ...CACHE_HEADERS },
  });
}
