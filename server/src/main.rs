use automerge::{Automerge, sync};
use async_mutex::Mutex;
use axum::{
    extract::ws::{WebSocketUpgrade, WebSocket, self},
    routing::get,
    response::Response,
    Router,
};

#[macro_use]
extern crate log;
#[macro_use]
extern crate lazy_static;

lazy_static! {
    static ref PROJECT: Mutex<Automerge> =
        Mutex::new(Automerge::new());
}

async fn ws_upgrade(ws: WebSocketUpgrade) -> Response {
    ws.on_upgrade(sync_crdt_ws)
}

async fn sync_crdt_ws(mut socket: WebSocket) {
    let mut sync_state = sync::State::new();
    while let Some(Ok(ws_msg)) = socket.recv().await {
        match &ws_msg {
            ws::Message::Text(txt) => {
                debug!("got WS message: {}", txt);
                if socket.send(ws_msg).await.is_err() {
                    // client disconnected
                    return;
                }},
            ws::Message::Binary(blob) => {
                // TODO handle errors
                debug!("got binary WS message");
                let sync_msg = sync::Message::decode(&blob).unwrap();
                let mut project = PROJECT.lock().await;
                project.receive_sync_message(&mut sync_state, sync_msg).unwrap();
            },
            _ => {}
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
