import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { Trash2, X, ChevronDown, ChevronRight } from "lucide-react";
import { db } from "@/lib/db";
import { shortDay } from "@/lib/date";
import { DIFFICULTIES, SIDES } from "@/lib/constants";
import type { TrainingSession } from "@/lib/types";

function groupOf(s: TrainingSession): { key: string; label: string } {
  if (s.testType === "speed") {
    const d = DIFFICULTIES.find((x) => x.id === s.difficulty);
    return { key: `speed-${s.difficulty}`, label: `${d?.zh ?? s.difficulty}靶 · 速度` };
  }
  if (s.testType === "eliminate") {
    return { key: `elim-${s.targetCount}`, label: `消灭 ${s.targetCount}` };
  }
  return { key: "practice", label: "自由练习" };
}

function valueLabel(s: TrainingSession): string {
  if (s.testType === "speed") return `${s.score}/30`;
  if (s.testType === "eliminate") {
    const sd = SIDES.find((x) => x.id === s.side);
    return `${s.completionSeconds}s · ${sd?.zh ?? ""}`;
  }
  return `${s.durationMinutes}min`;
}

export function HistoryManager() {
  const sessions =
    useLiveQuery(() => db.sessions.orderBy("createdAt").reverse().toArray(), []) ?? [];
  const [open, setOpen] = useState<string | null>(null);

  if (sessions.length === 0) {
    return <p className="text-[11px] text-dim">还没有训练记录。</p>;
  }

  const groups = new Map<string, { label: string; items: TrainingSession[] }>();
  for (const s of sessions) {
    const g = groupOf(s);
    const e = groups.get(g.key) ?? { label: g.label, items: [] };
    e.items.push(s);
    groups.set(g.key, e);
  }
  const rows = [...groups.entries()].sort((a, b) => b[1].items.length - a[1].items.length);

  const clearGroup = async (label: string, items: TrainingSession[]) => {
    if (!window.confirm(`确定清空「${label}」的全部 ${items.length} 条记录？此操作不可撤销。`)) return;
    await db.sessions.bulkDelete(items.map((s) => s.id));
  };

  return (
    <div className="flex flex-col gap-2">
      {rows.map(([key, g]) => {
        const expanded = open === key;
        return (
          <div key={key} className="rounded-lg border border-line">
            <div className="flex items-center justify-between p-2.5">
              <button
                onClick={() => setOpen(expanded ? null : key)}
                className="flex flex-1 items-center gap-1.5 text-left text-[13px] text-ink"
              >
                {expanded ? (
                  <ChevronDown size={14} className="text-dim" />
                ) : (
                  <ChevronRight size={14} className="text-dim" />
                )}
                {g.label} <span className="text-[11px] text-dim">{g.items.length} 条</span>
              </button>
              <button
                onClick={() => clearGroup(g.label, g.items)}
                className="inline-flex items-center gap-1 text-[11px] text-dim active:text-brand"
              >
                <Trash2 size={12} /> 清空
              </button>
            </div>
            {expanded && (
              <div className="max-h-52 overflow-y-auto border-t border-line">
                {g.items.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center justify-between px-3 py-1.5 text-[11px]"
                  >
                    <span className="text-muted">
                      {shortDay(s.createdAt)} · <span className="text-ink">{valueLabel(s)}</span>
                      {s.templateId && <span className="text-dim"> · 模板</span>}
                    </span>
                    <button
                      onClick={() => db.sessions.delete(s.id)}
                      aria-label="删除该记录"
                      className="text-dim active:text-brand"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
