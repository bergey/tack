import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";

import { task, TaskStore } from "./model";

export default function TaskList({ taskStore }: { taskStore: TaskStore }) {
  const [tasks, setTasks] = useState<task[]>([]);
  const [loadedFromDB, markLoadedFromDB] = useState<boolean>(false); // becomes true once, stays true

  // load from local DB on mount
  useEffect(() => {
    taskStore.get.then((newTasks) => {
      console.log(newTasks);
      setTasks(newTasks);
      markLoadedFromDB(true);
    });
  }, [taskStore.get]);

  useEffect(() => {
    // ensure we don't write [] before loading from DB
    if (loadedFromDB) {
      taskStore.set(tasks);
    }
  }, [tasks, loadedFromDB, taskStore]);

  const editTask =
    (key: number) => (event: React.ChangeEvent<HTMLInputElement>) =>
      setTasks((oldTasks: task[]) => {
        let newTasks = [...oldTasks];
        newTasks[key].title = event.target.value;
        return newTasks;
      });

  const appendEmpty = () =>
    setTasks((oldTasks) => {
      const newTasks = [...oldTasks, { title: "", checked: false }];
      return newTasks;
    });

  const deleteTask = (key: number) => () =>
    setTasks((oldTasks) => {
      const newTasks = [
        ...oldTasks.slice(0, key),
        ...oldTasks.slice(key + 1, oldTasks.length),
      ];
      return newTasks;
    });

  const checkTask =
    (key: number) => (event: React.ChangeEvent<HTMLInputElement>) =>
      setTasks((oldTasks: task[]) => {
        let newTasks = [...oldTasks];
        console.log(event);
        console.log(event.target);
        newTasks[key].checked = event.target.checked;
        return newTasks;
      });

  return (
    <div className="App">
      <h1>Things to do:</h1>
      <ul className="checklist">
        {tasks &&
          tasks.map((t: task, i: number) => (
            <li key={i}>
              <input
                type="checkbox"
                checked={t.checked}
                onChange={checkTask(i)}
              ></input>
              <input type="text" value={t.title} onChange={editTask(i)}></input>
              <button onClick={deleteTask(i)} aria-label="delete">
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
