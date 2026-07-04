import { registerSW } from "virtual:pwa-register";

// 自动更新：新版本部署后，App 会在后台拉取并静默应用，无需删除重装。
// 本地 IndexedDB 数据不受 Service Worker 更新影响。
const updateSW = registerSW({
  immediate: true,
  onRegisteredSW(_swUrl, registration) {
    // App 开着时也每小时检查一次更新
    if (registration) {
      setInterval(
        () => {
          registration.update().catch(() => {});
        },
        60 * 60 * 1000,
      );
    }
  },
  onNeedRefresh() {
    // autoUpdate 下通常自动生效；兜底：静默应用并刷新到新版
    updateSW(true);
  },
});
