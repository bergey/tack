import { openDB } from "idb";

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
