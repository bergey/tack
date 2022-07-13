import React, {useEffect, useState} from 'react';
import { openDB, deleteDB, wrap, unwrap } from 'idb';

import './App.css';

const theStore = 'list-items'
const theKey = 'the-list'
const tasksDB = openDB('tasks', 1, {
  upgrade(db) {
    db.createObjectStore(theStore)
    db.put(theStore, [""], theKey)
}
})

function App() {
  const [tasks, setTasks] = useState<string[]>([""])

  // load from local DB on mount
  useEffect(() => {
    tasksDB
      .then(db => db.get(theStore, theKey))
      .then(newTasks => {
        console.log(newTasks)
        setTasks(newTasks)
      })
  }, [])

  // TODO would be nicer to write to DB in another useEffect so it doesn't need to be part of every mutation function
  // OTOH, might be able to make smaller writes this way, with a different DB schema

  const persistTasks = (tasks: string[]) => tasksDB.then(db => db.put(theStore, tasks, theKey))

  const editTask = (key: number) => (event: React.ChangeEvent<HTMLInputElement>) => setTasks((oldTasks: string[]) => {
    let newTasks = [...oldTasks]
    newTasks[key] = event.target.value;
    persistTasks(newTasks)
    return newTasks
  })

  const appendEmpty = () => setTasks(oldTasks => {
    const newTasks = [...oldTasks, ""]
    persistTasks(newTasks)
    return newTasks
  })

  const deleteTask = (key: number) => () =>
    setTasks(oldTasks => {
      const newTasks = [...oldTasks.slice(0, key), ...oldTasks.slice(key+1, oldTasks.length)]
      persistTasks(newTasks)
      return newTasks
    })

  return (
    <div className="App">
        <h1>
            Things to do:
        </h1>
        <ul>
            {tasks && tasks.map( (t: string, i: number) => (
              <li key={i}>
                  <input type="text" value={t} onChange={editTask(i)}></input>
                  <button onClick={deleteTask(i)}>-</button>
              </li>
            ))}
        </ul>
        <button onClick={appendEmpty}>New Task</button>

    </div>
  );
}

export default App;
