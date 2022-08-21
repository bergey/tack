import { Link } from "preact-router/match";

import { Task, useTaskList } from "../model";

export default function TaskList() {
  const { tasks, updateTask, deleteTask, appendTask } = useTaskList();

  return (
    <>
      <h1>Things to do:</h1>
      <ul className="checklist pageContent">
        {tasks.map((t: Task) => (
          <li key={t.id}>
            <input
              type="checkbox"
              checked={t.checked}
              onChange={(ev) =>
                updateTask(t.id, { checked: ev.target.checked })
              }
            ></input>
            <input
              type="text"
              value={t.title}
              onChange={(ev) => updateTask(t.id, { title: ev.target.value })}
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
