import { Component, Show } from "solid-js";
import { useChat } from "../hooks/useChat";
import Chat from "./chat";

const LoggedComp: Component = () => {
  const { tab } = useChat();
  return (
    <Show when={tab()} fallback={<Chat />}>
      <Chat url={tab()} />
    </Show>
  );
};

export default LoggedComp;
