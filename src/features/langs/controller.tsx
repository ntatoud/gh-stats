import { ImageResponse } from "@takumi-rs/image-response";
import { Result } from "better-result";
import { fetchUser } from "../../github/client";
import { githubErrorResponse } from "../../shared/error-response";
import { computeTopLanguages } from "./service";
import { LangsCard } from "./card";
import { imageCache } from "../../shared/cache";

const CACHE_HEADERS = { "Cache-Control": "public, max-age=86400, s-maxage=86400" };

export async function langsController(username: string): Promise<Response> {
  const cached = imageCache.get(`langs:${username}`);
  if (cached) {
    return new Response(cached, {
      headers: { "Content-Type": "image/png", ...CACHE_HEADERS },
    });
  }

  const result = await Result.gen(async function* () {
    const user = yield* Result.await(fetchUser(username));
    const langs = yield* Result.await(computeTopLanguages(username));
    return Result.ok({ user, langs });
  });

  if (result.isErr()) {
    return githubErrorResponse(result.error);
  }

  const { user, langs } = result.value;

  if (langs.length === 0) {
    return Response.json(
      { error: { code: "NO_LANGUAGE_DATA", message: "No language data found for this user" } },
      { status: 404 }
    );
  }

  const response = new ImageResponse(<LangsCard username={user.login} langs={langs} />, {
    width: 340,
    format: "png",
  }) as Response;

  const bytes = await response.arrayBuffer();
  imageCache.set(`langs:${username}`, bytes);

  return new Response(bytes, {
    headers: { "Content-Type": "image/png", ...CACHE_HEADERS },
  });
}
