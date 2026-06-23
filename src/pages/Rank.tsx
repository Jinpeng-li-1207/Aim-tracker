import { useState } from "react";
import { nanoid } from "nanoid";
import { db } from "@/lib/db";
import { getVoltaicTier } from "@/lib/rank";

export function Rank() {
  const [energy, setEnergy] = useState(0);
  const save = async () => {
    await db.voltaic.add({ id: nanoid(), recordedAt: new Date().toISOString(), energy, tier: getVoltaicTier(energy) });
    setEnergy(0);
  };
  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="rounded border-l-4 border-yellow-400 bg-yellow-50 p-3 text-xs text-gray-600">
        ⚠️ 靶场成绩对应的段位为「社区参考」，非官方。最权威的瞄准段位请用下方 Voltaic energy。
      </div>
      <h2 className="font-semibold">录入 Voltaic energy</h2>
      <input
        type="number"
        value={energy}
        onChange={(e) => setEnergy(Number(e.target.value))}
        className="rounded border px-2 py-2"
        placeholder="例如 550"
      />
      <div className="text-sm">
        对应段位：<b>{getVoltaicTier(energy).toUpperCase()}</b>
      </div>
      <button onClick={save} className="rounded bg-red-500 py-2 font-semibold text-white">
        保存
      </button>
    </div>
  );
}
