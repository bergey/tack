import { createContext } from "preact";
import { useEffect, useState, useContext } from "preact/hooks";

import { tasksDB} from "./migrations";
import {emptyProject} from "./model";


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
