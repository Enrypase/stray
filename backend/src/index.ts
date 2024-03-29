import { createPublicClient, http, type Address } from "viem";
import { mainnet } from "viem/chains";
import { beautifyAddress } from "./common/commonFunctions";
import { createClient } from "redis";
import { normalize } from "viem/ens";

type Usernames = {
  [key: string]: {
    ready: boolean;
    username: string;
    chat: string;
    image: string;
  };
};
type MessageType = { username: string; message: string; timestamp: number; image: string };

const usernames: Usernames = {
  server: {
    ready: true,
    username: "server",
    chat: "",
    image: "http://localhost:5000/gattoFiero.avif",
  },
};

const client = createPublicClient({
  chain: mainnet,
  transport: http(),
});
const redis = await createClient()
  .on("error", err => console.error("Redis Client Error", err))
  .connect();

const parseUsername = async (address: string) => {
  let name: string = "";
  try {
    name = (await client.getEnsName({ address: address as Address })) as string;
  } catch (e) {
    console.error(e);
  }
  return name || address;
};

const getUserImage = async (address: string) => {
  const ensAvatar = await client.getEnsAvatar({
    name: normalize(address),
  });
  console.log("ENS: ", ensAvatar);
  return ensAvatar;
};

const getUsername = (username: string, short: boolean) => {
  const retUsername = usernames[username]?.username;
  if (usernames[username].ready) {
    return short ? beautifyAddress(retUsername) : retUsername;
  }
};

const server = Bun.serve<{ username: string }>({
  port: 5000,
  async fetch(req, server) {
    const url = new URL(req.url);
    if (url.pathname.includes("/chat")) {
      let chat = url.pathname.split("/")[2];
      chat ? chat : "";
      const username = req.headers.get("sec-websocket-protocol");
      let success = false;
      if (username) {
        usernames[username] = { ready: false, username, chat, image: "" };
        parseUsername(username).then(newUsername => {
          getUserImage(newUsername).then(image => {
            usernames[username] = { ready: true, username: newUsername, chat, image: image || "" };
            server.publish(
              chat,
              JSON.stringify({
                username: "Server",
                message: `${getUsername(newUsername, true)} connected`,
                image: image,
              })
            );
          });
        });
        success = server.upgrade(req, { data: { username: username } });
      }
      return success ? undefined : new Response("WebSocket upgrade error", { status: 400 });
    }
  },
  websocket: {
    open(ws) {
      const chat: string = usernames[ws.data.username].chat;
      ws.subscribe(chat);
      redis.hGet("chats", chat).then(rawData => {
        if (!rawData) return;
        const messages: MessageType[] = JSON.parse(rawData);
        console.log("Open: ", rawData, "Mexs:", messages);
        messages.map(message => {
          ws.send(JSON.stringify(message));
        });
      });
    },
    message(ws, rawMex) {
      const { type, message } = JSON.parse(String(rawMex));
      if (type === "auth") {
      } else if (type === "message") {
        const { username } = ws.data;
        console.log("Username: " + username);
        const chat = usernames[username].chat;
        const finalMessage: MessageType = {
          username: getUsername(username, false)!,
          message,
          timestamp: Date.now(),
          image: usernames[ws.data.username].image,
        };
        server.publish(chat, JSON.stringify(finalMessage));
        redis.hGet("chats", chat).then(rawData => {
          const messages: MessageType[] = rawData ? JSON.parse(rawData) : [];
          messages.push(finalMessage as MessageType);
          redis.hSet("chats", chat, JSON.stringify(messages));
        });
      } else {
      }
    },
    close(ws) {
      const message = `${getUsername(ws.data.username, true)} has left the chat`;
      ws.unsubscribe(usernames[ws.data.username].chat);
      server.publish(
        usernames[ws.data.username].chat,
        JSON.stringify({
          username: "Server",
          message,
        })
      );
    },
  },
});

console.log(`Listening on ${server.hostname}:${server.port}`);
