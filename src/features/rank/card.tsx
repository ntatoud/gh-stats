import "@takumi-rs/image-response";
import type { ComputedStats, GitHubUser } from "@/github/types.ts";
import type { RankInfo } from "@/features/rank/service.ts";
import { getTierColor } from "@/features/rank/service.ts";

function formatValue(n: number) {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);
}

function StatRow({ label, value }: { label: string; value: number }) {
  return (
    <div tw="flex items-center justify-between w-full">
      <span tw="text-[12px] text-[#7d8590] uppercase tracking-wide">
        {label}
      </span>
      <span tw="text-[14px] font-bold text-[#e6edf3]">
        {formatValue(value)}
      </span>
    </div>
  );
}

interface RankCardProps {
  user: GitHubUser;
  stats: ComputedStats;
  rank: RankInfo;
}

export function RankCard({ user, stats, rank }: RankCardProps) {
  const displayName = user.name ?? user.login;
  const { xp, tier } = rank;
  const tierColor = getTierColor(tier);

  const RING_SIZE = 148;
  const CENTER = RING_SIZE / 2; // 74
  const RADIUS = 60;
  const STROKE = 12;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
  const progressLength = (xp / 100) * CIRCUMFERENCE;

  return (
    <div
      tw="flex flex-col w-full h-full px-8 py-6 relative overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #0d1117 0%, #13181f 100%)",
        fontFamily: "Geist",
      }}
    >
      {/* Header */}
      <div tw="flex items-center gap-4 mb-5">
        <img
          src={user.avatar_url}
          width={48}
          height={48}
          tw="rounded-full"
          style={{ border: "2px solid #30363d" }}
        />
        <div tw="flex flex-col gap-0.5">
          <span tw="text-lg font-bold text-[#e6edf3]">{displayName}</span>
          <span tw="text-[13px] text-[#7d8590]">@{user.login}</span>
        </div>
        <div
          tw="flex ml-auto rounded-2xl px-4 py-1 text-xs font-semibold"
          style={{
            background: `${tierColor}22`,
            color: tierColor,
            border: `1px solid ${tierColor}55`,
          }}
        >
          Rank Card
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

      {/* Body */}
      <div tw="flex flex-1 items-center gap-8">
        {/* Progress ring: SVG circles + HTML text overlay in a relative container */}
        <div
          tw="flex relative"
          style={{ width: RING_SIZE, height: RING_SIZE, flexShrink: 0 }}
        >
          <svg
            width={RING_SIZE}
            height={RING_SIZE}
            viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}
            style={{ position: "absolute", top: 0, left: 0 }}
          >
            {/* Track */}
            <circle
              cx={CENTER}
              cy={CENTER}
              r={RADIUS}
              fill="none"
              stroke="#21262d"
              strokeWidth={STROKE}
            />
            {/* Progress arc */}
            <circle
              cx={CENTER}
              cy={CENTER}
              r={RADIUS}
              fill="none"
              stroke={tierColor}
              strokeWidth={STROKE}
              strokeDasharray={`${progressLength} ${CIRCUMFERENCE}`}
              strokeLinecap="round"
              transform={`rotate(-90 ${CENTER} ${CENTER})`}
            />
          </svg>
          {/* Text overlay — HTML so Takumi renders fonts correctly */}
          <div
            tw="flex absolute flex-col items-center justify-center"
            style={{ top: 0, left: 0, right: 0, bottom: 0 }}
          >
            <span
              tw="font-bold leading-none"
              style={{ color: tierColor, fontSize: 38 }}
            >
              {tier}
            </span>
            <span tw="mt-1" style={{ color: "#7d8590", fontSize: 11 }}>
              {xp.toFixed(1)} / 100
            </span>
          </div>
        </div>

        {/* Stats */}
        <div tw="flex flex-col flex-1 gap-3">
          <StatRow label="Stars" value={stats.totalStars} />
          <StatRow label="Commits" value={stats.totalCommits} />
          <StatRow label="PRs" value={stats.totalPRs} />
          <StatRow label="Issues" value={stats.totalIssues} />
          <StatRow label="Followers" value={user.followers} />
        </div>
      </div>
    </div>
  );
}
