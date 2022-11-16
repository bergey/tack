import { WebSocketServer, WebSocket } from 'npm:ws@8.11';
import * as Automerge from 'npm:automerge@1.0.1-preview.7';

const wss = new WebSocketServer({ port: 3003 });

let project = Automerge.init();

interface ConnectionState {
  syncState: Automerge.SyncState;
  ws: WebSocket;
}

// Set of connected clients to publish changes
let clients = new Set<ConnectionState>()

wss.on('connection', function connection(ws: WebSocket) {
  let self: ConnectionState = {
    syncState: Automerge.initSyncState(),
    ws: ws
  };
  clients.add(self)

  ws.on('message', function message(data) {
    console.log('received a message from %s');
    let msg = new Uint8Array(data);
    const [newProject, newSyncState, _patch ] =
      Automerge.receiveSyncMessage(project, self.syncState, msg as Automerge.BinarySyncMessage);
    project = newProject;
    self.syncState = newSyncState;
    // send change to all clients
    // TODO is this racy?
    for (const c of clients) {
      sync(c.ws, c.syncState);
    }
  });

  ws.onclose = () => clients.delete(self);

  sync(ws, self.syncState);
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
