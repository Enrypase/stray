import { Accessor, Component, Setter } from "solid-js";
import { useSession } from "../hooks/useSession";
import { beautifyAddress, beautifyBigText } from "../common/commonFunctions";
import gattoFiero from "../assets/images/gattoFiero.avif";
import { useChat } from "../hooks/useChat";

type MessageType = {
  username: string;
  message: string;
  image: string;
  lastMessage: Accessor<string>;
  setLastMessage: Setter<string>;
  inputRef: Accessor<HTMLInputElement | undefined>;
};

const Message: Component<MessageType> = props => {
  const { address } = useSession();
  const { setTab, setPrivateChats } = useChat();
  return (
    <div
      class="grid grid-cols-2 p-2 rounded-md animate-[fadeIn_0.5s_ease-out_forwards]"
      classList={{
        "bg-blue": props.message.includes(`@${address()}`),
      }}>
      <div class="flex items-start">
        <button
          class="flex gap-2 items-center"
          onClick={() => {
            if (props.username.toLowerCase() === "me") return;
            setTab(props.username);
            const newObj = { with: props.username, image: props.image || gattoFiero };
            setPrivateChats(prev => [
              ...prev.filter(old => JSON.stringify(old) !== JSON.stringify(newObj)),
              newObj,
            ]);
          }}>
          {props.username.toLowerCase() !== "server" && (
            <img
              src={props.image || gattoFiero}
              class="h-8 aspect-[707/789] rounded-xl"
              alt="PFP"
            />
          )}
          <p
            class="font-bold text-left"
            classList={{
              "text-yellow": props.message.includes(`@${address()}`),
            }}>
            {beautifyAddress(props.username)}:
          </p>
        </button>
      </div>
      <button
        onClick={() => {
          if (props.username.toLowerCase() === "me") return;
          props.inputRef()?.focus();
          props.setLastMessage(`@${props.username} ${props.lastMessage()}`);
        }}>
        <p class="break-words text-left">{beautifyBigText(props.message)}</p>
      </button>
    </div>
  );
};
export default Message;
