import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App.tsx";
import "./index.css";
import { ChatbotProvider } from "./components/Chatbot/ChatbotProvider.tsx";

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ChatbotProvider>
      <App />
    </ChatbotProvider>
  </StrictMode>,
);
