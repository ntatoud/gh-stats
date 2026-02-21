import { TaggedError } from "better-result";

export class UserNotFoundError extends TaggedError("UserNotFoundError")<{
  message: string;
}>() {}

export class RateLimitError extends TaggedError("RateLimitError")<{
  message: string;
}>() {}

export class GitHubApiError extends TaggedError("GitHubApiError")<{
  status: number;
  message: string;
}>() {}

export type GitHubError = UserNotFoundError | RateLimitError | GitHubApiError;

export function toGitHubError(e: unknown): GitHubError {
  if (
    e instanceof UserNotFoundError ||
    e instanceof RateLimitError ||
    e instanceof GitHubApiError
  ) {
    return e;
  }
  return new GitHubApiError({
    status: 0,
    message: e instanceof Error ? e.message : String(e),
  });
}
