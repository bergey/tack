import { useState } from "react";

import { tasksDB, randomTaskId, TaskId } from "./migrations";
// TODO reexport TaskId

interface TaskData {
  id: TaskId;
  title: string;
  checked: boolean;
  description: string;
}

export interface TaskStore {
  getAll: () => Promise<Task[]>;
  get: (id: TaskId) => Promise<Task>;
  deleteTask: (id: TaskId) => Promise<void>;
  append: (title: string) => Promise<Task>;
}

// Task wraps TaskData, updates the IndexedDB copy every time a field is updated
export class Task {
  #id: TaskId;
  #title: string;
  #setTitle: (t: string) => void;
  #checked: boolean;
  #setChecked: (b: boolean) => void;
  #description: string;
  #setDescription: (d: string) => void;

  constructor(data: TaskData) {
    this.#id = data.id;
    [this.#title, this.#setTitle] = useState(data.title);
    [this.#checked, this.#setChecked] = useState(data.checked);
    [this.#description, this.#setDescription] = useState(data.description);
  }

  // TODO is this racy with multiple pending calls for the same Task?
  // TODO make it possible to call from within a transaction
  async persistLocal() {
    const data = {
      id: this.#id,
      title: this.#title,
      checked: this.#checked,
      description: this.#description,
    };
    (await tasksDB).put("tasks", data);
  }

  get id(): TaskId {
    return this.#id;
  }
  // no setter for id

  // setters, getters below here are identical boilerplate, mod field name, type
  // TODO consider making the fields public but readonly, so I don't need the getters
  // in which case rename `set title` to setTitle &c
  get title(): string {
    return this.#title;
  }
  set title(newValue: string) {
    this.#setTitle(newValue);
    // start IndexedDB update, do not await
    this.persistLocal();
  }

  get checked(): boolean {
    return this.#checked;
  }
  set checked(newValue: boolean) {
    this.#setChecked(newValue);
    this.persistLocal();
  }

  get description(): string {
    return this.#description;
  }
  set description(newValue: string) {
    this.#setDescription(newValue);
    this.persistLocal();
  }
}

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

// singleton with all currently-used Tasks
// ensures we don't hand out multiple Tasks representing the same DB record
const taskCache: Map<TaskId, WeakRef<Task>> = new Map();
const [orderCache, setOrder] = useState<Task[]>([]);

export const taskStore: TaskStore = {
  getAll: async () => {
    const db = await tasksDB;
    const tx = db.transaction(["list-items", "tasks"]);
    const orderKeys = await tx.objectStore("list-items").get("order");
    const tasks = tx.objectStore("tasks");
    let order: Task[] = [];
    for (const k of orderKeys) {
      const cached = taskCache.get(k)?.deref();
      if (cached) {
        order.push(cached);
      } else {
        const t = await tasks.get(k);
        taskCache.set(k, new WeakRef(t));
        order.push(t);
      }
    }
    setOrder(order);
    return orderCache;
  },

  get: async (id) => {
    const cached = taskCache.get(id)?.deref();
    if (cached) {
      return cached;
    } else {
      const data = await (await tasksDB).get("tasks", id);
      const t = new Task(data);
      taskCache.set(id, new WeakRef(t));
      return t;
    }
  },

  // TODO what happens if we delete a task in one tab while its detail page is open in another tab?
  deleteTask: async (id: TaskId) => {
    setOrder((order) => order.filter((t) => t.id !== id));
    const tx = (await tasksDB).transaction(
      ["list-items", "tasks"],
      "readwrite"
    );
    await tx.objectStore("list-items").put(orderCache, "order");
    await tx.objectStore("tasks").delete(id);
    tx.done;
  },

  append: async () => {
    const t = new Task(emptyTask());
    setOrder((order) => [...order, t]);
    t.persistLocal();
    // TODO cache Task
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
