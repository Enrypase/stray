import { Component } from "solid-js";
import { WithChildren } from "../types/global";

const GlobalLayout: Component<WithChildren> = props => (
  <div class="flex flex-col items-center justify-between border-2 border-solid border-black w-[325px] h-[600px] bg-black text-white">
    {props.children}
  </div>
);

export default GlobalLayout;
