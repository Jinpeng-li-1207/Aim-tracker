import Dexie, { type Table } from "dexie";
import type { TrainingSession, TrainingTemplate, Profile } from "./types";

export interface SettingRow {
  id: string;
  value: unknown;
}

class AimTrackerDB extends Dexie {
  sessions!: Table<TrainingSession>;
  templates!: Table<TrainingTemplate>;
  profile!: Table<Profile>;
  settings!: Table<SettingRow>;
  constructor() {
    super("aim-tracker");
    this.version(1).stores({
      sessions: "id, createdAt, testType, templateId",
      voltaic: "id, recordedAt",
      templates: "id, isBuiltIn",
    });
    // v2：弃用 Voltaic 表，新增用户档案
    this.version(2).stores({
      voltaic: null,
      profile: "id",
    });
    // v3：可编辑校准表等设置
    this.version(3).stores({
      settings: "id",
    });
  }
}
export const db = new AimTrackerDB();
