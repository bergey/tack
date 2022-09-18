import { openDB } from "idb";

export const tasksDB = openDB("tasks", 4, {
  upgrade(db, oldVersion, _newVersion, tx) {
    (async () => {
      if (oldVersion < 5) {
        // Don't bother converting old schema to Automerge, since no real users yet
        await db.createObjectStore("projects");
        await tx.objectStore("tasks").delete();
      }
    })();
  },
});
