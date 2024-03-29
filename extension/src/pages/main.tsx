import { Component, Show } from 'solid-js';
import LoginComp from '../components/login';
import LoggedComp from '../components/logged';
import { useSession } from '../hooks/useSession';

const MainPage: Component = () => {
  const { address } = useSession();
  return (
    <Show when={address()} fallback={<LoginComp />}>
      <LoggedComp />
    </Show>
  );
};

export default MainPage;
