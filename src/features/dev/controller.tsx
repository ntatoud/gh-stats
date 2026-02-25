import { ImageResponse } from "@takumi-rs/image-response";
import { LangsCard } from "../langs/card.tsx";
import { RankCard } from "../rank/card.tsx";
import { computeRank } from "../rank/service.ts";
import type { ComputedStats, GitHubUser, TopLanguage } from "../../github/types.ts";

const MOCK_USER: GitHubUser = {
  login: "octocat",
  name: "The Octocat",
  avatar_url: "https://avatars.githubusercontent.com/u/583231?v=4",
  bio: "How people build software.",
  public_repos: 8,
  followers: 14000,
  following: 9,
  html_url: "https://github.com/octocat",
};

const MOCK_STATS: ComputedStats = {
  totalStars: 2840,
  totalForks: 1200,
  totalCommits: 4621,
  totalPRs: 312,
  totalIssues: 189,
};

const MOCK_LANGS: TopLanguage[] = [
  { name: "TypeScript", count: 24, percentage: 42, color: "#3178c6" },
  { name: "Rust", count: 14, percentage: 25, color: "#dea584" },
  { name: "Python", count: 10, percentage: 17, color: "#3572A5" },
  { name: "Go", count: 5, percentage: 9, color: "#00ADD8" },
  { name: "Shell", count: 3, percentage: 5, color: "#89e051" },
  { name: "CSS", count: 1, percentage: 2, color: "#563d7c" },
];

export function devLangsController() {
  return new ImageResponse(
    <LangsCard username={MOCK_USER.login} langs={MOCK_LANGS} />,
    { width: 340, format: "png" }
  ) as Response;
}

export function devRankController() {
  const rank = computeRank(MOCK_STATS, MOCK_USER);
  return new ImageResponse(
    <RankCard user={MOCK_USER} stats={MOCK_STATS} rank={rank} />,
    { width: 400, height: 300, format: "png" }
  ) as Response;
}
