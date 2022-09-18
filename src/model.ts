import { useEffect, useState } from "preact/hooks";
import * as Automerge from 'automerge';

import { tasksDB, randomTaskId, TaskId } from "./migrations";
import { rateLimitIndexed } from "./util";
// TODO reexport TaskId

export type Status = "todo" | "wip" | "done" | "blocked" | "cancel";

export interface Task {
  id: TaskId;
  title: string;
  description: string;
  status?: Status; // optional to allow notes
  priority?: number; // default 3 until that's configurable
  scheduled?: date; // TODO recurring
  due?: date;
  parent?: TaskId;
  children: TaskId[];
  tags: string[];
  // clocked: Interval[];
}

export interface Project {
  top: TaskId[];
  tasks: Automerge.Table<Task>;
}

export type PartialTask = {
  [Property in keyof Task as Exclude<Property, "id">]+?: Task[Property];
};

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

export function useTask(taskId: TaskId) : [Task, (update: (old: Task) => Task) => Promise<void>] {
  const [project, setProject] = useContext(GlobalProject);
  const task = project.tasks.byId(taskId);
  // TODO memoize children here

  async function updateTask(update: (old: Task) => Task) {
    const newProject = Automerge.change<Project>(project, (p: Project) => update(p.tasks.byId(taskId)))
    setProject(newProject);
    await persistProject(newProject);
  }

  return [task, updateTask];
}

export interface ProjectActions {
  taskList: Task[];
  updateTask: (taskId: TaskId, update: (old: Task) => Task) => Promise<void>;
  deleteTask: (taskId: TaskId) => Promise<void>;
  appendTask: () => Promise<Task>;
}

const persistProject = rateLimit(2000, // milliseconds
  (p: Project) => tasksDB.then((db) => db.put("projects", p, "global"))
  // TODO later: persist each change & after some time / number of commit saves, persist the full state
)

const GlobalProject = createContext(emptyProject());

export function ProjectProvider({children}) {
  const [project, setProject] = useState(emptyProject());

  useEffect(() => {
    tasksDB.then((db) => db.get("projects", "global").then(setProject));
    // TODO later, try loading from network if we don't have a Project on disk yet
  }, [setProject]);

  return (
    <GlobalProject.Provider value={[project, setProject]}>
      {children}
    </GlobalProject.Provider>
    );
}

// All tasks, and the list of top-level tasks
export function useProject() : ProjectActions {
  const [project, setProject] = useContext(GlobalProject);
  const taskList = useMemo(() => project.top.map((taskId) => p.tasks.byId(taskId)), project)

  async function deleteTask(taskId: TaskId) {
    const newProject = Automerge.change<Project>(project, (p: Project) => {
      // delete from top
      const ix = p.top.find(tid => tid === taskId);
      if (ix !== undefined) {
        p.top.deleteAt(ix);
      }

     p.tasks.remove(taskId);
    })

    setProject(newProject);
    await persistProject(newProject);
  }

  async function appendTask() {
    const newProject = Automerge.change<Project>(project, (p: Project) => {
      const taskId = p.tasks.add(emptyTask());
      p.top.push(taskId);
    })

    setProject(newProject);
    await persistProject(newProject);
  }

 async function updateTask(taskId: TaskId, update: (old: Task) => Task) {
   const newProject = Automerge.change<Project>(project, (p: Project) => {
     const task = p.tasks.byId(taskId);
     update(task);
   })

   setProject(newProject);
   await persistProject(newProject);
 }

  return {taskList, deleteTask, appendTask, updateTask}
}
