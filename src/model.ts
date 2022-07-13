import { openDB } from "idb";

export interface task {
  title: string;
  checked: boolean;
}

export interface TaskStore {
  get: Promise<task[]>;
  set: (newTasks: task[]) => Promise<void>;
}

const theStore = "list-items";
const theKey = "the-list";

const tasksDB = openDB("tasks", 2, {
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

export const taskStore: TaskStore = {
  get: tasksDB.then((db) => db.get(theStore, theKey)),
  set: (newTasks) =>
    tasksDB.then((db) => db.put(theStore, newTasks, theKey)).then((_) => {}),
};
