import React, {useEffect, useState} from 'react';
import { openDB } from 'idb';

import './App.css';

const theStore = 'list-items'
const theKey = 'the-list'

const tasksDB = openDB('tasks', 2, {
  upgrade(db, oldVersion, _newVersion, tx) {
    if (oldVersion < 1) {
      db.createObjectStore(theStore)
      tx.objectStore(theStore).put([""], theKey)
    }
    if (oldVersion < 2) {
      const store = tx.objectStore(theStore)
      store.get(theKey)
      .then(oldTasks =>
        store.put(oldTasks.map((title: string) => ({title: title, checked: false})), theKey)
      )
    }
  }
})

interface task {
  title: string;
  checked: boolean;
}

function App() {
  const [tasks, setTasks] = useState<task[]>([])
  const [loadedFromDB, markLoadedFromDB] = useState<boolean>(false) // becomes true once, stays true

  // load from local DB on mount
  useEffect(() => {
    tasksDB
      .then(db => db.get(theStore, theKey))
      .then(newTasks => {
        console.log(newTasks)
        setTasks(newTasks)
        markLoadedFromDB(true)
      })
  }, [])

  useEffect(() => {
    if (loadedFromDB) { // ensure we don't write [] before loading from DB
      tasksDB.then(db => db.put(theStore, tasks, theKey))
    }
  }, [tasks, loadedFromDB])

  const editTask = (key: number) => (event: React.ChangeEvent<HTMLInputElement>) => setTasks((oldTasks: task[]) => {
    let newTasks = [...oldTasks]
    newTasks[key].title = event.target.value;
    return newTasks
  })

  const appendEmpty = () => setTasks(oldTasks => {
    const newTasks = [...oldTasks, {title: '', checked: false}]
    return newTasks
  })

  const deleteTask = (key: number) => () =>
    setTasks(oldTasks => {
      const newTasks = [...oldTasks.slice(0, key), ...oldTasks.slice(key+1, oldTasks.length)]
      return newTasks
    })

  const checkTask = (key: number) => (event: React.ChangeEvent<HTMLInputElement>) => setTasks((oldTasks: task[]) => {
    let newTasks = [...oldTasks]
    console.log(event)
    console.log(event.target)
    newTasks[key].checked = event.target.checked
    return newTasks
  })

  return (
    <div className="App">
        <h1>
            Things to do:
        </h1>
        <ul className="checklist">
            {tasks && tasks.map( (t: task, i: number) => (
              <li key={i}>
                  <input type="checkbox" checked={t.checked} onChange={checkTask(i)}></input>
                  <input type="text" value={t.title} onChange={editTask(i)}></input>
                  <button onClick={deleteTask(i)}>-</button>
              </li>
            ))}
        </ul>
        <button onClick={appendEmpty}>New Task</button>

    </div>
  );
}

export default App;
