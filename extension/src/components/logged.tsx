import { Component, createEffect, createSignal } from "solid-js";
import { createStore } from "solid-js/store";
import { useChat } from "../hooks/useChat";
import Chat from "./chat";
import { beautifyAddress, beautifyUrl } from "../common/commonFunctions";
import { useSession } from "../hooks/useSession";

type MessageType = { username: string; message: string; image: string };

const LoggedComp: Component = () => {
  let queue: string[] = [];
  const [isReady, setReady] = createSignal(false);
  const [lastMessage, setLastMessage] = createSignal("");
  const { tab } = useChat();
  const { location, address } = useSession();
  const [messages, setMessages] = createStore([] as MessageType[]);
  const [ws, setWs] = createSignal(createNewWs());

  function createNewWs() {
    console.log("Creating new ws");

    let url = `ws://localhost:5000/chat/${beautifyUrl(location())}`;
    if (tab()) {
      url += `?chatWith=${tab()}`;
    }
    const newWs = new WebSocket(url, [address()]);

    newWs.onopen = () => {
      if (messages.length > 0) {
        setMessages([]);
      }
    };
    newWs.onerror = e => {
      setReady(false);
      console.error("couldn't connect to server");
      console.error(e);
    };
    newWs.onmessage = (event: MessageEvent) => {
      const messageData = JSON.parse(String(event.data)) as MessageType;
      console.log("REC: ", messageData);
      if (
        messageData.username === "Server" &&
        messageData.message === `${beautifyAddress(address())} connected`
      ) {
        setReady(true); // Only when the connection address is received start to send messages
        // TODO: Handle this case better with more decent protocol
        return;
      }
      setMessages(messages.length, {
        username: messageData.username === address() ? "me" : messageData.username,
        message: messageData.message,
        image: messageData.image,
      });
    };

    newWs.onclose = () => {
      setReady(false);
      console.log("disconnected");
      setMessages(messages.length, {
        username: "server",
        message: "You've been disconnected",
      });
    };
    return newWs;
  }

  createEffect(() => {
    console.log(tab());
    if (ws().url !== `ws://localhost:5000/chat/${beautifyUrl(location())}`) {
      setWs(createNewWs());
    }
  });

  const sendMessage = (message: string) => {
    console.log(message, isReady(), ws().readyState);
    if (!message) return;
    if (ws().readyState === 3 || ws().readyState === 2) {
      queue.push(message);
      setWs(createNewWs());
    } else if (!isReady() || ws().readyState === 0) {
      queue.push(message);
    } else {
      ws().send(message);
      setLastMessage("");
    }
  };

  createEffect(() => {
    if (isReady()) {
      for (let i = 0; i < queue.length; i++) {
        ws().send(queue[i]);
      }
      queue = [];
      setLastMessage("");
    }
  });

  return (
    <Chat
      ws={ws()}
      messages={messages}
      sendMessage={sendMessage}
      lastMessage={lastMessage}
      setLastMessage={setLastMessage}
    />
  );
};

export default LoggedComp;
