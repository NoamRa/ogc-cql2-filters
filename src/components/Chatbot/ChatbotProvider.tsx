import { getClient, WebchatProvider } from "@botpress/webchat";
import { buildTheme } from "@botpress/webchat-generator";
import { PropsWithChildren, useEffect } from "react";
import { MyProvider, useChatbotContext } from "./MyProvider";

const { theme } = buildTheme({
  themeName: "midnight",
  themeColor: "#634433",
});

const clientId = "908d19ab-59f4-4ce7-8223-77852173a4f2";

export const ChatbotProvider = ({ children }: PropsWithChildren) => {
  const client = getClient({ clientId });

  const res = useChatbotContext();
  console.log({ res });

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleMessage = (event: any) => {
      console.log({ event, res });
      res.setLastMessage((event?.payload?.block?.text as unknown as string) || "");
    };

    client.on("message", handleMessage);

    // return () => {
    //   client.off("message", handleMessage); // not supported...
    // };
  }, [client, res]);

  return (
    <MyProvider>
      <WebchatProvider client={client} theme={theme}>
        {children}
      </WebchatProvider>
    </MyProvider>
  );
};
