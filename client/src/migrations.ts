import * as Automerge from '@automerge/automerge';
import { openDB } from "idb";

import { Project, emptyProject } from "./model";
import { rateLimit } from "./util";


export const tasksDB = openDB("tasks", 5, {
  upgrade(db, oldVersion, _newVersion, _tx) {
    (async () => {
      if (oldVersion < 5) {
        // Don't bother converting old schema to Automerge, since no real users yet
        db.createObjectStore("projects");
      }
    })();
  },
});

export const persistProject = rateLimit(2000, // milliseconds
    (p: Project) => tasksDB.then((db) => db.put("projects", Automerge.save(p), "global"))
    // TODO later: persist each change & after some time / number of commit saves, persist the full state
)

export async function loadProject() : Promise<Project> {
  const db = await tasksDB;
  const raw = await db.get("projects", "global");
  return raw ? Automerge.load(raw) : emptyProject();
}
