import { Accessor, Component, Setter, onMount } from "solid-js";

type SendMessageType = {
  sendMessage: (param: string) => void;
  inputRef: Accessor<HTMLInputElement | undefined>;
  setInputRef: Setter<HTMLInputElement | undefined>;
  lastMessage: Accessor<string>;
  setLastMessage: Setter<string>;
};

const SendMessage: Component<SendMessageType> = props => {
  let ref: HTMLInputElement | null;
  onMount(() => {
    console.log("setting ref to ", ref);
    props.setInputRef(ref!);
  });
  return (
    <form
      class="w-[325px] border-t-2 border-solid border-white p-2"
      onSubmit={e => {
        e.preventDefault();
        const message = JSON.stringify({ type: "message", message: props.lastMessage() });
        props.sendMessage(message);
      }}>
      <div class="flex justify-between gap-2 py-1 px-2 border-2 border-solid border-white rounded-full overflow-hidden">
        <input
          ref={ref!}
          class="w-full bg-black border-none px-2 py-0.5 outline-none"
          placeholder="let's get straight into it"
          value={props.lastMessage()}
          onChange={e => props.setLastMessage(e.target.value)}
          type="text"
        />
        <input class="outline-none" type="submit" value="🚀" />
      </div>
    </form>
  );
};

export default SendMessage;
