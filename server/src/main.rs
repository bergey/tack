use automerge::{ActorId, Automerge};
use async_mutex::Mutex;
use axum::{
    extract::ws::{WebSocketUpgrade, WebSocket},
    routing::get,
    response::Response,
    Router,
};
use std::collections::HashMap;

#[macro_use]
extern crate log;
#[macro_use]
extern crate lazy_static;

lazy_static! {
    static ref PROJECT: Mutex<Automerge> =
        Mutex::new(Automerge::new());

    static ref SYNC_STATE: Mutex<HashMap<ActorId, Mutex<automerge::sync::State>>> =
        Mutex::new(HashMap::new());
}

struct InboundMessage {
    actor_id: ActorId,
    automerge: automerge::sync::Message,
}

async fn ws_upgrade(ws: WebSocketUpgrade) -> Response {
    ws.on_upgrade(sync_crdt_ws)
}

async fn sync_crdt_ws(mut socket: WebSocket) {
    while let Some(Ok(msg)) = socket.recv().await {
        debug!("got WS message: {:?}", msg);
        if socket.send(msg).await.is_err() {
            // client disconnected
            return;
        }
    }
}

#[tokio::main]
async fn main() {
    env_logger::init();
    // build our application with a single route
    let app = Router::new()
        .route("/", get(|| async { "Hello, World!" }))
        .route("/ws", get(ws_upgrade));

    // run it with hyper on localhost:3003
    axum::Server::bind(&"0.0.0.0:3003".parse().unwrap())
        .serve(app.into_make_service())
        .await
        .unwrap();
}
