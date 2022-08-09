import { useParams } from "react-router-dom";

import { TaskId } from "../migrations";
import { useTaskStore } from "../model";
import "../App.css";

export default function TaskDetail() {
  const taskId = useParams().taskId as TaskId;
  const taskStore = useTaskStore();
  const task = taskStore.useTask(taskId);

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
