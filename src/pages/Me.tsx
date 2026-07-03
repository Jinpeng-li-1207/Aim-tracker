import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { Download, ChevronDown, ChevronRight } from "lucide-react";
import { db } from "@/lib/db";
import { TIER_ORDER, TIER_META } from "@/lib/constants";
import { CalibrationEditor } from "@/components/settings/CalibrationEditor";
import type { Tier } from "@/lib/types";

export function Me() {
  const profile = useLiveQuery(() => db.profile.get("me"), []);
  const sessionCount = useLiveQuery(() => db.sessions.count(), []) ?? 0;
  const [calOpen, setCalOpen] = useState(false);

  const mergeProfile = async (patch: Partial<{ gameRank: Tier; sensitivity: number; dpi: number }>) => {
    const existing = await db.profile.get("me");
    await db.profile.put({ id: "me", ...(existing ?? {}), ...patch, updatedAt: new Date().toISOString() });
  };
  const setGameRank = (tier: Tier) => mergeProfile({ gameRank: tier });

  const exportData = async () => {
    const sessions = await db.sessions.toArray();
    const templates = await db.templates.toArray();
    const blob = new Blob([JSON.stringify({ sessions, templates, profile }, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `aim-tracker-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col gap-5 p-4">
      <section>
        <h2 className="mb-1 text-sm text-ink">你的游戏段位（对战）</h2>
        <p className="mb-3 text-[11px] text-muted">
          填你实际的 Valorant 对战段位。它与瞄准段位可以不同 —— 很多人靠意识吃饭。记录满 3 次后，瞄准段位会由实测成绩独立给出。
        </p>
        <div className="grid grid-cols-3 gap-2">
          {TIER_ORDER.map((t) => {
            const active = profile?.gameRank === t;
            return (
              <button
                key={t}
                onClick={() => setGameRank(t)}
                className={`rounded-lg py-2 text-xs transition-colors ${active ? "bg-surface2" : "bg-bg2"}`}
                style={active ? { border: `1px solid ${TIER_META[t].color}`, color: TIER_META[t].color } : { color: "#768079" }}
              >
                {TIER_META[t].zh}
                <span className="mt-0.5 block text-[10px] opacity-60">{TIER_META[t].en}</span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="rounded-xl border border-line bg-surface p-4">
        <h2 className="mb-1 text-sm text-ink">灵敏度</h2>
        <p className="mb-3 text-[11px] text-muted">
          填你的游戏内灵敏度，之后每次记录都会带上它。「成长」页会分析不同灵敏度下的表现，帮你找手感甜点。
        </p>
        <div className="flex gap-3">
          <label className="flex flex-1 flex-col gap-1 text-[11px] text-muted">
            游戏内灵敏度 Sens
            <input
              type="number"
              step="0.001"
              defaultValue={profile?.sensitivity ?? ""}
              onBlur={(e) => e.target.value && mergeProfile({ sensitivity: Number(e.target.value) })}
              placeholder="0.35"
              className="rounded-lg px-3 py-2 text-sm text-ink"
            />
          </label>
          <label className="flex flex-1 flex-col gap-1 text-[11px] text-muted">
            鼠标 DPI（可选）
            <input
              type="number"
              defaultValue={profile?.dpi ?? ""}
              onBlur={(e) => e.target.value && mergeProfile({ dpi: Number(e.target.value) })}
              placeholder="800"
              className="rounded-lg px-3 py-2 text-sm text-ink"
            />
          </label>
        </div>
        {profile?.sensitivity !== undefined && profile?.dpi !== undefined && (
          <p className="mt-2 text-[11px] text-dim">eDPI ≈ {Math.round(profile.sensitivity * profile.dpi)}</p>
        )}
      </section>

      <section className="rounded-xl border border-line bg-surface p-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm text-ink">数据</span>
          <span className="text-[11px] text-dim">{sessionCount} 条记录 · 全部本地</span>
        </div>
        <button
          onClick={exportData}
          className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-line bg-bg2 py-2 text-sm text-muted active:scale-[0.99]"
        >
          <Download size={15} />
          导出为 JSON
        </button>
      </section>

      <section className="rounded-xl border border-line bg-surface">
        <button
          onClick={() => setCalOpen((v) => !v)}
          className="flex w-full items-center justify-between p-4 text-sm text-ink"
        >
          成绩↔段位校准表
          {calOpen ? <ChevronDown size={16} className="text-dim" /> : <ChevronRight size={16} className="text-dim" />}
        </button>
        {calOpen && (
          <div className="border-t border-line p-4">
            <CalibrationEditor />
          </div>
        )}
      </section>

      <p className="px-1 text-[11px] text-dim leading-relaxed">
        段位与今日目标均基于校准表计算，该表采用社区/主播标准，可按需调整。数据仅存本机，不上传。
      </p>
    </div>
  );
}
