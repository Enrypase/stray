import { Component, For, createEffect, createSignal, onCleanup } from "solid-js";
import { createStore } from "solid-js/store";
import { useSession } from "../hooks/useSession";
import { beautifyAddress, beautifyUrl } from "../common/commonFunctions";

type MessageType = { username: string; message: string };

const LoggedComp: Component = () => {
  const { address, location } = useSession();
  let queue: string[] = [];
  const [isReady, setReady] = createSignal(false);

  const [messages, setMessages] = createStore({
    messages: [] as MessageType[],
  });
  const [lastMesage, setLastMessage] = createSignal("");
  const createNewWs = () => {
    const newWs = new WebSocket(`ws://localhost:5000/chat/${beautifyUrl(location())}`, [address()]);

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
    console.log(message, ws.readyState);
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
    <>
      <div class="w-[325px] border-b-2 border-solid border-white p-2">
        <p class="text-center">Chat: {beautifyUrl(location())}</p>
      </div>
      <div class="flex flex-col justify-between h-full">
        <div class="flex flex-col gap-2 overflow-auto p-2">
          <For each={messages.messages}>
            {message => (
              <div class="grid grid-cols-2">
                <div class="flex gap-2 items-center">
                  <img src="h-20 w-20 rounded-xl" alt="PFP" />
                  <p class="font-bold">{beautifyAddress(message.username)}:</p>
                </div>
                <p>{message.message}</p>
              </div>
            )}
          </For>
        </div>
        <form
          class="w-[325px] border-t-2 border-solid border-white p-2"
          onSubmit={e => {
            e.preventDefault();
            const message = JSON.stringify({ type: "message", message: lastMesage() });
            sendMessage(message);
          }}>
          <div class="flex justify-between gap-2 py-1 px-2 border-2 border-solid border-white rounded-full overflow-hidden">
            <input
              class="w-full bg-black border-none px-2 py-0.5 outline-none"
              placeholder="let's get straight into it"
              value={lastMesage()}
              onChange={e => setLastMessage(e.target.value)}
              type="text"
            />
            <input class="outline-none" type="submit" value="🚀" />
          </div>
        </form>
      </div>
    </>
  );
};

export default LoggedComp;
