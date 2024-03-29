import type { Component } from "solid-js";
import GlobalLayout from "./layouts/global";
import { SessionProvider } from "./contexts/session";
import MainPage from "./pages/main";

const App: Component = () => (
  <SessionProvider>
    <GlobalLayout>
      <MainPage />
    </GlobalLayout>
  </SessionProvider>
);

export default App;
