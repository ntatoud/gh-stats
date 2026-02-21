import { Result } from "better-result";
import { fetchRepos, searchCount } from "@/github/client.ts";
import type { ComputedStats } from "@/github/types.ts";

export function computeStats(username: string) {
  return Result.gen(async function* () {
    const repos = yield* Result.await(fetchRepos(username));

    const [totalCommits, totalPRs, totalIssues] = await Promise.all([
      searchCount(`author:${username} type:commit`).catch(() => 0),
      searchCount(`author:${username} type:pr is:merged`).catch(() => 0),
      searchCount(`author:${username} type:issue`).catch(() => 0),
    ]);

    const stats: ComputedStats = {
      totalStars: repos.reduce((acc, r) => acc + r.stargazers_count, 0),
      totalForks: repos.reduce((acc, r) => acc + r.forks_count, 0),
      totalCommits,
      totalPRs,
      totalIssues,
    };

    return Result.ok(stats);
  });
}
