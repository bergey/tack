import React, { useEffect, useState } from "react";

import { task, TaskId, TaskStore } from "../model";

export default function TaskDetail({ taskStore }: { taskStore: TaskStore }) {
  return (
    <>
      <h1>Task Detail</h1>
      <p>TODO: put something here</p>
    </>
  );
}
