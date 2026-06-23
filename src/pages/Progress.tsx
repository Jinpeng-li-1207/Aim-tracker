import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { ProgressChart } from "@/components/charts/ProgressChart";
export function Progress() {
  const sessions = useLiveQuery(() => db.sessions.toArray(), []);
  return (
    <div className="p-4">
      <ProgressChart sessions={sessions ?? []} />
    </div>
  );
}
