import { useState } from "preact/hooks";
import { Link } from "preact-router/match";
import { useMemo } from "preact/hooks";

import { Task, useTaskList } from "../model";

const whitespace = new RegExp("s+");

export default function Search() {
  const { tasks } = useTaskList();
  const [search, setSearch] = useState("");

  const searchWords = useMemo(
    () => (search ? search.split(whitespace) : []),
    [search]
  );

  // every search word matches task somewhere
  const matching = tasks.filter((t) =>
    searchWords.reduce(
      (acc, word) =>
        acc && (t.title.includes(word) || t.description.includes(word)),
      true
    )
  );

  return (
    <>
      {/* div so search retains focus https://github.com/preactjs/preact/issues/3242 */}
      <div class="pageContent">
        {matching.map((t) => (
          <p key={t.id}>
            <Link href={`/detail/${t.id}`}>{t.title}</Link>
          </p>
        ))}
      </div>
      <input
        type="text"
        class="primary bottom"
        value={search}
        onInput={(ev) => setSearch(ev.target.value)}
      ></input>
    </>
  );
}
