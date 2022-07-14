import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { task, TaskId, taskStore, TaskStore, emptyTask } from "../model";
import "../App.css";

export default function TaskDetail() {
  const taskId = useParams().taskId as TaskId;
  const [task, setTask] = useState<task>(emptyTask(taskId));

  // load from local DB on mount
  useEffect(() => {
    taskStore.get(taskId).then(setTask);
  }, [taskStore, taskId]);

  function setDesc(ev: React.ChangeEvent<HTMLInputElement>) {
    const newDesc = ev.target.value;
    setTask((oldTask) => ({ ...oldTask, description: newDesc }));
    taskStore.setDescription(taskId, newDesc);
  }

  return (
    <>
      <h1>{task.title}</h1>
      <input type="text" value={task.description} onChange={setDesc}></input>
    </>
  );
}
