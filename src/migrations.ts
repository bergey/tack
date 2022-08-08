import { openDB } from "idb";

// https://kubyshkin.name/posts/newtype-in-typescript/
export type TaskId = string & { readonly __tag: unique symbol };

// base64 encoded 128-bit random values
// idb keys need to be strings, but for wire format we might prefer 16-byte binary representation
export function random128Bit(): string {
  let a = new BigUint64Array(2);
  crypto.getRandomValues(a);
  return (btoa as any)(a);
}

export const randomTaskId = () => random128Bit() as TaskId;

export const tasksDB = openDB("tasks", 4, {
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
        db.createObjectStore("tasks", { keyPath: "id" });
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

      if (oldVersion < 4) {
        const tasks = await tx.objectStore("tasks").getAll();
        for (const t of tasks) {
          t.description = "";
          tx.objectStore("tasks").put(t);
        }
      }
    })();
  },
});
