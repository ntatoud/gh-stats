import { Result } from "better-result";
import { fetchRepos } from "@/github/client.ts";
import type { TopLanguage } from "@/github/types.ts";

export const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#f1e05a",
  Python: "#3572A5",
  Rust: "#dea584",
  Go: "#00ADD8",
  Java: "#b07219",
  "C++": "#f34b7d",
  C: "#555555",
  Ruby: "#701516",
  Swift: "#F05138",
  Kotlin: "#A97BFF",
  PHP: "#4F5D95",
  CSS: "#563d7c",
  HTML: "#e34c26",
  Shell: "#89e051",
  Scala: "#c22d40",
  Dart: "#00B4AB",
  Vue: "#41b883",
  Elixir: "#6e4a7e",
  Haskell: "#5e5086",
};

export function computeTopLanguages(username: string) {
  return Result.gen(async function* () {
    const repos = yield* Result.await(fetchRepos(username));

    const counts: Record<string, number> = {};
    for (const repo of repos) {
      if (repo.language) {
        counts[repo.language] = (counts[repo.language] ?? 0) + 1;
      }
    }

    const total = Object.values(counts).reduce((a, b) => a + b, 0);

    const langs: TopLanguage[] = Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 6)
      .map(([name, count]) => ({
        name,
        count,
        percentage: total > 0 ? Math.round((count / total) * 100) : 0,
        color: LANGUAGE_COLORS[name] ?? "#8b949e",
      }));

    return Result.ok(langs);
  });
}
