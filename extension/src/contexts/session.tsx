import { Accessor, Component, Setter, createContext, createEffect, createSignal } from "solid-js";
import { WithChildren } from "../types/global";
import { WalletClient } from "viem";

type SessionContextType = {
  address: Accessor<string>;
  setAddress: Setter<string>;
  location: Accessor<string>;
};

export const SessionContext = createContext<SessionContextType>();
export const SessionProvider: Component<WithChildren> = props => {
  const [address, setAddress] = createSignal("");
  const [location, setLocation] = createSignal("");
  createEffect(() => {
    if (!chrome.tabs) {
      setLocation(window.location.toString());
      return;
    }
    chrome.tabs
      .query({ active: true, currentWindow: true })
      .then(tab => {
        console.log(tab[0].url);
        setLocation(tab[0].url!);
      })
      .catch(err => {
        console.error(err);
      });
  });
  return (
    <SessionContext.Provider value={{ address, setAddress, location }}>
      {props.children}
    </SessionContext.Provider>
  );
};
