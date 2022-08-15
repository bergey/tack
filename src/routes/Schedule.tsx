import { Link } from "preact-router/match";
import { useMemo } from "preact/hooks";

import { Task, useTaskList } from "../model";
import { isoDate } from "../util";

export default function Schedule() {
  const { tasks } = useTaskList();
  const scheduled = useMemo(
    () =>
      tasks
        .filter((t) => t.date)
        .map((t) => ({ ...t, date: new Date(t.date) }))
        .sort((a, b) => a.date - b.date),
    [tasks]
  );

  return (
    <>
      {scheduled.map((t) => (
        <p>
          <Link href={`/detail/${t.id}`}>
            {t.title} ({isoDate(t.date)})
          </Link>
        </p>
      ))}
    </>
  );
}
