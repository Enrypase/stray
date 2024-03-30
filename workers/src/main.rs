pub mod pb {
    tonic::include_proto!("grpc.sync.pull");
    tonic::include_proto!("grpc.sync.push");
}

use once_cell::sync::Lazy;
use redis::Commands;
use std::{collections::HashMap, env, time::SystemTime};

use pb::{PullRequest, PushRequest, PullResponse, PushResponse};

type Checkpoint = tokio::sync::Mutex<HashMap<&'static str, u64>>;
type SyncResult<T> = Result<tonic::Response<T>, tonic::Status>;

#[derive(Debug)]
pub struct SyncService {
    client: redis::Client
}

#[tonic::async_trait]
impl pb::pull_service_server for SyncService {
    async fn pull(&self, request: tonic::Request<PullRequest>) -> SyncResult<PullResponse> {
        let message: PullRequest = request.into_inner();
        let total = &self.fetch(message).await;

        Ok(tonic::Response::new(PullResponse { 0 }))
    }
}

#[tonic::async_trait]
impl pb::push_service_server for SyncService {
    async fn push(&self, request: tonic::Request<PushRequest>) -> SyncResult<PushResponse> {

    }
}

struct MessageDetails;

impl SyncServer {
    async fn connect(&mut self) {
    }
    // connect to redis -> read
    // message_id -> timestamp
    //            -> user_id
    //            -> chat_id
    //
    // chat_id -> message_id -> user_id
    //                       -> timestamp
    //         -> timestamp -> message_id -> user_id

    async fn retrieve(&self, req: PushRequest) -> Vec<MessageDetails> {
        let client = redis::Client::open("redis://127.0.0.1").unwrap();
        let mut connection = client.get_connection().unwrap();

        // STEP 0: 
        let timestamps = connection.get(req.chat).unwrap();
    }
    // connect to redis -> append
    async fn sink(&self) {

    }
    // serialize -> flush
    async fn pin(&self, chat: String) {
        reqwest::Client::new().post("").bearer_auth("token").body(()).send().await.unwrap();
    }
    // fetch -> deserialize
    async fn fetch(&self, req: PullRequest) {

    }
}

// to load only fresh entries while retrieving
static OFFLOAD_CHECKPOINTS: Lazy<Checkpoint> = Lazy::new(|| {});

async fn pull() {
    // reqwest next chunk from IPFS since TIMESTAMP for REQUESTED_CHAT_ID
    // egres to Redis
}

async fn push() {
    // load data since OFFLOAD_CHECKPOINT for PENDING_CHAT_ID
    // form JSON
    // reqwest to pin on IPFS
    // push new hash
}

#[tokio::main]
async fn main() {

}