import type { TestType } from "@/lib/types";

const OPTIONS = [
  { id: "speed", label: "速度测试 (30靶)" },
  { id: "eliminate", label: "消灭测试 (50/100)" },
  { id: "practice", label: "自由练习" },
] as const;

export function TestTypeSelector({ value, onChange }: { value: TestType; onChange: (t: TestType) => void }) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {OPTIONS.map((o) => (
        <button
          key={o.id}
          onClick={() => onChange(o.id)}
          className={`rounded py-2 text-xs ${value === o.id ? "bg-red-500 text-white" : "bg-gray-100"}`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
