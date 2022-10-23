 import "preact/devtools";
import { render } from "preact";
import Router from "preact-router";
import { Link } from "preact-router/match";

import reportWebVitals from "./reportWebVitals";

import {ProjectProvider} from "./GlobalProject"
import TaskList from "./routes/TaskList";
import TaskDetail from "./routes/Detail";
import Schedule from "./routes/Schedule";
import Search from "./routes/Search";

interface NavLinkProps {
  href: string;
  text: string;
}

function NavLink({ href, text }: NavLinkProps) {
  return (
    <Link href={href} class="button" activeClassName="active">
      {text}
    </Link>
  );
}

function App() {
  return (
    <div className="App">
        <ProjectProvider>
            <div className="page">
                <Router>
                    <TaskList path="/" />
                    <TaskDetail path="/detail/:taskId" />
                    <Schedule path="/schedule" />
                    <Search path="/search" />
                    <p default>no route matched</p>
                </Router>
            </div>
            <div id="nav">
                <NavLink href="/" text="Tasks" />
                <NavLink href="/schedule" text="Schedule" />
                <NavLink href="/search" text="Search" />
            </div>
        </ProjectProvider>
    </div>
  );
}

render(App(), document.getElementById("root"));

async function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    try {
      const registration = await navigator.serviceWorker.register(
        new URL("../public/service-worker.ts", import.meta.url),
        {
          scope: "/",
          type: "module",
        }
      );
      if (process.env.NODE_ENV !== "production") {
        if (registration.installing) {
          console.log("Service worker installing");
        } else if (registration.waiting) {
          console.log("Service worker installed");
        } else if (registration.active) {
          console.log("Service worker active");
        }
      }
    } catch (error) {
      console.error(`Registration failed with ${error}`);
    }
  }
}
registerServiceWorker();

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
