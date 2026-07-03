import { useLiveQuery } from "dexie-react-hooks";
import { Download } from "lucide-react";
import { db } from "@/lib/db";
import { TIER_ORDER, TIER_META } from "@/lib/constants";
import type { Tier } from "@/lib/types";

export function Me() {
  const profile = useLiveQuery(() => db.profile.get("me"), []);
  const sessionCount = useLiveQuery(() => db.sessions.count(), []) ?? 0;

  const setBaseline = async (tier: Tier) => {
    await db.profile.put({ id: "me", baselineTier: tier, updatedAt: new Date().toISOString() });
  };

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
        <h2 className="mb-1 text-sm text-ink">自评当前段位</h2>
        <p className="mb-3 text-[11px] text-muted">
          记录满 3 次后，段位会自动由实际成绩接管，自评仅作冷启动基线。
        </p>
        <div className="grid grid-cols-3 gap-2">
          {TIER_ORDER.map((t) => {
            const active = profile?.baselineTier === t;
            return (
              <button
                key={t}
                onClick={() => setBaseline(t)}
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

      <p className="px-1 text-[11px] text-dim leading-relaxed">
        段位与今日目标均基于「成绩↔段位校准表」计算，该表采用社区/主播标准，可按需调整。数据仅存本机，不上传。
      </p>
    </div>
  );
}
