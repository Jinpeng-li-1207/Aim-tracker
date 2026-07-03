import Dexie, { type Table } from "dexie";
import type { TrainingSession, TrainingTemplate, Profile } from "./types";

class AimTrackerDB extends Dexie {
  sessions!: Table<TrainingSession>;
  templates!: Table<TrainingTemplate>;
  profile!: Table<Profile>;
  constructor() {
    super("aim-tracker");
    this.version(1).stores({
      sessions: "id, createdAt, testType, templateId",
      voltaic: "id, recordedAt",
      templates: "id, isBuiltIn",
    });
    // v2：弃用 Voltaic 表，新增用户档案（自评基线段位）
    this.version(2).stores({
      voltaic: null,
      profile: "id",
    });
  }
}
export const db = new AimTrackerDB();
