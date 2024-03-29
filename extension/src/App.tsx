import type { Component } from "solid-js";
import GlobalLayout from "./layouts/global";
import MainPage from "./pages/main";
import { ChatProvider } from "./contexts/chat";
import { SessionProvider } from "./contexts/session";

const App: Component = () => (
  <SessionProvider>
    <ChatProvider>
      <GlobalLayout>
        <MainPage />
      </GlobalLayout>
    </ChatProvider>
  </SessionProvider>
);

export default App;
