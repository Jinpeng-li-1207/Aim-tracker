import { Play } from "lucide-react";
import { DIFFICULTIES, SIDES } from "@/lib/constants";
import type { TemplateTask, TrainingTemplate } from "@/lib/types";

function passSuffix(t: TemplateTask): string {
  const n = t.requiredPasses ?? 1;
  if (n <= 1) return "";
  return t.consecutive ? ` · 连续达标 ${n} 次` : ` · 达标 ${n} 次通过`;
}

function taskLine(t: TemplateTask): string {
  if (t.testType === "speed") {
    const d = DIFFICULTIES.find((x) => x.id === t.difficulty);
    return `${d?.zh ?? t.difficulty}靶 ${d?.en ?? ""} · 目标 ${t.targetScore ?? "-"}/30${passSuffix(t)}`;
  }
  if (t.testType === "eliminate") {
    const sd = SIDES.find((x) => x.id === t.side);
    return `${sd?.zh ?? t.side} ${t.targetCount}靶 · 目标 ${t.targetSeconds ?? "-"}s${passSuffix(t)}`;
  }
  return `自由练习 ${t.durationMinutes ?? "-"}min`;
}

interface Props {
  tpl: TrainingTemplate;
  onStart?: (tpl: TrainingTemplate) => void;
}

export function TemplateCard({ tpl, onStart }: Props) {
  return (
    <div className="rounded-xl border border-line bg-surface p-3.5">
      <div className="flex items-center justify-between">
        <span className="text-sm text-ink">{tpl.name}</span>
        <span className="text-[11px] text-dim">{tpl.author}</span>
      </div>
      <p className="mt-1 text-[11px] text-muted">{tpl.description}</p>
      <ol className="mt-2.5 flex flex-col gap-1.5">
        {tpl.tasks.map((t, i) => (
          <li key={t.id} className="flex gap-2 text-[12px]">
            <span className="text-brand">{i + 1}</span>
            <div>
              <div className="text-ink">{taskLine(t)}</div>
              <div className="text-[11px] text-dim">{t.instructions}</div>
            </div>
          </li>
        ))}
      </ol>
      {onStart && (
        <button
          onClick={() => onStart(tpl)}
          className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg bg-brand py-2 text-sm font-medium text-white active:scale-[0.98]"
        >
          <Play size={15} />
          一键开练
        </button>
      )}
    </div>
  );
}
