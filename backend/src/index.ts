import { createPublicClient, http, type Address } from "viem";
import { mainnet } from "viem/chains";
import { beautifyAddress } from "./common/commonFunctions";
import { createClient } from "redis";
import { normalize } from "viem/ens";

type WsData = {
  username: string;
  chatWith?: string;
};
type Usernames = {
  [key: string]: {
    ready: boolean;
    username: string;
    chat: string;
    image: string;
  };
};
type MessageType = { username: string; message: string; timestamp: number; image: string };
type PrivateChats = {
  [key: string]: { messages: string[] };
};

const usernames: Usernames = {
  server: {
    ready: true,
    username: "server",
    chat: "",
    image: "http://localhost:5000/gattoFiero.avif",
  },
};
const privateChats: PrivateChats = {};

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
      const username = req.headers.get("sec-websocket-protocol");
      let success = false;
      if (username) {
        const chatWith = url.searchParams.get("chatWith");
        console.log("Chatting with: ", chatWith);
        const updatedUsername = chatWith ? username : `${username}_${Date.now()}`;
        let chat = url.pathname.split("/")[2] || "";
        if (chatWith) {
          const foundChat = Object.keys(privateChats).filter(
            key => key.includes(username) && key.includes(chatWith)
          )[0];
          chat = foundChat || `${username} ${chatWith}`;
          if (!foundChat) {
            privateChats[chat] = { messages: [] };
          }
        }
        console.log("-------- ", chat, "--------");
        usernames[updatedUsername] = { ready: false, username, chat, image: "" };
        parseUsername(username).then(newUsername => {
          getUserImage(newUsername).then(image => {
            console.log("Sending connection mex to chat: ", chat);

            usernames[updatedUsername] = {
              ready: true,
              username: newUsername,
              chat,
              image: image || "",
            };
            server.publish(
              chat,
              JSON.stringify({
                username: "Server",
                message: `${getUsername(updatedUsername, true)} connected`,
                image: image,
              })
            );
          });
        });
        const data: WsData = { username: updatedUsername };
        console.log("Requested to chat with: ", chatWith, data.username);
        if (chatWith) {
          console.log(usernames);
          const withUser = Object.keys(usernames)
            .filter(user => chatWith === usernames[user].username)[0]
            .split("_")[0];
          data.chatWith = withUser;
        }
        success = server.upgrade(req, { data });
      }
      return success ? undefined : new Response("WebSocket upgrade error", { status: 400 });
    }
  },
  websocket: {
    open(ws) {
      const { chatWith } = ws.data;
      console.log("This ws wants to chat with ", chatWith);
      if (chatWith) {
        const chat = Object.keys(privateChats).filter(
          key => key.includes(ws.data.username) && key.includes(chatWith)
        )[0];
        console.log("Private Chats: ");
        console.log(privateChats);
        ws.subscribe(chat);
        privateChats[chat].messages.map(rawData => {
          ws.send(rawData);
        });
        return;
      }
      const chat: string = usernames[ws.data.username].chat;
      ws.subscribe(chat);
      redis.hGet("chats", chat).then(rawData => {
        console.log("Should sync", rawData);
        if (!rawData) return;
        const messages: MessageType[] = JSON.parse(rawData);
        messages.map(message => {
          ws.send(JSON.stringify(message));
        });
      });
    },
    message(ws, rawMex) {
      const { type, message } = JSON.parse(String(rawMex));
      if (type === "auth") {
      } else if (type === "message") {
        const { username, chatWith } = ws.data;
        console.log("This ws wants to send message exclusively to ", chatWith);
        if (chatWith) {
          const chat = Object.keys(privateChats).filter(
            key => key.includes(ws.data.username) && key.includes(chatWith)
          )[0];
          console.log("Found common chat: ", chat);
          const finalMessage: MessageType = {
            username: getUsername(username, false)!,
            message,
            timestamp: Date.now(),
            image: usernames[ws.data.username].image,
          };
          server.publish(chat, JSON.stringify(finalMessage));
          const oldMexs = privateChats[chat].messages;
          oldMexs.push(JSON.stringify(finalMessage));
          privateChats[chat].messages = oldMexs;
          return;
        }
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
      const { chatWith } = ws.data;
      console.log("Blud closed the chat with ", chatWith);
      if (chatWith) {
        const chat = Object.keys(privateChats).filter(
          key => key.includes(ws.data.username) && key.includes(chatWith)
        )[0];
        ws.unsubscribe(chat);
        return;
      }
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
