import { useState } from "react";
import { Dashboard } from "@/pages/Dashboard";
import { NewSession } from "@/pages/NewSession";
import { Progress } from "@/pages/Progress";
import { Rank } from "@/pages/Rank";
import { Templates } from "@/pages/Templates";

const tabs = [
  { id: "home", label: "主页", icon: "🏠" },
  { id: "record", label: "记录", icon: "✍️" },
  { id: "progress", label: "进步", icon: "📈" },
  { id: "rank", label: "段位", icon: "🏅" },
  { id: "templates", label: "模板", icon: "📋" },
] as const;
type Tab = (typeof tabs)[number]["id"];

export default function App() {
  const [tab, setTab] = useState<Tab>("home");
  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col">
      <header className="border-b p-4 text-lg font-bold">🎯 Aim Tracker</header>
      <main className="flex-1 overflow-y-auto">
        {tab === "home" && <Dashboard />}
        {tab === "record" && <NewSession onDone={() => setTab("home")} />}
        {tab === "progress" && <Progress />}
        {tab === "rank" && <Rank />}
        {tab === "templates" && <Templates />}
      </main>
      <nav className="flex border-t">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex flex-1 flex-col items-center gap-0.5 py-3 text-xs ${
              tab === t.id ? "font-semibold text-red-500" : "text-gray-500"
            }`}
          >
            <span>{t.icon}</span>
            {t.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
