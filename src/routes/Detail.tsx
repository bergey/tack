import { TaskId } from "../migrations";
import { useTask } from "../model";
import "../App.css";

export default function TaskDetail({ taskId, ...props }) {
  const [task, updateTask] = useTask(taskId);

  return (
    task && (
      <div class="column">
        <h1>{task.title}</h1>
        <div id="metadata">
          <input
            type="checkbox"
            checked={task.checked}
            onChange={(ev) => updateTask({ checked: ev.target.checked })}
          ></input>
          <input
            type="date"
            value={task.date || ""}
            onChange={(ev) => updateTask({ date: ev.target.value })}
          ></input>
          <button onClick={() => updateTask({ date: null })}>unschedule</button>
        </div>
        <textarea
          value={task.description}
          onChange={(ev) => updateTask({ description: ev.target.value })}
        ></textarea>
      </div>
    )
  );
}
