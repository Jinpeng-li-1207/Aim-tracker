import { Shield } from "lucide-react";
import { TIER_META } from "@/lib/constants";
import type { Tier } from "@/lib/types";

interface Props {
  tier: Tier;
  size?: "sm" | "md" | "lg";
  showEn?: boolean;
}

export function RankBadge({ tier, size = "md", showEn = false }: Props) {
  const meta = TIER_META[tier];
  const icon = size === "lg" ? 26 : size === "sm" ? 15 : 20;
  const text = size === "lg" ? "text-xl" : size === "sm" ? "text-xs" : "text-base";
  return (
    <span className="inline-flex items-center gap-1.5">
      <Shield size={icon} style={{ color: meta.color }} strokeWidth={2.2} />
      <span className={text} style={{ color: meta.color }}>
        {meta.zh}
        {showEn && <span className="ml-1 text-dim text-[0.7em]">{meta.en}</span>}
      </span>
    </span>
  );
}
