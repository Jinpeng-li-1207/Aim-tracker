# AGENTS.md — Aim Tracker 上手手册

> 给接手本项目的 AI agent / 开发者。读完这份就能直接改代码。人类使用说明见 [README.md](README.md) 与 [新手指南 PDF](docs/新手使用指南.pdf)。

## 一句话

Valorant 靶场瞄准训练记录 **PWA**。核心是「**段位驱动的自适应训练闭环**」：录入游戏段位 → App 按下一段位给今日训练目标 → 每次打完填成绩 → 累积成长曲线、自动重算瞄准段位 → 段位升了目标随之升档。数据 **100% 本地**（IndexedDB），无后端、无登录。

## 技术栈

React 19 · TypeScript · Vite · Tailwind CSS v4 · Dexie.js(IndexedDB) · lucide-react · vite-plugin-pwa · Vitest。
**图表全部内联 SVG，不用图表库**（Recharts 已移除，别再引入）。

## 跑起来 / 验证

```bash
npm install
npm run dev          # http://localhost:5173
npm run build        # tsc -b + vite build（生成 PWA），改完必须通过
npx vitest run       # 单测（rank.test.ts）
npx tsc --noEmit     # 类型检查
```

改任何东西后至少跑 `npm run build` + `npx vitest run`。可用预览工具在 **mobile 视口(375×812)** 里目视验证。

## 部署（重要，别踩坑）

- 仓库：https://github.com/Jinpeng-li-1207/Aim-tracker ，站点在**子路径** `/Aim-tracker/`。
- 部署走 **GitHub Actions**（`.github/workflows/deploy.yml`），push 到 `main` 自动 build + deploy 到 Pages。
- **仓库 Pages 源必须设为「GitHub Actions」**（不是「Deploy from a branch」）。设成分支会把仓库根的开发版 `index.html` 当站点 → 白页。
- `vite.config.ts` 里 `base` **仅构建时**为 `/Aim-tracker/`，dev 仍是 `/`。改仓库名/路径要同步改。
- `concurrency.cancel-in-progress: false`（官方推荐，避免连续 push 时部署互相打断导致失败邮件）。
- `.gitattributes` 把 `*.pdf` 等标为 binary，否则 autocrlf 会破坏二进制文件。
- 提交信息统一以 `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>` 结尾。

## 目录地图

```
src/
├── App.tsx            # 4-tab 外壳(训练/成长/模板/我的) + activeTemplate 状态 + h-[100dvh] 布局
├── main.tsx           # 异步 init：先加载校准表覆盖(settings) → seed 内置模板 → 注册 PWA → render
├── pwa.ts             # SW 注册 + 每小时检查更新(autoUpdate)
├── lib/
│   ├── db.ts          # Dexie 定义(v3)：表 sessions / templates / profile / settings
│   ├── types.ts       # 全部类型(见下"数据模型")
│   ├── constants.ts   # WEAPONS / DIFFICULTIES / SIDES / TIER_ORDER / TIER_META / TEST_TYPE_META / CORE_DRILLS
│   ├── date.ts        # ★本地日界工具(dayKey/todayKey/isToday/shiftDay/shortDay)——见"陷阱"
│   ├── calibration.ts # 校准表单例：getCalibration/setCalibration/DEFAULT_CALIBRATION
│   ├── rank.ts        # tierForSession / computeRank / computeForm / nextTier / tierIndex
│   ├── adaptiveTemplate.ts # computeTodayDrill / buildTodayDrills / buildTemplateDrills / drillLabel / matchesDrill
│   ├── stats.ts       # computeStreak / allConfigRows+CONFIG_DEFS / sensitivityBreakdown
│   ├── seed.ts        # 首次写入内置模板(按 id，不存在才加)
│   └── rank.test.ts   # 单测(改校准值要同步改断言)
├── data/
│   ├── rankCalibration.json  # 成绩↔段位阈值(默认值)
│   └── builtinTemplates.json # 内置模板：warmup / gus / streamer-daily / beginner
├── components/
│   ├── train/DrillCard.tsx       # 单个训练卡：常驻输入+打卡、每组可删(×)、整卡可移除(onHide)、PB庆祝
│   ├── train/TargetHeader.tsx    # 双段位对比 + 手感 + 今日通过进度
│   ├── charts/ConfigBreakdown.tsx# 成长页各项训练(内联SVG趋势线 + 点击展开详情)
│   ├── rank/RankBadge.tsx        # 段位徽章
│   ├── template/TemplateCard.tsx # 模板卡(展示任务 + 一键开练 + 删除自建)
│   ├── template/TemplateBuilder.tsx # 拼装式新建模板
│   ├── stats/StatsCards.tsx      # SensitivityCard(灵敏度甜点)
│   ├── settings/CalibrationEditor.tsx # 校准表可视化编辑(存 settings, 保存后 reload)
│   ├── settings/HistoryManager.tsx    # 历史记录：按项目分组，单条删 + 整项清空
│   └── training/SessionForm.tsx  # "自定义记一笔"表单
└── pages/  Train / Progress / Templates / Me
```

`src/App.css` 是 Vite 模板残留，未使用。

## 数据模型（`src/lib/types.ts`）

- `TrainingSession` = `SpeedSession | EliminateSession | PracticeSession`（按 `testType` 区分的联合类型）。
  - 公共：id, createdAt(ISO), weapon, botArmor, infiniteAmmo, strafe, sensitivity?, templateId?, templateTaskId?, notes?
  - speed：`difficulty`(easy/medium/hard) + `score`(0–30，越高越好)
  - eliminate：`targetCount`(50/100) + `side`(front/left/right) + `completionSeconds`(越低越好)
  - practice：`durationMinutes`
- `Tier` = iron|bronze|silver|gold|platinum|diamond|ascendant|immortal|radiant（9 段，对齐 Valorant CN 名，见 TIER_META）。
- `Profile`(id="me")：gameRank?, sensitivity?, dpi?, requiredPasses?, consecutivePass?
- `CoreDrill` / `PassRule`(requiredPasses+consecutive) / `TodayDrill`(attempts:{id,value}[], todayBest, recentBest, allTimeBest, metCount, passProgress, passed…)
- `TemplateTask` / `TrainingTemplate` / `RankResult` / `FormState` / `SettingRow`(id,value)
- Dexie settings 表用途：`id:"calibration"`(校准覆盖)、`id:"hiddenDrills"`(今日训练隐藏的 drill key 数组)。

## 核心业务逻辑（改这些最要小心）

1. **段位计算 `rank.ts`**：把可评级记录按 **(本地天 + 项目配置)** 分组，组内取均值 → 该组代表段位；再对近 12 个代表值取均值 → 综合段位。≥3 个代表值用实测(`records`)，否则用 gameRank 冷启动(`gamerank`)，再无为 `none`。**一天一个项目只算一次**（避免狂练刷段位）。
2. **校准表 `calibration.ts` + `rankCalibration.json`**：唯一真相源。`getCalibration()` 优先返回用户在「我的→校准表」保存到 settings 的覆盖，否则用 JSON 默认。**神话=不朽Immortal，辐能Radiant在其上**。侧面100靶/中等靶=社区标准综合；简单/困难/消灭50=外推待补。
3. **自适应今日训练 `adaptiveTemplate.ts`**：`buildTodayDrills` = CORE_DRILLS，目标取"下一段位"阈值；模板模式 `buildTemplateDrills` 用模板任务自带目标/通过条件。`computeTodayDrill` 算当日各组、`passed`(达标N次/连续)。
4. **通过条件**：`requiredPasses`(达标几次算通过) + `consecutive`(是否需连续)。全局默认在 Profile，模板任务可单独覆盖。
5. **三层删除**：单组(DrillCard 组内 ×) / 整卡移除(Train 的 onHide → settings.hiddenDrills，可"恢复默认") / 历史(我的→HistoryManager：单条 + 按项目清空)。模板模式不给整卡移除(要改就改模板)。

## 约定与陷阱（务必遵守）

- **日界一律用 `lib/date.ts`（本地时间）**，不要对 ISO 串 `.slice(0,10)`（那是 UTC，会导致 UTC+8 凌晨算成前一天——已修过这个 bug）。
- **tsconfig 开了 `verbatimModuleSyntax`**：引类型用 `import type {…}`；`noUnusedLocals/Parameters` 也开着，别留未用变量（`npm run build` 会报错，`tsc --noEmit` 有时不报）。
- **可清空的数字输入**：不要 `onChange` 里直接 `Math.max(1,Number(...))`（清空瞬间会被拽回，删不掉）。用"本地编辑字符串态 + 失焦时 clamp"（参考 Me 的 requiredPasses、TemplateBuilder 的 passes）。
- **暗色单主题**：Tailwind v4 自定义色在 `src/index.css` 的 `@theme`（brand=#FF4655 瓦区红、bg/surface/ink/muted/dim/line/teal）。tracker.gg 风格。
- **图表用内联 SVG**（见 ConfigBreakdown），别加图表依赖。
- **改内置模板的已有 id 不会对老用户生效**（seed 只在 id 不存在时加）。加新模板要用**新 id**。
- **改校准值要同步改 `rank.test.ts` 的断言**（有几条 hard-code 了阈值边界）。
- **改 Dexie schema 要 bump version**（`db.ts` 里 `this.version(n).stores(...)`，删表用 `null`）。

## 现状 & 路线

功能已完整可用并上线：训练闭环、双段位、手感、多组/通过条件、模板(内置+拼装+一键开练)、成长(各项趋势/灵敏度甜点/连击)、校准表编辑、历史管理、数据导出/导入、PWA 自动更新。

待办候选：模板打卡完成度统计、社区模板广场、可选云同步、多游戏(CS2/Apex——架构已数据驱动，加游戏≈加一份 config + 主题 token)。
已否决/搁置：靶场成绩反推"能力短板"(只有分数看不到瞄准轨迹，会误导)；插件式 OCR 自动读成绩(Vanguard 内核反作弊=封号风险)。
