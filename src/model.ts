import { useEffect, useState, Dispatch, SetStateAction } from "react";

import { tasksDB, randomTaskId, TaskId } from "./migrations";
// TODO reexport TaskId

interface TaskData {
  id: TaskId;
  title: string;
  checked: boolean;
  description: string;
}

export interface TaskStore {
  useTaskList: () => Promise<Task[]>;
  useTask: (id: TaskId) => Task;
  deleteTask: (id: TaskId) => Promise<void>;
  append: (title: string) => Promise<Task>;
}

export interface Task {
  id: TaskId;
  title: string;
  setTitle: (t: string) => void;
  checked: boolean;
  setChecked: (b: boolean) => void;
  description: string;
  setDescription: (d: string) => void;
  persistLocal: () => void;
  fillData: (td: TaskData) => void;
}

// TODO rename to distinguish from the one that looks up in DB
export function useTask(data: TaskData): Task {
  const [title, setTitle] = useState(data.title);
  const [checked, setChecked] = useState(data.checked);
  const [description, setDescription] = useState(data.description);

  const persistLocal = () => {
    const d = structuredClone({
      id: data.id,
      title: title,
      checked: checked,
      description: description,
    });
    tasksDB.then((db) => db.put("tasks", d));
  };

  return {
    id: data.id,
    title,
    checked,
    description,
    persistLocal,

    setTitle: (newValue: string) => {
      setTitle(newValue);
      persistLocal();
    },

    setChecked: (newValue: boolean) => {
      setChecked(newValue);
      persistLocal();
    },

    setDescription: (newValue: string) => {
      setDescription(newValue);
      persistLocal();
    },

    fillData: (td: TaskData) => {
      setTitle(td.title);
      setChecked(td.checked);
      setDescription(td.description);
      // if td just came from DB, no need to persist
    },
  };
}

// Task wraps TaskData, updates the IndexedDB copy every time a field is updated
export function emptyTaskWithId(id: TaskId): TaskData {
  return {
    id: id,
    title: "",
    checked: false,
    description: "",
  };
}

export function emptyTask(): TaskData {
  return emptyTaskWithId(randomTaskId());
}

export function useTaskStore(): TaskStore {
  const [orderCache, setOrder] = useState<Task[]>([]);

  return {
    useTaskList: async () => {
      const db = await tasksDB;
      const tx = db.transaction(["list-items", "tasks"]);
      const orderKeys = await tx.objectStore("list-items").get("order");
      const tasks = tx.objectStore("tasks");
      let order: Task[] = [];
      for (const k of orderKeys) {
        const td = await tasks.get(k);
        const t = useTask(td);
        order.push(t);
      }
      setOrder(order);
      return orderCache;
    },

    useTask: (id) => {
      // TODO can this call useTask with the real data, without useEffect?
      const task = useTask(emptyTaskWithId("placeholder" as TaskId));
      useEffect(() => {
        tasksDB.then((db) => {
          db.get("tasks", id).then((td) => {
            task.fillData(td);
          });
        });
      });
      return task;
    },

    // TODO what happens if we delete a task in one tab while its detail page is open in another tab?
    deleteTask: async (id: TaskId) => {
      const tx = (await tasksDB).transaction(
        ["list-items", "tasks"],
        "readwrite"
      );
      setOrder(orderCache.filter((t) => t.id !== id));
      const order = tx.objectStore("list-items").get("order");
      await tx.objectStore("list-items").put(
        order.filter((tid) => tid !== id),
        "order"
      );
      await tx.objectStore("tasks").delete(id);
      await tx.done;
    },

    append: async () => {
      const t = useTask(emptyTask());
      t.persistLocal(); // TODO in one transaction
      setOrder((order) => [...orderCache, t]);
      // TODO kick off write, don't await here
      const tx = (await tasksDB).transaction(
        ["list-items", "tasks"],
        "readwrite"
      );
      await tx.objectStore("tasks").put(t);
      const order = await tx.objectStore("list-items").get("order");
      order.push(t.id);
      await tx.objectStore("list-items").put(order, "order");
      return t;
    },
  };
}
