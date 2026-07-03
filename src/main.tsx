import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { seedBuiltins } from "./lib/seed";
import { db } from "./lib/db";
import { setCalibration, type Calibration } from "./lib/calibration";

async function init() {
  try {
    const saved = await db.settings.get("calibration");
    if (saved) setCalibration(saved.value as Calibration);
    await seedBuiltins();
  } catch {
    // 首次加载或存储异常时忽略，使用默认校准表
  }
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}

init();
