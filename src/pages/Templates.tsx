import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { TemplateCard } from "@/components/template/TemplateCard";
export function Templates() {
  const tpls = useLiveQuery(() => db.templates.toArray(), []);
  return (
    <div className="flex flex-col gap-3 p-4">
      {(tpls ?? []).map((t) => (
        <TemplateCard key={t.id} tpl={t} />
      ))}
    </div>
  );
}
