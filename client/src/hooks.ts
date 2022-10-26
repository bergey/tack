import * as Automerge from 'automerge';
import { useContext, useMemo } from "preact/hooks";

import { Project, TaskId, Task, TaskEntity, syncServer, emptyTask, persistProject, randomTaskId} from "./model";
import {GlobalProject} from "./GlobalProject";

export interface TaskActions {
  task: Task;
  updateTask(update: (old: Task) => void): Promise<void>;
  markDone(done: boolean): Promise<void>;
}

export function useTask(taskId: TaskId) : TaskActions {
  const [project, setProject] = useContext(GlobalProject);
  const task = project.tasks[taskId];
  // TODO memoize children here

  async function updateTask(update: (old: Task) => void) {
    const newProject = Automerge.change<Project>(project, (p: Project) => update(p.tasks[taskId]))
    setProject(newProject);
    persistProject(newProject);
  }

  async function markDone(done: boolean) {
    updateTask((t: Task) => {
      t.status = done ? "done" : "todo";
    });
  }

  return {task, updateTask, markDone};
}

export interface ProjectActions {
  taskList: TaskEntity[];
  updateTask: (taskId: TaskId, update: (old: Task) => void) => Promise<void>;
  deleteTask: (taskId: TaskId) => Promise<void>;
  appendTask: () => Promise<Task>;
  markDone(taskId: TaskId, done: boolean): Promise<void>;
}

// All tasks, and the list of top-level tasks
export function useProject() : ProjectActions {
  const [project, setProject] = useContext(GlobalProject);
  const taskList = useMemo(() => project.top.map((taskId: TaskId) => ({id: taskId, ...project.tasks[taskId]})), [project])

  async function deleteTask(taskId: TaskId) {
    const newProject = Automerge.change<Project>(project, (p: Project) => {
      // delete from top
      const ix = p.top.findIndex(tid => tid === taskId);
      if (ix !== undefined) {
        // @ts-ignore top should be an Automerge list with deleteAt, but if it's not, I want the exception
        p.top.deleteAt(ix);
      }

     delete p.tasks[taskId];
    })

    setProject(newProject);
    persistProject(newProject);
  }

  async function appendTask() {
    const newProject = Automerge.change<Project>(project, (p: Project) => {
      const taskId = randomTaskId();
      p.tasks[taskId] = emptyTask();
      p.top.push(taskId);
    })

    setProject(newProject);
    persistProject(newProject);
    // find the Task we just created
    return newProject.tasks[newProject.top[newProject.top.length - 1]]
  }

 async function updateTask(taskId: TaskId, update: (old: Task) => void) {
   const newProject = Automerge.change<Project>(project, (p: Project) => {
     update(p.tasks[taskId]);
   })

   setProject(newProject);
   syncServer(newProject);
   persistProject(newProject);
 }

  async function markDone(taskId: TaskId, done: boolean) {
    updateTask(taskId, (t: Task) => {
      t.status = done ? "done" : "todo";
    });
  }

  return {taskList, deleteTask, appendTask, updateTask, markDone}
}
