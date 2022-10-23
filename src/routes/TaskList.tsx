import { Link } from "preact-router/match";

import { Task, TaskEntity } from "../model";
import { useProject } from "../hooks";

export default function TaskList() {
  const { taskList, updateTask, markDone, deleteTask, appendTask } = useProject();

  return (
    <>
      <h1>Things to do:</h1>
      <ul className="checklist pageContent">
        {taskList.map((t: TaskEntity): JSX.Element => (
          <li key={t.id}>
            <input
              type="checkbox"
              checked={t.status === "done"}
              onChange={(ev) => updateTask(t.id, (t: Task) => markDone(t.id, ev.target.checked))}
            ></input>
            <input
              type="text"
              value={t.title}
              onChange={(ev) => updateTask(t.id, (t) => {
                t.title = ev.target.value;
                return t;
              })}
            ></input>
            <button onClick={() => deleteTask(t.id)} aria-label="delete">
              <i className="fa-solid fa-trash"></i>
            </button>
            <Link href={`/detail/${t.id}`} className="button">
              <i className="fa-solid fa-arrow-up-right-from-square"></i>
            </Link>
          </li>
        ))}
      </ul>
      <button className="primary bottom" onClick={() => appendTask()}>
        New Task
      </button>
    </>
  );
}
