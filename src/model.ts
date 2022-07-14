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
    (async () => {
      const theStore = "list-items";
      const theKey = "the-list";

      if (oldVersion < 1) {
        db.createObjectStore(theStore);
        await tx.objectStore(theStore).put([""], theKey);
      }

      const store = tx.objectStore(theStore);
      if (oldVersion < 2) {
        const oldTasks = await store.get(theKey);
        await store.put(
          oldTasks.map((title: string) => ({ title: title, checked: false })),
          theKey
        );
      }

      if (oldVersion < 3) {
        await db.createObjectStore("tasks", { keyPath: "id" });
        const taskStore = tx.objectStore("tasks");
        const store = tx.objectStore(theStore);
        const oldTasks = await store.get(theKey);
        console.log(oldTasks);
        let keys = [];
        for (const t of oldTasks) {
          const id = randomTaskId();
          t.id = id;
          await taskStore.put(t);
          keys.push(id);
        }
        await store.put(keys, "order");
        await store.delete(theKey);
      }
    })();
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
    console.log(id);
    const tx = (await tasksDB).transaction("tasks", "readwrite");
    const task = await tx.store.get(id);
    console.log(task);
    tx.store.put({ ...task, title: title });
  },

  append: async (title) => {
    const t = { id: randomTaskId(), title: title, checked: false };
    const tx = (await tasksDB).transaction(
      ["list-items", "tasks"],
      "readwrite"
    );
    await tx.objectStore("tasks").put(t);
    const order = await tx.objectStore("list-items").get("order");
    order.push(t.id);
    await tx.objectStore("list-items").put(order, "order");
    return t.id;
  },

  deleteTask: async (id) => {
    const db = await tasksDB;
    const tx = db.transaction(["list-items", "tasks"], "readwrite");
    const orderStore = tx.objectStore("list-items");
    const order = await orderStore.get("order");
    orderStore &&
      (await orderStore.put(
        order.filter((tid: TaskId) => tid !== id),
        "order"
      ));
    await tx.objectStore("tasks").delete(id);
    await tx.done;
  },

  checkTask: async (id, checked) => {
    const tx = (await tasksDB).transaction("tasks", "readwrite");
    const task = await tx.store.get(id);
    tx.store.put({ ...task, checked: checked });
  },
};
