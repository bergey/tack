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

  return (
    <>
      <h1>{task.title}</h1>
      <p>TODO: put something here</p>
    </>
  );
}
