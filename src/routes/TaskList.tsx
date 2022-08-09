import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTrash,
  faArrowUpRightFromSquare,
} from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";

import { Task, useTaskList } from "../model";
import "../App.css";

export default function TaskList() {
  const { tasks, updateTask, deleteTask, appendTask } = useTaskList();

  return (
    <div className="App">
      <h1>Things to do:</h1>
      <ul className="checklist">
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
              <FontAwesomeIcon icon={faTrash} />
            </button>
            <Link to={`/detail/${t.id}`}>
              <FontAwesomeIcon icon={faArrowUpRightFromSquare} size="xs" />
            </Link>
          </li>
        ))}
      </ul>
      <button className="primary" onClick={() => appendTask()}>
        New Task
      </button>
    </div>
  );
}
