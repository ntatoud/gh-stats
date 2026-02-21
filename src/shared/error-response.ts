import { matchError } from "better-result";
import type { Context } from "hono";
import type { GitHubError } from "@/github/errors.ts";

interface ErrorBody {
  code: string;
  message: string;
}

function body(code: string, message: string): { error: ErrorBody } {
  return { error: { code, message } };
}

export function githubErrorResponse(c: Context, error: GitHubError) {
  return matchError(error, {
    UserNotFoundError: (e) => c.json(body("USER_NOT_FOUND", e.message), 404),
    RateLimitError: (e) => c.json(body("RATE_LIMIT_EXCEEDED", e.message), 429),
    GitHubApiError: (e) => c.json(body("GITHUB_API_ERROR", e.message), 502),
  });
}
