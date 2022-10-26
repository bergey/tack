use automerge::Automerge;
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
    while let Some(Ok(msg)) = socket.recv().await {
        debug!("got WS message: {:?}", msg);
        match msg {
            ws::Message::Text(_) =>
                if socket.send(msg).await.is_err() {
                    // client disconnected
                    return;
                },
            ws::Message::Binary(_blob) =>
                // TODO AM here
                if socket.send(ws::Message::Text("blob".to_string())).await.is_err() {
                    // client disconnected
                    return;
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
