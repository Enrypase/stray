import { Component, For } from "solid-js";
import { useChat } from "../hooks/useChat";
import { useSession } from "../hooks/useSession";
import { beautifyAddress } from "../common/commonFunctions";

type HeaderType = {
  title: string;
};

const Header: Component<HeaderType> = props => {
  const { address } = useSession();
  const { privateChats, setTab, tab } = useChat();
  return (
    <div class="flex justify-between w-[325px] border-b-2 border-solid border-white p-2">
      <div class="flex gap-2">
        <For each={privateChats}>
          {chat => (
            <button class="h-10 aspect-square rounded-full" onClick={() => setTab(chat.with)}>
              <img src={chat.image} />
            </button>
          )}
        </For>
      </div>
      <div class="flex items-center gap-2">
        <div>
          <p class="text-right">{beautifyAddress(address())}</p>
          <button onClick={() => setTab("")}>
            <p class="text-center">
              {tab() ? `Private: ${beautifyAddress(tab())}` : `Global: ${props.title}`}
            </p>
          </button>
        </div>
        <div class="h-10 aspect-square rounded-full bg-white" />
      </div>
    </div>
  );
};

export default Header;
