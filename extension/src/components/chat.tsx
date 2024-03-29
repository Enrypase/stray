import { Component, For, createEffect, createSignal, onCleanup } from "solid-js";
import { createStore } from "solid-js/store";
import { useSession } from "../hooks/useSession";
import { beautifyAddress, beautifyUrl } from "../common/commonFunctions";
import Message from "./message";
import ChatLayout from "../layouts/chat";
import Header from "./header";
import SendMessage from "./sendMessage";

type MessageType = { username: string; message: string; image: string };
type LoggedCompType = { url?: string };

const Chat: Component<LoggedCompType> = props => {
  let queue: string[] = [];
  const { address, location } = useSession();
  const [isReady, setReady] = createSignal(false);
  const [inputRef, setInputRef] = createSignal(null);

  const [messages, setMessages] = createStore({
    messages: [] as MessageType[],
  });
  const [lastMessage, setLastMessage] = createSignal("");
  const createNewWs = () => {
    console.log("Requesting new ws");
    let url = `ws://localhost:5000/chat/${beautifyUrl(location())}`;
    if (props.url) {
      url += `?chatWith=${props.url}`;
    }
    console.log("With url ", url);
    const newWs = new WebSocket(url, [address()]);

    newWs.onopen = () => {
      console.log("Connection established");
      if (messages.messages.length > 0) {
        setMessages({
          messages: [],
        });
      }
    };
    newWs.onerror = e => {
      setReady(false);
      console.error("couldn't connect to server");
      console.error(e);
    };
    newWs.onmessage = (event: MessageEvent) => {
      const messageData = JSON.parse(String(event.data)) as MessageType;
      if (
        messageData.username === "Server" &&
        messageData.message === `${beautifyAddress(address())} connected`
      ) {
        setReady(true); // Only when the connection address is received start to send messages
        // TODO: Handle this case better with more decent protocol
        return;
      }
      setMessages("messages", messages.messages.length, {
        username: messageData.username === address() ? "me" : messageData.username,
        message: messageData.message,
        image: messageData.image,
      });
    };

    newWs.onclose = () => {
      setReady(false);
      console.log("disconnected");
      setMessages("messages", messages.messages.length, {
        username: "server",
        message: "You've been disconnected",
      });
    };
    return newWs;
  };

  let ws = createNewWs();

  const sendMessage = (message: string) => {
    if (!message) return;
    if (ws.readyState === 3 || ws.readyState === 2) {
      queue.push(message);
      ws = createNewWs();
    } else if (!isReady() || ws.readyState === 0) {
      queue.push(message);
    } else {
      ws.send(message);
      setLastMessage("");
    }
  };

  createEffect(() => {
    if (isReady()) {
      for (let i = 0; i < queue.length; i++) {
        ws.send(queue[i]);
      }
      queue = [];
      setLastMessage("");
    }
  });

  onCleanup(() => {
    ws.close = () => {};
  });
  return (
    <ChatLayout>
      <Header title={beautifyUrl(location())} />
      <div class="flex flex-col justify-between h-[calc(100%-42px)]">
        <div class="flex flex-col gap-2 overflow-auto">
          <For each={messages.messages}>
            {message => {
              console.log();
              return (
                <Message
                  {...message}
                  lastMessage={lastMessage}
                  setLastMessage={setLastMessage}
                  inputRef={inputRef}
                />
              );
            }}
          </For>
        </div>
        <SendMessage
          sendMessage={sendMessage}
          inputRef={inputRef}
          setInputRef={setInputRef}
          lastMessage={lastMessage}
          setLastMessage={setLastMessage}
        />
      </div>
    </ChatLayout>
  );
};

export default Chat;
