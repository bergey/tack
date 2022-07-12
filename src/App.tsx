import React, {useState} from 'react';
import './App.css';

function App() {
  const [tasks, setTasks] = useState<string[]>([""])

  const editTask = (key: number) => (event: React.ChangeEvent<HTMLInputElement>) => setTasks((oldTasks: string[]) => {
    let ret = [...oldTasks]
    ret[key] = event.target.value;
    return ret
  })

  const appendEmpty = () => setTasks(oldTasks => [...oldTasks, ""])

  const deleteTask = (key: number) => () =>
    setTasks(oldTasks => [...oldTasks.slice(0, key), ...oldTasks.slice(key+1, oldTasks.length)])

  return (
    <div className="App">
        <h1>
          Things to do:
        </h1>
        <ul>
            {tasks && tasks.map( (t: string, i: number) => (
              <li>
                  <input type="text" key={i} value={t} onChange={editTask(i)}></input>
                  <button onClick={deleteTask(i)}>-</button>
              </li>
))}
        </ul>
        <button onClick={appendEmpty}>New Task</button>

    </div>
  );
}

export default App;
