import * as Automerge from 'automerge';
import { Operation, Project, apply, emptyProject } from './model';

// these are global, and not exported,
// so can only be managed by the exported interface of this module
let websocket : WebSocket | undefined = undefined
let syncState : Automerge.SyncState = Automerge.initSyncState()
let project : Project = emptyProject()

// the publish function will be called when changes come in, either from local user or server
// when we tie the knot, it will save to disk & render in React
export function initWS(initial: Project, publish: (p: Project) => void): (op: Operation) => void {
  project = initial;
  if (websocket === undefined) {
    websocket = new WebSocket("ws://localhost:3003/ws");
    websocket.onopen = () => {
      syncServer();
    }
    websocket.onclose = () => { websocket = undefined; }

    websocket.onmessage = (event) => {
      event.data.arrayBuffer().then((buf) => {
        let msg = new Uint8Array(buf);
        console.log({type: typeof event.data, data: event.data, buf, msg});
        const [newProject, newSyncState, _patch ] = Automerge.receiveSyncMessage(project, syncState, msg as Automerge.BinarySyncMessage);
        project = newProject;
        syncState = newSyncState;
        publish(project);
        syncServer()
      });
    }
  }
  return ((op: Operation) => applyLocalChange(publish, op));
}

// TODO when we do background sync, we really should save to disk, though not publish to React

function syncServer() {
  const [nextSyncState, msg] = Automerge.generateSyncMessage(project, syncState);
  // TODO try to reconnect WS, even if we don't have a publish command?
  if (msg && websocket) {
    websocket.send(msg)
    // TODO confirm send worked
    syncState = nextSyncState;
  } else if (!msg) {
    console.log("no reply");
  }
}

function applyLocalChange(publish: (p: Project) => void, op: Operation): void {
 const newProject = Automerge.change<Project>(project, (p: Project) => apply(p, op));
  project = newProject;
  publish(project);
  syncServer();
}
