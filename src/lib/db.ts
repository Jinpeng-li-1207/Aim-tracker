import Dexie, { type Table } from "dexie";
import type { TrainingSession, VoltaicEntry, TrainingTemplate } from "./types";

class AimTrackerDB extends Dexie {
  sessions!: Table<TrainingSession>;
  voltaic!: Table<VoltaicEntry>;
  templates!: Table<TrainingTemplate>;
  constructor() {
    super("aim-tracker");
    this.version(1).stores({
      sessions: "id, createdAt, testType, templateId",
      voltaic: "id, recordedAt",
      templates: "id, isBuiltIn",
    });
  }
}
export const db = new AimTrackerDB();
