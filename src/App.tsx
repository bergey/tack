import './App.css';
import TaskList from './TaskList';

import { taskStore } from './model';

export default function App() {
  return (<TaskList taskStore={taskStore} />)
}
