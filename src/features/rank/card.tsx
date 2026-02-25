import "@takumi-rs/image-response";
import type { ComputedStats, GitHubUser } from "../../github/types.js";
import { getTierColor, type RankInfo } from "./service.js";

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

const RING_SIZE = 148;
const CENTER = RING_SIZE / 2;
const RADIUS = 60;
const STROKE = 12;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function RankCard({ user, stats, rank }: RankCardProps) {
  const { xp, tier } = rank;
  const tierColor = getTierColor(tier);

  const progressLength = (xp / 100) * CIRCUMFERENCE;

  return (
    <div
      tw="flex flex-col size-full px-8 py-6 relative overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #0d1117 0%, #13181f 100%)",
        fontFamily: "Geist",
      }}
    >
      <div tw="flex flex-1 items-center gap-8">
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
            <circle
              cx={CENTER}
              cy={CENTER}
              r={RADIUS}
              fill="none"
              stroke="#21262d"
              strokeWidth={STROKE}
            />
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
          <div tw="flex absolute flex-col items-center justify-center inset-0">
            <span
              tw="font-bold leading-none"
              style={{ color: tierColor, fontSize: 38 }}
            >
              {tier}
            </span>
            <span tw="text-[13px] text-[#7d8590]">@{user.login}</span>
          </div>
        </div>

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
