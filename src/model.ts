import { openDB } from "idb";

// https://kubyshkin.name/posts/newtype-in-typescript/
export type TaskId = string & { readonly __tag: unique symbol };

export interface task {
  id: TaskId;
  title: string;
  checked: boolean;
}

export interface TaskStore {
  getAll: () => Promise<task[]>;
  setTitle: (id: TaskId, title: string) => Promise<void>;
  deleteTask: (id: TaskId) => Promise<void>;
  append: (title: string) => Promise<TaskId>;
  checkTask: (id: TaskId, checked: boolean) => Promise<void>;
}

// base64 encoded 128-bit random values
function random128Bit(): string {
  let a = new BigUint64Array(2);
  crypto.getRandomValues(a);
  return (btoa as any)(a);
}

const randomTaskId = () => random128Bit() as TaskId;

const tasksDB = openDB("tasks", 3, {
  upgrade(db, oldVersion, _newVersion, tx) {
    const theStore = "list-items";
    const theKey = "the-list";

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

    if (oldVersion < 3) {
      const taskStore = db.createObjectStore("tasks", { keyPath: "id" });
      const store = tx.objectStore(theStore);
      store.get(theKey).then((oldTasks) => {
        let keys = [];
        for (const t of oldTasks) {
          const id = randomTaskId();
          taskStore.put(t, id);
          keys.push(t);
        }
        store.put(keys, "order");
      });
    }
  },
});

export const taskStore: TaskStore = {
  getAll: async () => {
    const db = await tasksDB;
    const tx = db.transaction(["list-items", "tasks"]);
    const order = await tx.objectStore("list-items").get("order");
    const tasks = tx.objectStore("tasks");
    let ret = [];
    for (const k of order) {
      const t = await tasks.get(k);
      ret.push(t);
    }
    return ret;
  },

  setTitle: async (id, title) => {
    const tx = (await tasksDB).transaction("tasks", "readwrite");
    const task = tx.store.get(id);
    tx.store.put({ ...task, title: title }, id);
  },

  append: async (title) => {
    const t = { id: randomTaskId(), title: title, checked: false };
    (await tasksDB).put("tasks", t, t.id);
    return t.id;
  },

  deleteTask: async (id) => {
    const db = await tasksDB;
    const tx = db.transaction(["list-items", "tasks"], "readwrite");
    const orderStore = tx.objectStore("list-items");
    const order = await orderStore.get("order");
    orderStore &&
      (await orderStore.put(
        order.filter((t: task) => t.id !== id),
        "order"
      ));
    await tx.objectStore("tasks").delete(id);
    await tx.done;
  },

  checkTask: async (id, checked) => {
    const tx = (await tasksDB).transaction("tasks", "readwrite");
    const task = tx.store.get(id);
    tx.store.put({ ...task, checked: checked }, id);
  },
};
