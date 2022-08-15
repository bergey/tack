import { render } from "preact";
import Router from "preact-router";
import { Link } from "preact-router/match";

import reportWebVitals from "./reportWebVitals";
// import * as serviceWorkerRegistration from "./serviceWorkerRegistration";

import "./App.css";
import TaskList from "./routes/TaskList";
import TaskDetail from "./routes/Detail";
import Schedule from "./routes/Schedule";
import Search from "./routes/Search";

render(
  <div className="App">
    <Router>
      <TaskList path="/" />
      <TaskDetail path="detail/:taskId" />
      <Schedule path="/schedule" />
      <Search path="/search" />
      <p default>no route matched</p>
    </Router>
    <div id="nav">
      <Link href="/" class="button">
        Tasks
      </Link>
      <Link href="/schedule" class="button">
        Schedule
      </Link>
      <Link href="/search" class="button">
        Search
      </Link>
    </div>
  </div>,
  document.getElementById("root")
);

// serviceWorkerRegistration.register();

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
