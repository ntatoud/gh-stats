import type { ComputedStats, GitHubUser } from "@/github/types.ts";

export const TIERS = [
  "E",
  "E+",
  "D",
  "D+",
  "C",
  "C+",
  "B",
  "B+",
  "A",
  "A+",
  "S",
  "S+",
] as const;

export type Tier = (typeof TIERS)[number];

export interface RankInfo {
  xp: number; // 0–100
  tier: Tier;
  tierIndex: number; // 0–11
}

// Minimum XP required to enter each tier
// Calibrated for last-365-days activity data
const TIER_THRESHOLDS = [0, 10, 20, 30, 40, 55, 63, 67, 74, 81, 87, 91];

function logScale(value: number, max: number): number {
  return Math.log1p(value) / Math.log1p(max);
}

export function computeRank(
  stats: ComputedStats,
  user: GitHubUser
): RankInfo {
  // Caps tuned for yearly activity (commits/PRs/issues) vs all-time (stars/followers)
  const starsScore = logScale(stats.totalStars, 10000) * 30;
  const commitsScore = logScale(stats.totalCommits, 1500) * 25;
  const prsScore = logScale(stats.totalPRs, 300) * 25;
  const issuesScore = logScale(stats.totalIssues, 150) * 10;
  const followersScore = logScale(user.followers, 10000) * 10;

  const xp = Math.min(
    starsScore + commitsScore + prsScore + issuesScore + followersScore,
    100
  );

  let tierIndex = 0;
  for (let i = TIERS.length - 1; i >= 0; i--) {
    if (xp >= (TIER_THRESHOLDS[i] ?? 0)) {
      tierIndex = i;
      break;
    }
  }

  return {
    xp: Math.round(xp * 10) / 10,
    tier: TIERS[tierIndex] as Tier,
    tierIndex,
  };
}

export function getTierColor(tier: Tier): string {
  const colors: Record<Tier, string> = {
    E: "#6e7681",
    "E+": "#6e7681",
    D: "#00b4d8",
    "D+": "#00b4d8",
    C: "#3fb950",
    "C+": "#3fb950",
    B: "#58a6ff",
    "B+": "#58a6ff",
    A: "#bc8cff",
    "A+": "#bc8cff",
    S: "#e3b341",
    "S+": "#ff7b72",
  };
  return colors[tier];
}
