import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";

export function Dashboard() {
  const sessions = useLiveQuery(() => db.sessions.orderBy("createdAt").reverse().toArray(), []);
  const latestVoltaic = useLiveQuery(() => db.voltaic.orderBy("recordedAt").reverse().first(), []);
  const recent = sessions?.slice(0, 5) ?? [];
  return (
    <div className="flex flex-col gap-6 p-4">
      <div className="rounded-xl bg-gradient-to-br from-red-500 to-orange-400 p-6 text-center text-white">
        <div className="text-sm opacity-80">Voltaic 段位（权威基准）</div>
        <div className="text-3xl font-bold">{latestVoltaic ? latestVoltaic.tier.toUpperCase() : "未录入"}</div>
        {latestVoltaic && <div className="text-sm">energy {latestVoltaic.energy}</div>}
      </div>
      <section>
        <h2 className="mb-2 font-semibold">最近训练</h2>
        {recent.length === 0 && <p className="text-sm text-gray-400">还没有记录，去打卡吧！</p>}
        {recent.map((s) => (
          <div key={s.id} className="mb-2 flex justify-between rounded border p-3 text-sm">
            <span>
              {s.testType} · {s.weapon}
            </span>
            <span className="text-gray-500">{s.createdAt.slice(0, 10)}</span>
          </div>
        ))}
      </section>
    </div>
  );
}
