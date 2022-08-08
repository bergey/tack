import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";

import { TaskId } from "../migrations";
import { Task, TaskStore } from "../model";
import "../App.css";

export default function TaskDetail(props: { taskStore: TaskStore }) {
  const taskId = useParams().taskId as TaskId;
  const taskStore = props.taskStore;
  const [task, setTask] = useState<Task | null>(null);

  useEffect(() => {
    taskStore.get(taskId).then(setTask);
  }, [taskId, taskStore]);

  return (
    task && (
      <>
        <h1>{task.title}</h1>
        <input
          type="text"
          value={task.description}
          onChange={(ev) => (task.description = ev.target.value)}
        ></input>
      </>
    )
  );
}
