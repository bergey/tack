import * as Automerge from 'automerge';
import { useContext, useMemo } from "preact/hooks";

import { Project, TaskId, Task, TaskEntity, emptyTask, persistProject} from "./model";
import {GlobalProject} from "./GlobalProject";

export function useTask(taskId: TaskId) : [Task, (update: (old: Task) => Task) => Promise<void>] {
  const [project, setProject] = useContext(GlobalProject);
  const task = project.tasks.byId(taskId);
  // TODO memoize children here

  async function updateTask(update: (old: Task) => Task) {
    const newProject = Automerge.change<Project>(project, (p: Project) => update(p.tasks.byId(taskId)))
    setProject(newProject);
    persistProject(newProject);
  }

  return [task, updateTask];
}

export interface ProjectActions {
  taskList: TaskEntity[];
  updateTask: (taskId: TaskId, update: (old: Task) => Task) => Promise<void>;
  deleteTask: (taskId: TaskId) => Promise<void>;
  appendTask: () => Promise<Task>;
}

// All tasks, and the list of top-level tasks
export function useProject() : ProjectActions {
  const [project, setProject] = useContext(GlobalProject);
  const taskList = useMemo(() => project.top.map((taskId) => project.tasks.byId(taskId)), [project])

  async function deleteTask(taskId: TaskId) {
    const newProject = Automerge.change<Project>(project, (p: Project) => {
      // delete from top
      const ix = p.top.findIndex(tid => tid === taskId);
      if (ix !== undefined) {
        p.top.deleteAt(ix);
      }

     p.tasks.remove(taskId);
    })

    setProject(newProject);
    persistProject(newProject);
  }

  async function appendTask() {
    const newProject = Automerge.change<Project>(project, (p: Project) => {
      const taskId = p.tasks.add(emptyTask()) as TaskId;
      p.top.push(taskId);
    })

    setProject(newProject);
    persistProject(newProject);
    // find the Task we just created
    return newProject.tasks.byId(newProject.top[newProject.top.length - 1])
  }

 async function updateTask(taskId: TaskId, update: (old: Task) => Task) {
   const newProject = Automerge.change<Project>(project, (p: Project) => {
     const task = p.tasks.byId(taskId);
     update(task);
   })

   setProject(newProject);
   persistProject(newProject);
 }

  return {taskList, deleteTask, appendTask, updateTask}
}
