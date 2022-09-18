import { createContext, ComponentChildren} from "preact";
import { useEffect, useState, StateUpdater } from "preact/hooks";
// import type { StateUpdater } from "preact/hooks";

import { tasksDB} from "./migrations";
import {Project, emptyProject} from "./model";


export const GlobalProject = createContext<[Project, StateUpdater<Project>]>([emptyProject(), () => {}]);

export function ProjectProvider({children} : {children : ComponentChildren}) {
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
