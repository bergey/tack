import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";

import { task, TaskStore } from "./model";

export default function TaskList({ taskStore }: { taskStore: TaskStore }) {
  const [tasks, setTasks] = useState<task[]>([]);

  // load from local DB on mount
  useEffect(() => taskStore.getAll().then(setTasks), [taskStore.getAll]);

  const editTask =
    (key: string) => (event: React.ChangeEvent<HTMLInputElement>) =>
      setTasks((oldTasks: task[]) => {
        let newTitle = event.target.value;
        let newTasks = [...oldTasks];
        newTasks[key].title = newTitle;
        taskStore.setTitle(key, newTitle);
        return newTasks;
      });

  const appendEmpty = () =>
    setTasks((oldTasks) => {
      const newTasks = [...oldTasks, { title: "", checked: false }];
      // TODO persist to DB
      return newTasks;
    });

  const deleteTask = (key: string) => () =>
    setTasks((oldTasks) => {
      const newTasks = oldTasks.filter((t) => t.id !== key);
      // TODO persist to DB
      return newTasks;
    });

  const checkTask =
    (key: string) => (event: React.ChangeEvent<HTMLInputElement>) =>
      setTasks((oldTasks: task[]) => {
        let newTasks = [...oldTasks];
        console.log(event);
        console.log(event.target);
        newTasks[key].checked = event.target.checked;
        // TODO persist to DB
        return newTasks;
      });

  return (
    <div className="App">
      <h1>Things to do:</h1>
      <ul className="checklist">
        {tasks &&
          tasks.map((t: task) => (
            <li key={t.id}>
              <input
                type="checkbox"
                checked={t.checked}
                onChange={checkTask(t.id)}
              ></input>
              <input
                type="text"
                value={t.title}
                onChange={editTask(t.id)}
              ></input>
              <button onClick={deleteTask(t.id)} aria-label="delete">
                <FontAwesomeIcon icon={faTrash} />
              </button>
            </li>
          ))}
      </ul>
      <button className="primary" onClick={appendEmpty}>
        New Task
      </button>
    </div>
  );
}
