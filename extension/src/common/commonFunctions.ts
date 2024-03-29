export const beautifyAddress = (address: string): string => {
    if (address.startsWith("0x") && address.length === 42) {
      const finalString = `${address.substring(0, 5)}...${address.substring(40, 43)}`;
      return finalString;
    }
    return address;
  };
  export const beautifyUrl = (url: string) =>
    url
      .replaceAll("http://", "")
      .replaceAll("https://", "")
      .split("/")
      .map(el => el.split(":")[0])
      .map(el => el.split("?")[0])
      .join(" > ");
  