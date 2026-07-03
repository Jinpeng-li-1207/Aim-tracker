import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { nanoid } from "nanoid";
import { Upload, X } from "lucide-react";
import { db } from "@/lib/db";
import { TemplateCard } from "@/components/template/TemplateCard";
import type { TrainingTemplate } from "@/lib/types";

export function Templates() {
  const tpls = useLiveQuery(() => db.templates.toArray(), []) ?? [];
  const [open, setOpen] = useState(false);
  const [json, setJson] = useState("");
  const [error, setError] = useState("");

  const doImport = async () => {
    setError("");
    try {
      const parsed = JSON.parse(json) as Partial<TrainingTemplate>;
      if (!parsed.name || !Array.isArray(parsed.tasks)) {
        setError("格式不对：至少需要 name 和 tasks 数组");
        return;
      }
      const tpl: TrainingTemplate = {
        id: parsed.id ?? nanoid(),
        name: parsed.name,
        author: parsed.author ?? "导入",
        description: parsed.description ?? "",
        tasks: parsed.tasks,
        createdAt: new Date().toISOString(),
        isBuiltIn: false,
      };
      await db.templates.put(tpl);
      setJson("");
      setOpen(false);
    } catch {
      setError("JSON 解析失败，请检查格式");
    }
  };

  return (
    <div className="flex flex-col gap-3 p-4">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center justify-center gap-1.5 rounded-xl border border-line bg-surface py-2.5 text-sm text-muted active:scale-[0.99]"
      >
        {open ? <X size={16} /> : <Upload size={16} />}
        导入练枪模板 (JSON)
      </button>

      {open && (
        <div className="rounded-xl border border-line bg-surface p-3">
          <textarea
            value={json}
            onChange={(e) => setJson(e.target.value)}
            placeholder='粘贴模板 JSON，例如 {"name":"某主播模板","tasks":[...]}'
            className="w-full rounded-lg px-3 py-2 text-xs text-ink"
            rows={5}
          />
          {error && <p className="mt-1.5 text-[11px] text-brand">{error}</p>}
          <button onClick={doImport} className="mt-2 w-full rounded-lg bg-brand py-2 text-sm font-medium text-white active:scale-[0.98]">
            导入
          </button>
        </div>
      )}

      {tpls.map((t) => (
        <TemplateCard key={t.id} tpl={t} />
      ))}
    </div>
  );
}
