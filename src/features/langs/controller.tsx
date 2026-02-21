import type { Context } from "hono";
import { ImageResponse } from "@takumi-rs/image-response";
import { Result } from "better-result";
import { fetchUser } from "@/github/client.ts";
import { githubErrorResponse } from "@/shared/error-response.ts";
import { computeTopLanguages } from "@/features/langs/service.ts";
import { LangsCard } from "@/features/langs/card.tsx";

export async function langsController(
  c: Context,
  { username }: { username: string }
) {
  const result = await Result.gen(async function* () {
    const user = yield* Result.await(fetchUser(username));
    const langs = yield* Result.await(computeTopLanguages(username));
    return Result.ok({ user, langs });
  });

  if (result.isErr()) {
    return githubErrorResponse(c, result.error);
  }

  const { user, langs } = result.value;

  if (langs.length === 0) {
    return c.json(
      { error: { code: "NO_LANGUAGE_DATA", message: "No language data found for this user" } },
      404
    );
  }

  return new ImageResponse(<LangsCard username={user.login} langs={langs} />, {
    width: 340,
    format: "png",
    headers: { "Cache-Control": "public, max-age=3600, s-maxage=3600" },
  }) as Response;
}
