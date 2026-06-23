import { db } from "./db";
import builtins from "../data/builtinTemplates.json";
import type { TrainingTemplate } from "./types";

export async function seedBuiltins() {
  for (const t of builtins as TrainingTemplate[]) {
    const exists = await db.templates.get(t.id);
    if (!exists) await db.templates.add(t);
  }
}
