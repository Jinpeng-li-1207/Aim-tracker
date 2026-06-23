import type { TrainingTemplate } from "@/lib/types";

export function TemplateCard({ tpl }: { tpl: TrainingTemplate }) {
  return (
    <div className="rounded-lg border p-3">
      <div className="flex justify-between">
        <span className="font-semibold">{tpl.name}</span>
        <span className="text-xs text-gray-400">{tpl.author}</span>
      </div>
      <p className="mt-1 text-xs text-gray-500">{tpl.description}</p>
      <ol className="mt-2 list-decimal pl-4 text-sm">
        {tpl.tasks.map((t) => (
          <li key={t.id} className="mb-1">
            {t.testType === "speed" && `${t.difficulty} 靶 · 目标 ${t.targetScore}/30`}
            {t.testType === "eliminate" && `${t.side} ${t.targetCount} 靶 · 目标 ${t.targetSeconds}s`}
            {t.testType === "practice" && `自由练习 ${t.durationMinutes}min`}
            <span className="block text-xs text-gray-400">{t.instructions}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
