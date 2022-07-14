import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";

import { task, TaskId, TaskStore } from "./model";
import { newDebouncer, Debouncer } from "./util";

export default function TaskList({ taskStore }: { taskStore: TaskStore }) {
  const [tasks, setTasks] = useState<task[]>([]);

  // load from local DB on mount
  useEffect(() => {
    taskStore.getAll().then(setTasks);
  }, [taskStore]);

  function updateOnKey(
    key: TaskId,
    update: (t: task) => void,
    tasks: task[]
  ): task[] {
    return tasks.map((t) => {
      if (t.id === key) {
        let newTask = structuredClone(t);
        update(newTask);
        return newTask;
      } else {
        return t;
      }
    });
  }

  let editTaskDebouncers = new Map<TaskId, Debouncer>();
  const editTask = (key: TaskId) => {
    return (event: React.ChangeEvent<HTMLInputElement>) => {
      let newTitle = event.target.value;
      setTasks((oldTasks: task[]) =>
        updateOnKey(key, (t) => (t.title = newTitle), oldTasks)
      );
      let debounce = editTaskDebouncers.get(key);
      if (debounce === undefined) {
        debounce = newDebouncer(5000);
        editTaskDebouncers.set(key, debounce);
      }
      debounce(() => taskStore.setTitle(key, newTitle));
    };
  };

  const appendEmpty = async () => {
    const id = await taskStore.append("");
    // TODO avoid duplicating content of new task
    setTasks((oldTasks) => [
      ...oldTasks,
      { id: id, title: "", checked: false },
    ]);
  };

  const deleteTask = (key: TaskId) => () => {
    setTasks((oldTasks) => oldTasks.filter((t) => t.id !== key));
    taskStore.deleteTask(key);
  };

  const checkTask =
    (key: TaskId) => (event: React.ChangeEvent<HTMLInputElement>) => {
      const checked = event.target.checked;
      setTasks((oldTasks: task[]) =>
        updateOnKey(key, (t) => (t.checked = checked), oldTasks)
      );
      taskStore.checkTask(key, checked);
    };

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
