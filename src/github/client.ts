import { Result } from "better-result";
import { env } from "@/env.ts";
import type { GitHubRepo, GitHubSearchResult, GitHubUser } from "@/github/types.ts";

function getHeaders(): HeadersInit {
  return {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    ...(env.GITHUB_TOKEN ? { Authorization: `Bearer ${env.GITHUB_TOKEN}` } : {}),
  };
}

async function githubFetch<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: getHeaders() });

  if (res.status === 404) throw new Error("User not found");
  if (res.status === 403) throw new Error("GitHub API rate limit exceeded");
  if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);

  return res.json() as Promise<T>;
}

export function fetchUser(username: string) {
  return Result.tryPromise(() =>
    githubFetch<GitHubUser>(`https://api.github.com/users/${username}`)
  );
}

export function fetchRepos(username: string) {
  return Result.tryPromise(() =>
    githubFetch<GitHubRepo[]>(
      `https://api.github.com/users/${username}/repos?per_page=100&type=owner`
    )
  );
}

export async function searchCount(query: string): Promise<number> {
  const data = await githubFetch<GitHubSearchResult>(
    `https://api.github.com/search/issues?q=${encodeURIComponent(query)}&per_page=1`
  );
  return data.total_count;
}
