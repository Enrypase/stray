import { Accessor, Component, Setter } from "solid-js";
import { useSession } from "../hooks/useSession";
import { beautifyAddress, beautifyBigText } from "../common/commonFunctions";
import gattoFiero from "../assets/images/gattoFiero.avif";

type MessageType = {
  username: string;
  message: string;
  image: string;
  lastMessage: Accessor<string>;
  setLastMessage: Setter<string>;
  inputRef: HTMLInputElement;
};

const Message: Component<MessageType> = props => {
  const { address } = useSession();
  return (
    <div
      class="grid grid-cols-2 p-2 rounded-md"
      classList={{
        "bg-blue": props.message.includes(`@${address()}`),
      }}>
      <div class="flex items-start">
        <div class="flex gap-2  items-center">
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
        </div>
      </div>
      <button
        onClick={() => {
          if (props.username.toLowerCase() === "me") return;
          props.inputRef?.focus();
          props.setLastMessage(`@${props.username} ${props.lastMessage()}`);
        }}>
        <p class="break-words text-left">{beautifyBigText(props.message)}</p>
      </button>
    </div>
  );
};
export default Message;
