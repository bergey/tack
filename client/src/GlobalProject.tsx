import { createContext, ComponentChildren} from "preact";
import { useEffect, useState } from "preact/hooks";

import { loadProject, persistProject } from "./migrations";
import { Operation, Project, emptyProject} from "./model";
import { doNothing } from "./util";
import { initWS } from "./websocket";


export const GlobalProject = createContext<[Project, (op: Operation) => void]>([emptyProject(), doNothing]);

export function ProjectProvider({children} : {children : ComponentChildren}) {
  const [project, setProject] = useState(emptyProject());
  const [{apply}, setApply] = useState<{apply: (op: Operation) => void}>({apply: doNothing})

  useEffect(() => {
    (async () => {
      const savedProject = await loadProject()
      setProject(savedProject);
      setApply({
        apply: initWS(savedProject, (p: Project) => {
          setProject(p);
          persistProject(p);
      })});
      // TODO later, try loading from network if we don't have a Project on disk yet
    })()
  }, [setProject]);

  return (
    <GlobalProject.Provider value={[project, apply]}>
      {children}
    </GlobalProject.Provider>
    );
}
