import { Link } from "preact-router/match";
import { useContext, useMemo} from "preact/hooks";

import { TaskEntity, TaskId } from "../model";
import { GlobalProject } from "../GlobalProject";

export default function TaskList() {
  const [project, apply] = useContext(GlobalProject);

  const taskList = useMemo(() => project.top.map((taskId: TaskId) => ({id: taskId, ...project.tasks[taskId]})), [project])

  return (
    <>
      <h1>Things to do:</h1>
      <ul className="checklist pageContent">
        {taskList.map((t: TaskEntity): JSX.Element => (
          <li key={t.id}>
            <input
              type="checkbox"
              checked={t.status === "done"}
              onChange={(ev) => apply({action: "set_status", taskId: t.id, status: ev.target.checked ? "done" : "todo"})}
            ></input>
            <input
              type="text"
              value={t.title}
              onChange={(ev) => apply({action: "set_title", taskId: t.id, title: ev.target.value})}
            ></input>
            <button onClick={() => apply({action: "delete_task", taskId: t.id})} aria-label="delete">
              <i className="fa-solid fa-trash"></i>
            </button>
            <Link href={`/detail/${t.id}`} className="button">
              <i className="fa-solid fa-arrow-up-right-from-square"></i>
            </Link>
          </li>
        ))}
      </ul>
      <button className="primary bottom" onClick={() => apply({action: "append_task"})}>
        New Task
      </button>
    </>
  );
}
