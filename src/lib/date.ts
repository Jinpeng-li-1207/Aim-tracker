// 统一按"本地日期"处理日界，避免用 UTC 导致凌晨被算成前一天
export function dayKey(iso: string): string {
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function todayKey(): string {
  return dayKey(new Date().toISOString());
}

export function shiftDay(key: string, delta: number): string {
  const [y, m, d] = key.split("-").map(Number);
  const dt = new Date(y, m - 1, d + delta);
  const yy = dt.getFullYear();
  const mm = String(dt.getMonth() + 1).padStart(2, "0");
  const dd = String(dt.getDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}

export function isToday(iso: string): boolean {
  return dayKey(iso) === todayKey();
}

// 本地 MM-DD（用于图表 x 轴）
export function shortDay(iso: string): string {
  return dayKey(iso).slice(5);
}
