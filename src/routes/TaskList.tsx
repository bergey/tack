import { Link } from "preact-router/match";

import { Task, useProject } from "../model";

export default function TaskList() {
  const { tasks, updateTask, deleteTask, appendTask } = useProject();

  return (
    <>
      <h1>Things to do:</h1>
      <ul class="checklist pageContent">
        {tasks.map((t: Task) => (
          <li key={t.id}>
            <input
              type="checkbox"
              checked={t.status === "done"}
              onChange={(ev) =>
                updateTask(t.id, (t) => t.status = ev.target.checked  ? "done" : "todo")}
            ></input>
            <input
              type="text"
              value={t.title}
              onChange={(ev) => updateTask(t.id, (t) => t.title = ev.target.value)}
            ></input>
            <button onClick={() => deleteTask(t.id)} aria-label="delete">
              <i class="fa-solid fa-trash"></i>
            </button>
            <Link href={`/detail/${t.id}`} class="button">
              <i class="fa-solid fa-arrow-up-right-from-square"></i>
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
