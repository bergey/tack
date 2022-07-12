import React, {useState} from 'react';
import logo from './logo.svg';
import './App.css';

function App() {
  let text, setText = useState("")
  return (
    <div className="App">
        <h1>
          Things to do:
        </h1>
        <ul>
            <li><input type="text" value={text}></input></li>
        </ul>
    </div>
  );
}

export default App;
