export interface GitHubUser {
  login: string;
  name: string | null;
  avatar_url: string;
  bio: string | null;
  public_repos: number;
  followers: number;
  following: number;
  html_url: string;
}

export interface GitHubRepo {
  name: string;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  fork: boolean;
  size: number;
}

export interface GitHubSearchResult {
  total_count: number;
}

export interface ComputedStats {
  totalStars: number;
  totalForks: number;
  totalCommits: number;
  totalPRs: number;
  totalIssues: number;
}

export interface TopLanguage {
  name: string;
  count: number;
  percentage: number;
  color: string;
}
