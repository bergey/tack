import * as Automerge from 'automerge';

import { tasksDB } from "./migrations";
import { rateLimit } from "./util";

export type TaskId = string & { readonly __tag: unique symbol };

export type Status = "todo" | "wip" | "done" | "blocked" | "cancel";

export interface Task {
  title: string;
  description: string;
  status?: Status; // optional to allow notes
  priority?: number; // default 3 until that's configurable
  scheduled?: Date; // TODO recurring
  due?: Date;
  parent?: TaskId;
  children: TaskId[];
  tags: string[];
  // clocked: Interval[];
}

export interface TaskEntity extends Task {
  id: TaskId;
}

export interface Project {
  top: Automerge.List<TaskId>;
  // top: TaskId[];
  tasks: Automerge.Table<Task>;
}

export function emptyProject() {
  return Automerge.change<Project>(Automerge.init(), 'init schema', (p: Project) => {
    p.top = [];
    p.tasks = new Automerge.Table();
  })
}

// for testing, make this separate from addEmptyTask
export function emptyTask(): Task {
  return {
    title: "",
    description: "",
    children: [],
    tags: [],
    // clocked: []  // TODO datetime, interval
  };
}

export const persistProject = rateLimit(2000, // milliseconds
  (p: Project) => tasksDB.then((db) => db.put("projects", p, "global"))
  // TODO later: persist each change & after some time / number of commit saves, persist the full state
)
