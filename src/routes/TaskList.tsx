import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTrash,
  faArrowUpRightFromSquare,
} from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";

import { Task, TaskStore } from "../model";
import "../App.css";

export default function TaskList({ taskStore }: { taskStore: TaskStore }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  useEffect(() => {
    taskStore.getAll().then(setTasks);
  }, [taskStore]);

  return (
    <div className="App">
      <h1>Things to do:</h1>
      <ul className="checklist">
        {tasks &&
          tasks.map((t: Task) => (
            <li key={t.id}>
              <input
                type="checkbox"
                checked={t.checked}
                onChange={(ev) => (t.checked = ev.target.checked)}
              ></input>
              <input
                type="text"
                value={t.title}
                onChange={(ev) => (t.title = ev.target.value)}
              ></input>
              <button
                onClick={() => taskStore.deleteTask(t.id)}
                aria-label="delete"
              >
                <FontAwesomeIcon icon={faTrash} />
              </button>
              <Link to={`/detail/${t.id}`}>
                <FontAwesomeIcon icon={faArrowUpRightFromSquare} size="xs" />
              </Link>
            </li>
          ))}
      </ul>
      <button className="primary" onClick={() => taskStore.append("")}>
        New Task
      </button>
    </div>
  );
}
