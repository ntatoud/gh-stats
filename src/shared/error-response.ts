import { matchError } from "better-result";
import type { GitHubError } from "../github/errors";

export function githubErrorResponse(error: GitHubError): Response {
  return matchError(error, {
    UserNotFoundError: (e) =>
      Response.json({ error: { code: "USER_NOT_FOUND", message: e.message } }, { status: 404 }),
    RateLimitError: (e) =>
      Response.json({ error: { code: "RATE_LIMIT_EXCEEDED", message: e.message } }, { status: 429 }),
    GitHubApiError: (e) =>
      Response.json({ error: { code: "GITHUB_API_ERROR", message: e.message } }, { status: 502 }),
  });
}
