import { Result } from "better-result";
import { env } from "../env";
import {
  GitHubApiError,
  RateLimitError,
  UserNotFoundError,
  toGitHubError,
} from "./errors";
import type { GitHubRepo, GitHubSearchResult, GitHubUser } from "./types";

function getHeaders(): Record<string, string> {
  return {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    ...(env.GITHUB_TOKEN ? { Authorization: `Bearer ${env.GITHUB_TOKEN}` } : {}),
  };
}

async function githubFetch<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: getHeaders() });

  if (res.status === 404) throw new UserNotFoundError({ message: "User not found" });
  if (res.status === 403) throw new RateLimitError({ message: "GitHub API rate limit exceeded" });
  if (!res.ok) throw new GitHubApiError({ status: res.status, message: `GitHub API error: ${res.status}` });

  return res.json() as Promise<T>;
}

export function fetchUser(username: string) {
  return Result.tryPromise({
    try: () => githubFetch<GitHubUser>(`https://api.github.com/users/${username}`),
    catch: toGitHubError,
  });
}

export function fetchRepos(username: string) {
  return Result.tryPromise({
    try: () =>
      githubFetch<GitHubRepo[]>(
        `https://api.github.com/users/${username}/repos?per_page=100&type=owner`
      ),
    catch: toGitHubError,
  });
}

export async function searchIssuesCount(query: string): Promise<number> {
  const data = await githubFetch<GitHubSearchResult>(
    `https://api.github.com/search/issues?q=${encodeURIComponent(query)}&per_page=1`
  );
  return data.total_count;
}

export async function searchCommitsCount(query: string): Promise<number> {
  const data = await githubFetch<GitHubSearchResult>(
    `https://api.github.com/search/commits?q=${encodeURIComponent(query)}&per_page=1`
  );
  return data.total_count;
}
