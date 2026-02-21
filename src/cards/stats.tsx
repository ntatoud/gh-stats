import "@takumi-rs/image-response";
import type { ComputedStats, GitHubUser } from "@/github/types.ts";

function formatValue(n: number) {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);
}

function StatItem({ label, value }: { label: string; value: number }) {
  return (
    <div tw="flex flex-col items-center gap-1 flex-1">
      <span tw="text-[22px] font-bold text-[#e6edf3] leading-none">
        {formatValue(value)}
      </span>
      <span tw="text-[11px] text-[#7d8590] uppercase tracking-wide">
        {label}
      </span>
    </div>
  );
}

function Divider() {
  return <div tw="flex w-px h-10 bg-[#21262d]" />;
}

interface StatsCardProps {
  user: GitHubUser;
  stats: ComputedStats;
}

export function StatsCard({ user, stats }: StatsCardProps) {
  const displayName = user.name ?? user.login;

  return (
    <div
      tw="flex flex-col w-full h-full px-8 py-7 relative overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #0d1117 0%, #13181f 100%)",
        fontFamily: "Geist",
      }}
    >
      {/* Background glow */}
      <div
        tw="flex absolute rounded-full"
        style={{
          top: -60,
          right: -60,
          width: 200,
          height: 200,
          background:
            "radial-gradient(circle, rgba(88,166,255,0.08) 0%, transparent 70%)",
        }}
      />

      {/* Header */}
      <div tw="flex items-center gap-4 mb-6">
        <img
          src={user.avatar_url}
          width={52}
          height={52}
          tw="rounded-full"
          style={{ border: "2px solid #30363d" }}
        />
        <div tw="flex flex-col gap-0.5">
          <span tw="text-xl font-bold text-[#e6edf3]">{displayName}</span>
          <span tw="text-[13px] text-[#7d8590]">@{user.login}</span>
        </div>
        <div
          tw="flex ml-auto rounded-2xl px-4 py-1 text-xs font-semibold text-white"
          style={{ background: "linear-gradient(135deg, #1f6feb, #388bfd)" }}
        >
          GitHub Stats
        </div>
      </div>

      {/* Divider */}
      <div
        tw="flex w-full mb-5"
        style={{
          height: 1,
          background: "linear-gradient(90deg, #21262d, #30363d, #21262d)",
        }}
      />

      {/* Stats row */}
      <div tw="flex flex-1 items-center">
        <StatItem label="Stars" value={stats.totalStars} />
        <Divider />
        <StatItem label="Commits" value={stats.totalCommits} />
        <Divider />
        <StatItem label="PRs" value={stats.totalPRs} />
        <Divider />
        <StatItem label="Issues" value={stats.totalIssues} />
        <Divider />
        <StatItem label="Followers" value={user.followers} />
        <Divider />
        <StatItem label="Repos" value={user.public_repos} />
      </div>
    </div>
  );
}
