import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { Plus, X } from "lucide-react";
import { db } from "@/lib/db";
import { TemplateCard } from "@/components/template/TemplateCard";
import { TemplateBuilder } from "@/components/template/TemplateBuilder";
import type { TrainingTemplate } from "@/lib/types";

export function Templates({ onStart }: { onStart: (tpl: TrainingTemplate) => void }) {
  const tpls = useLiveQuery(() => db.templates.toArray(), []) ?? [];
  const [building, setBuilding] = useState(false);

  const del = async (id: string) => {
    await db.templates.delete(id);
  };

  return (
    <div className="flex flex-col gap-3 p-4">
      <button
        onClick={() => setBuilding((v) => !v)}
        className="flex items-center justify-center gap-1.5 rounded-xl bg-brand py-2.5 text-sm font-medium text-white active:scale-[0.99]"
      >
        {building ? <X size={16} /> : <Plus size={16} />}
        {building ? "取消" : "新建模板"}
      </button>

      {building && <TemplateBuilder onDone={() => setBuilding(false)} />}

      {tpls.map((t) => (
        <TemplateCard key={t.id} tpl={t} onStart={onStart} onDelete={del} />
      ))}
    </div>
  );
}
