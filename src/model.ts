import { openDB } from "idb";

export interface task {
  title: string;
  checked: boolean;
}

export const theStore = "list-items";
export const theKey = "the-list";

export const tasksDB = openDB("tasks", 2, {
  upgrade(db, oldVersion, _newVersion, tx) {
    if (oldVersion < 1) {
      db.createObjectStore(theStore);
      tx.objectStore(theStore).put([""], theKey);
    }
    if (oldVersion < 2) {
      const store = tx.objectStore(theStore);
      store.get(theKey).then((oldTasks) =>
        store.put(
          oldTasks.map((title: string) => ({ title: title, checked: false })),
          theKey
        )
      );
    }
  },
});
