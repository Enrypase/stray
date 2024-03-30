import { Accessor, Component, createEffect, createSignal, on } from "solid-js";
import { createStore } from "solid-js/store";
import { useChat } from "../hooks/useChat";
import Chat from "./chat";
import { beautifyAddress, beautifyUrl } from "../common/commonFunctions";
import { useSession } from "../hooks/useSession";

type MessageType = {
  username: string;
  message: string;
  image: string;
  numMessages: Accessor<number>;
};

const LoggedComp: Component = () => {
  let queue: string[] = [];
  const [isReady, setReady] = createSignal(false);
  const [lastMessage, setLastMessage] = createSignal("");
  const { tab } = useChat();
  const { location, address } = useSession();
  const [messages, setMessages] = createStore([] as MessageType[]);
  const [numMessages] = createSignal(messages);
  const [ws, setWs] = createSignal(createNewWs(beautifyUrl(tab() || location())));

  createEffect(() => {
    console.log("EFFECT CREATED");
    const val = beautifyUrl(location());
    let url = `ws://localhost:5000/chat/${val}`;
    if (tab()) {
      url += `?chatWith=${tab()}`;
    }
    if (ws().url === url) return;
    if (ws()) {
      console.log("Closing");
      ws().close();
    }
    console.log("Effect finished");
    setWs(createNewWs(val));
  });

  function createNewWs(str: string) {
    console.log("Creating new ws");

    let url = `ws://localhost:5000/chat/${str}`;
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
      if (messageData.username === "Server") {
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

  const sendMessage = (message: string) => {
    console.log(message, isReady(), ws().readyState);
    if (!message) return;
    if (ws().readyState === 3 || ws().readyState === 2) {
      queue.push(message);
      ws().close();
      setWs(createNewWs(tab() || location()));
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
      numMessages={numMessages}
    />
  );
};

export default LoggedComp;
