import {
  Accessor,
  Component,
  For,
  Setter,
  createEffect,
  createSignal,
  on,
  onMount,
} from "solid-js";
import { useSession } from "../hooks/useSession";
import { beautifyUrl } from "../common/commonFunctions";
import Message from "./message";
import ChatLayout from "../layouts/chat";
import Header from "./header";
import SendMessage from "./sendMessage";

type MessageType = { username: string; message: string; image: string };
type LoggedCompType = {
  ws: WebSocket;
  messages: MessageType[];
  sendMessage: (message: string) => void;
  lastMessage: Accessor<string>;
  setLastMessage: Setter<string>;
  numMessages: Accessor<MessageType[]>;
};

const Chat: Component<LoggedCompType> = props => {
  let ref: HTMLDivElement | undefined;
  const { location } = useSession();
  const [inputRef, setInputRef] = createSignal(undefined);
  const [fixed, setFixed] = createSignal(false);

  createEffect(() => {
    console.log("Triggered: ", props.numMessages().length);
    console.log("FIXED: ", fixed());
    if (fixed()) {
      if (!ref) return;

      const top = ref.scrollHeight - ref.clientHeight;
      ref.scrollTop = top;
    }
  });

  return (
    <ChatLayout>
      <Header title={beautifyUrl(location())} />
      <div class="flex flex-col justify-between h-[calc(100%-66px)]">
        <div
          ref={ref}
          class="flex flex-col gap-2 overflow-auto"
          onScroll={e => {
            const el = e.target;
            const isScrolledToBottom = el.scrollTop + el.clientHeight >= el.scrollHeight;
            setFixed(isScrolledToBottom);
          }}>
          <For each={props.messages}>
            {message => (
              <Message
                {...message}
                lastMessage={props.lastMessage}
                setLastMessage={props.setLastMessage}
                inputRef={inputRef}
              />
            )}
          </For>
        </div>
        <SendMessage
          sendMessage={props.sendMessage}
          inputRef={inputRef}
          setInputRef={setInputRef as Setter<HTMLInputElement | undefined>}
          lastMessage={props.lastMessage}
          setLastMessage={props.setLastMessage}
        />
      </div>
    </ChatLayout>
  );
};

export default Chat;
