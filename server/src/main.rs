use axum::{
    extract::ws::{WebSocketUpgrade, WebSocket},
    routing::get,
    response::Response,
    Router,
};

#[macro_use]
extern crate log;

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
