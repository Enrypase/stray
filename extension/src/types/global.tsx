import { JSX } from "solid-js/jsx-runtime";

declare global {
  interface Window {
    ethereum?: any;
  }
}

export type WithChildren = {
  children?: JSX.Element;
};
