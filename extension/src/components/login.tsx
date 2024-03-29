import { Component } from "solid-js";
import { useSession } from "../hooks/useSession";

const LoginComp: Component = () => {
  const { setAddress } = useSession();

  const getClient = async (): Promise<string> => {
    if (!chrome.tabs) {
      const address = await (window.ethereum as any).request({
        method: "eth_requestAccounts",
      });
      return String(address);
    }
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    const result = await chrome.scripting.executeScript({
      target: { tabId: tab.id as number },
      world: "MAIN",
      func: async () => {
        const [account] = await (window.ethereum as any).request({ method: "eth_requestAccounts" });
        return account;
      },
    });
    return result[0].result;
  };

  const login = async () => {
    // Execute script in the current tab
    const data = await getClient();
    /*
    const client = createWalletClient({
      account: data as Address,
      chain: mainnet,
      transport: http(),
    });
    setViemClient(client);

    */
    setAddress(data);
  };

  return (
    <div class="h-full flex flex-col gap-2 justify-center items-center">
      <h1>Seems like you&apos;re new here</h1>
      <button class="px-2 py-1 bg-black text-white rounded-md" onClick={login}>
        <p>Login</p>
      </button>
    </div>
  );
};

export default LoginComp;
