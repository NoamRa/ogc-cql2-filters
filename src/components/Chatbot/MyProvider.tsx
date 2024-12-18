import { createContext, PropsWithChildren, useContext, useState } from "react";

interface MyContextType {
  lastMessage: string;
  setLastMessage: (message: string) => void;
}

const MyContext = createContext({} as MyContextType);

export const MyProvider = ({ children }: PropsWithChildren) => {
  const [lastMessage, setLastMessage] = useState("");

  const value = { lastMessage, setLastMessage };
  console.log({ value });
  return <MyContext.Provider value={value}>{children}</MyContext.Provider>;
};

export const useChatbotContext = () => useContext(MyContext);
