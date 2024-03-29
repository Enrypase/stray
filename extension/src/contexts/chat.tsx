import { Accessor, Component, Setter, createContext, createSignal } from "solid-js";
import { createStore } from "solid-js/store";
import { WithChildren } from "../types/global";

type PrivateChat = {
  with: string;
  image: string;
};
type ChatContextType = {
  tab: Accessor<string>;
  setTab: Setter<string>;
  privateChats: PrivateChat[];
  setPrivateChats: Setter<PrivateChat[]>;
};

export const ChatContext = createContext<ChatContextType>();
export const ChatProvider: Component<WithChildren> = props => {
  const [tab, setTab] = createSignal("");
  const [privateChats, setPrivateChats] = createStore([]);
  return (
    <ChatContext.Provider value={{ tab, setTab, privateChats, setPrivateChats }}>
      {props.children}
    </ChatContext.Provider>
  );
};
