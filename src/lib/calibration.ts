import defaults from "../data/rankCalibration.json";

export interface Calibration {
  speed: Record<string, Record<string, number>>;
  eliminate: Record<string, Record<string, number>>;
}

export const DEFAULT_CALIBRATION: Calibration = {
  speed: defaults.speed,
  eliminate: defaults.eliminate,
};

// 深拷贝，避免编辑器改到默认值
export function cloneCalibration(c: Calibration): Calibration {
  return JSON.parse(JSON.stringify(c));
}

let active: Calibration = DEFAULT_CALIBRATION;

export function getCalibration(): Calibration {
  return active;
}

export function setCalibration(c: Calibration): void {
  active = c;
}
