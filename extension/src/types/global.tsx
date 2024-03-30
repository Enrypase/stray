import { JSX } from "solid-js/jsx-runtime";
import { MetaMaskInpageProvider } from "@metamask/providers/dist/types/MetaMaskInpageProvider";

declare global {
  interface Window {
    ethereum: MetaMaskInpageProvider;
  }
}

export type WithChildren = {
  children?: JSX.Element;
};
