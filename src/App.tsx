import { useState } from "react";
import { Crosshair, TrendingUp, ClipboardList, User } from "lucide-react";
import { Train } from "@/pages/Train";
import { Progress } from "@/pages/Progress";
import { Templates } from "@/pages/Templates";
import { Me } from "@/pages/Me";
import type { TrainingTemplate } from "@/lib/types";

const tabs = [
  { id: "train", label: "训练", Icon: Crosshair },
  { id: "progress", label: "成长", Icon: TrendingUp },
  { id: "templates", label: "模板", Icon: ClipboardList },
  { id: "me", label: "我的", Icon: User },
] as const;
type Tab = (typeof tabs)[number]["id"];

export default function App() {
  const [tab, setTab] = useState<Tab>("train");
  const [activeTemplate, setActiveTemplate] = useState<TrainingTemplate | null>(null);

  const startTemplate = (tpl: TrainingTemplate) => {
    setActiveTemplate(tpl);
    setTab("train");
  };

  return (
    <div className="mx-auto flex h-[100dvh] max-w-md flex-col bg-bg">
      <header className="flex shrink-0 items-center gap-2 border-b border-line px-4 py-3.5">
        <span className="inline-block h-4 w-1.5 rounded-sm bg-brand" />
        <span className="text-sm tracking-wide text-ink">AIM TRACKER</span>
      </header>

      <main className="flex-1 overflow-y-auto pt-2">
        {tab === "train" && (
          <Train
            activeTemplate={activeTemplate}
            onStart={startTemplate}
            onExitTemplate={() => setActiveTemplate(null)}
          />
        )}
        {tab === "progress" && <Progress />}
        {tab === "templates" && <Templates onStart={startTemplate} />}
        {tab === "me" && <Me />}
      </main>

      <nav
        className="flex shrink-0 border-t border-line bg-bg2"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        {tabs.map(({ id, label, Icon }) => {
          const active = tab === id;
          return (
            <button
              key={id}
              onClick={() => setTab(id)}
              className="flex flex-1 flex-col items-center gap-1 py-2.5"
            >
              <Icon size={20} className={active ? "text-brand" : "text-dim"} />
              <span className={`text-[10px] ${active ? "text-brand" : "text-dim"}`}>{label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
