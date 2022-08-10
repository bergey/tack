import { useEffect, useState } from "react";

import { tasksDB, randomTaskId, TaskId } from "./migrations";
import { rateLimitIndexed } from "./util";
// TODO reexport TaskId

export interface Task {
  id: TaskId;
  title: string;
  checked: boolean;
  description: string;
}

export type PartialTask = {
  [Property in keyof Task as Exclude<Property, "id">]+?: Task[Property];
};

// Task wraps TaskData, updates the IndexedDB copy every time a field is updated
export function emptyTaskWithId(id: TaskId): Task {
  return {
    id: id,
    title: "",
    checked: false,
    description: "",
  };
}

export function emptyTask(): Task {
  return emptyTaskWithId(randomTaskId());
}

const persistLocal = rateLimitIndexed(
  2000, // milliseconds
  (t) => t.id,
  (task: Task) => tasksDB.then((db) => db.put("tasks", task))
);

export function useTask(
  id: TaskId
): [Task, (partial: PartialTask) => Promise<void>] {
  const [task, setTask] = useState(emptyTaskWithId("placeholder" as TaskId));
  useEffect(() => {
    tasksDB.then((db) => {
      db.get("tasks", id).then(setTask);
    });
  }, [id]);

  async function updateTask(partial: PartialTask) {
    let t = { ...task, ...partial };
    setTask(t);
    await persistLocal(t);
  }

  return [task, updateTask];
}

// list of tasks and operations thereon.  The promises allow taking some other
// action after the change has been persisted to local disk.
export interface TaskList {
  tasks: Task[];
  updateTask: (id: TaskId, partial: PartialTask) => Promise<void>;
  deleteTask: (id: TaskId) => Promise<void>;
  appendTask: () => Promise<Task>;
}

export function useTaskList(): TaskList {
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    (async () => {
      const tx = (await tasksDB).transaction(["list-items", "tasks"]);
      const taskKeys = await tx.objectStore("list-items").get("order");
      const tasksStore = tx.objectStore("tasks");
      const ts = await Promise.all(
        taskKeys.map((k: TaskId) => tasksStore.get(k))
      );
      setTasks(ts);
    })();
  }, []);

  async function deleteTask(id: TaskId) {
    setTasks(tasks.filter((t) => t.id !== id));
    const tx = (await tasksDB).transaction(
      ["list-items", "tasks"],
      "readwrite"
    );
    const order = await tx.objectStore("list-items").get("order");
    await tx.objectStore("list-items").put(
      order.filter((tid: TaskId) => tid !== id),
      "order"
    );
    await tx.objectStore("tasks").delete(id);
    await tx.done;
  }

  async function appendTask() {
    let t = emptyTask();
    setTasks((ts) => [...ts, t]);
    const tx = (await tasksDB).transaction(
      ["list-items", "tasks"],
      "readwrite"
    );
    await tx.objectStore("tasks").put(t); // persistLocal, but in tx
    const order = await tx.objectStore("list-items").get("order");
    order.push(t.id);
    await tx.objectStore("list-items").put(order, "order");
    return t;
  }

  async function updateTask(id: TaskId, partial: PartialTask) {
    setTasks((ts) =>
      ts.map((t) => {
        if (t.id === id) {
          const task = { ...t, ...partial };
          persistLocal(task);
          return task;
        } else {
          return t;
        }
      })
    );
  }

  return { tasks, updateTask, deleteTask, appendTask };
}
