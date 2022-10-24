import { useTask } from "../hooks";
import { TaskId } from "../model";
import { isoDate } from "../util";

export default function TaskDetail({ taskId }: {taskId: TaskId}) {
  const {task, updateTask, markDone} = useTask(taskId);

  return (
    task && (
      <div className="column">
        <h1>{task.title}</h1>
        <div id="metadata">
          <input
            type="checkbox"
            checked={task.status === "done"}
            onChange={(ev) => markDone(ev.target.checked)}
          ></input>
          <input
            type="date"
            value={task.due}
            onChange={(ev) => updateTask((t) => { t.due = ev.target.value })}
          ></input>
          <button onClick={() => updateTask((t) => { delete t.due; })}>unschedule</button>
        </div>
        <textarea
          value={task.description}
          onChange={(ev) => updateTask((t) => {t.description = ev.target.value; })}
        ></textarea>
      </div>
    )
  );
}
