import {
  Accessor,
  Component,
  Setter,
  createContext,
  createEffect,
  createSignal,
  onMount,
} from "solid-js";
import { WithChildren } from "../types/global";

type SessionContextType = {
  address: Accessor<string>;
  setAddress: Setter<string>;
  location: Accessor<string>;
};

export const SessionContext = createContext<SessionContextType>();
export const SessionProvider: Component<WithChildren> = props => {
  const [address, setAddress] = createSignal("");
  const [location, setLocation] = createSignal("");

  onMount(() => {
    if (!chrome.runtime) {
      const data = JSON.parse(localStorage.getItem("data"));
      if (!data) return;
      setLocation(window.location.toString());
      setAddress(data);
      return;
    }
    chrome.storage.local
      .get("data")
      .then(({ data }) => {
        console.log("GOT ", data);
        if (!data) return;
        chrome.tabs
          .query({ active: true, currentWindow: true })
          .then(tab => {
            console.log(tab[0].url);
            setLocation(tab[0].url!);
            setAddress(data);
          })
          .catch(err => {
            console.error(err);
          });
      })
      .catch(e => console.error(e));
  });

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
