import * as Automerge from 'automerge';
import { diffChars } from "diff";


// Every Task has a unique ID, should be global but we depend on probability
export type TaskId = string & { readonly __tag: unique symbol };

// base64 encoded 128-bit random values
// idb keys need to be strings, but for wire format we might prefer 16-byte binary representation
export function random128Bit(): string {
  let a = new BigUint64Array(2);
  crypto.getRandomValues(a);
  return (btoa as any)(a);
}

export const randomTaskId = () => random128Bit() as TaskId;

export type Status = "todo" | "wip" | "done" | "blocked" | "cancel";

export interface Task {
  title: Automerge.Text;
  description: string;
  status?: Status; // optional to allow notes
  priority?: number; // default 3 until that's configurable
  scheduled?: Date; // TODO recurring
  due?: string; // Date
  parent?: TaskId;
  children: TaskId[];
  tags: string[];
  // clocked: Interval[];
}

export interface TaskEntity extends Task {
  id: TaskId;
}

export interface TaskMap {
  [id: TaskId]: Task
}

export interface Project {
  top: Automerge.List<TaskId>;
  tasks: TaskMap;
}

export function emptyProject(): Project {
  // ensure schema init change has the same actor everywhere, in case user makes edits before first server sync
  let schema = Automerge.change<Project>(
    Automerge.init({ actorId: '0000' }), { time: 0, message: 'init schema'},
    (p: Project) => {
      p.top = [];
      p.tasks = {};
  });
  let [ret] = Automerge.applyChanges<Project>(Automerge.init(), [Automerge.getLastLocalChange(schema)]);
  return ret;
}

// for testing, make this separate from addEmptyTask
export function emptyTask(): Task {
  return {
    title: new Automerge.Text(),
    description: "", // TODO Text
    children: [],
    tags: [],
    // clocked: []  // TODO datetime, interval
  };
}

// Single Task
type UpdateTask
  = { action: "set_status"; status: Status;}
  | { action: "set_title"; title: string;}
 | { action: "set_due"; due: string; }

export type Operation
  = { action: "append_task"; }
  | { action: "delete_task"; taskId: TaskId; }
  | ({ taskId: TaskId; } & UpdateTask)

// apply an Operation to a Project proxy (which records changes for Automerge)
export function apply(p: Project, op: Operation): void {
  switch (op.action) {
      case "append_task": {
        const taskId = randomTaskId();
        p.tasks[taskId] = emptyTask();
        p.top.push(taskId);
        break;
      }
      case "delete_task": {
        // delete from top
        const ix = p.top.findIndex(tid => tid === op.taskId);
        if (ix !== undefined) {
          // @ts-ignore top should be an Automerge list with deleteAt, but if it's not, I want the exception
          p.top.deleteAt(ix);
        }

        delete p.tasks[op.taskId];
        break;
      }
      case "set_title": {
          const changes = diffChars(p.tasks[op.taskId].title.toString(), op.title);
          console.log({ old: p.tasks[op.taskId].title.toString(), newString: op.title, changes });
          let index = 0; // position in text corresponding to most-recently processed change
          for (const c of changes) {
              if (c.added) {
                p.tasks[op.taskId].title.insertAt?.(index, ...c.value.split(''));
                index += c.count;
              } else if (c.removed) {
                  for (let i = 0; i < c.value.length; i++) {
                      p.tasks[op.taskId].title.deleteAt?.(index)
                      // don't update index because c.value isn't in text anymore
                  }
              } else {
                  // no change, just update index
                  index += c.value.length
              }
          }
        // diffText(p.tasks[op.taskId].title , op.title);
        break;
      }
      case "set_status": {
        p.tasks[op.taskId].status = op.status;
        break;
      }
      case "set_due": {
        p.tasks[op.taskId].due = op.due;
        break;
      }
  }
}

// Call inside Automerge.change, so methods on text are intercepted and applied
export function diffText(text: Automerge.Text, newString: string) {
  const changes = diffChars(text.toString(), newString);
  console.log({old: text.toString(), newString, changes});
  let index = 0; // position in text corresponding to most-recently processed change
  for (const c of changes) {
    if (c.added) {
      text.insertAt?.(index, c.value);
      index += c.value.length;
    } else if (c.removed) {
      for (let i = 0; i < c.value.length; i++) {
        text.deleteAt?.(index)
        // don't update index because c.value isn't in text anymore
      }
    } else {
      // no change, just update index
      index += c.value.length
    }
  }
}
