import { WebSocketServer, WebSocket } from 'npm:ws@8.11';
import * as Automerge from 'npm:automerge@1.0.1-preview.7';

const wss = new WebSocketServer({ port: 3003 });

let project = Automerge.init();

wss.on('connection', function connection(ws: WebSocket) {
  let syncState : Automerge.SyncState = Automerge.initSyncState()

  ws.on('message', function message(data) {
    console.log('received a message from %s');
    let msg = new Uint8Array(data);
    const [newProject, newSyncState, _patch ] =
      Automerge.receiveSyncMessage(project, syncState, msg as Automerge.BinarySyncMessage);
    project = newProject;
    syncState = newSyncState;
    sync(ws, syncState) // send back any changes from other clients
  });

  sync(ws, syncState);
});

function sync(ws: WebSocket, syncState: Automerge.SyncState) {
  const [nextSyncState, msg] = Automerge.generateSyncMessage(project, syncState);
  if (msg) {
    console.log({type: typeof msg, msg: buf2hex(msg)});
    ws.send(msg)
    // TODO confirm send worked
    syncState = nextSyncState;
  } else {
    console.log("no reply");
  }
};

function buf2hex(buffer) { // buffer is an ArrayBuffer
  return [...new Uint8Array(buffer)]
      .map((x, i) => x.toString(16).padStart(2, '0') + (i % 2 == 1 ? ' ' : ''))
      .join('');
}
