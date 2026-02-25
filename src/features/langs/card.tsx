import "@takumi-rs/image-response/wasm";
import type { TopLanguage } from "../../github/types.ts";

function LangRow({ lang }: { lang: TopLanguage }) {
  return (
    <div tw="flex items-center gap-3">
      <div
        tw="flex rounded-full flex-shrink-0"
        style={{ width: 10, height: 10, background: lang.color }}
      />
      <span tw="text-[13px] text-[#c9d1d9]" style={{ width: 100 }}>
        {lang.name}
      </span>
      <div tw="flex flex-1 h-1.5 bg-[#21262d] rounded-full overflow-hidden">
        <div
          tw="flex h-full rounded-full"
          style={{ width: `${lang.percentage}%`, background: lang.color }}
        />
      </div>
      <span
        tw="text-[12px] text-[#7d8590]"
        style={{ width: 36, textAlign: "right" }}
      >
        {lang.percentage}%
      </span>
    </div>
  );
}

interface LangsCardProps {
  username: string;
  langs: TopLanguage[];
}

export function LangsCard({ username, langs }: LangsCardProps) {
  return (
    <div
      tw="flex flex-col w-full h-full px-8 py-7 relative overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #0d1117 0%, #13181f 100%)",
        fontFamily: "Geist",
      }}
    >
      <div
        tw="flex absolute rounded-full"
        style={{
          bottom: -40,
          left: -40,
          width: 160,
          height: 160,
          background:
            "radial-gradient(circle, rgba(163,113,247,0.07) 0%, transparent 70%)",
        }}
      />

      <div tw="flex items-center justify-between mb-5">
        <span tw="text-base font-bold text-[#e6edf3]">Most Used Languages</span>
        <span tw="text-xs text-[#7d8590]">@{username}</span>
      </div>

      <div tw="flex w-full h-2 rounded-full overflow-hidden mb-4">
        {langs.map((lang) => (
          <div
            key={lang.name}
            tw="flex h-full"
            style={{ width: `${lang.percentage}%`, background: lang.color }}
          />
        ))}
      </div>

      <div tw="flex flex-col gap-2.5 flex-1">
        {langs.map((lang) => (
          <LangRow key={lang.name} lang={lang} />
        ))}
      </div>
    </div>
  );
}
