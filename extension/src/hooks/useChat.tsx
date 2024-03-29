import { useContext } from "solid-js";
import { ChatContext } from "../contexts/chat";

export const useChat = () => useContext(ChatContext)!;
