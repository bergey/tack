import { render } from "preact";

import "./index.css";
// import * as serviceWorkerRegistration from "./serviceWorkerRegistration";
import reportWebVitals from "./reportWebVitals";
import Router from "preact-router";

import TaskList from "./routes/TaskList";
import TaskDetail from "./routes/Detail";

render(
  <Router>
    <TaskList path="/" />
    <TaskDetail path="detail/:taskId" />
    <p default>no route matched</p>
  </Router>,
  document.getElementById("root")
);

// serviceWorkerRegistration.register();

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
