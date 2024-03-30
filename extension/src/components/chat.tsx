import { Accessor, Component, For, Setter, createSignal } from "solid-js";
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
};

const Chat: Component<LoggedCompType> = props => {
  const { location } = useSession();
  const [inputRef, setInputRef] = createSignal(undefined);

  return (
    <ChatLayout>
      <Header title={beautifyUrl(location())} />
      <div class="flex flex-col justify-between h-[calc(100%-42px)]">
        <div class="flex flex-col gap-2 overflow-auto">
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
