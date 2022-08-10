import { TaskId } from "../migrations";
import { useTask } from "../model";
import "../App.css";

export default function TaskDetail({ taskId: TaskId }) {
  const [task, updateTask] = useTask(taskId);

  return (
    task && (
      <>
        <h1>{task.title}</h1>
        <input
          type="text"
          value={task.description}
          onChange={(ev) => updateTask({ description: ev.target.value })}
        ></input>
      </>
    )
  );
}
