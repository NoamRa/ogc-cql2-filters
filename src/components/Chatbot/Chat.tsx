import { FormEvent, useState } from "react";
import Markdown from "react-markdown";

const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

const PROMPT_TEXT = `
### Bot Identity
I am a personal AI agent designed to assist users in writing OGC CQL2 filters. I am tailored to support professionals in the geospatial field.

### Scope / Responsibility
My primary role is to facilitate the creation and refinement of OGC CQL2 filters. I interact with users to understand their needs and provide expert guidance on writing and optimizing these filters. I aim to enhance productivity by offering accurate and timely assistance in the geospatial domain.

### Response Style
I strive to provide clear and concise responses. For your convenience, I use buttons to offer choices whenever possible, making navigation through options easier and more efficient.
CQL2 Text and CQL2 JSON responses will always be formatted.
CQL2 Text and CQL2 JSON responses will always be enclosed with three backticks .

### Capabilities
I can:
- Explain CQL2 syntax and its components
- Provide examples and templates for common filters
- Assist with troubleshooting and optimizing filters
- Answer questions related to geospatial data manipulation

I cannot:
- Write filters for non-CQL2 standards
- Perform tasks outside the geospatial data domain

### Policies
- Do not generate content or answers outside the provided knowledge base.
- Avoid providing personal opinions or advice unrelated to CQL2 filters.
- Refrain from making any assumptions without verifying with the user.

### Search
I rely on a comprehensive Knowledge Base to provide accurate information. I will never fabricate information and always consult the Knowledge Base to ensure the accuracy of my responses. If I am unable to find the required answer, I will inform you honestly and suggest alternative approaches or resources.
The CQL2 specification cna be found at https://docs.ogc.org/DRAFTS/21-065r3.html .

By maintaining these practices, I aim to be a reliable and efficient assistant, helping you navigate and master the complexities of OGC CQL2 filters with confidence.
`.trim();

const PROMPT: Message = { sender: "system", text: PROMPT_TEXT };

const regex = /```([\s\S]*?)```/g;
function extractCode(str: string): string {
  const codes = [...str.matchAll(regex)]
    .map((match) => match[1].trim())
    .map((s) => {
      if (s.toUpperCase().startsWith(`CQL2`)) {
        return s.slice("CQL2".length).trim();
      }
      if (s.toUpperCase().startsWith(`CQL`)) {
        return s.slice("CQL".length).trim();
      }
      if (s.toUpperCase().startsWith(`JSON`)) {
        return s.slice("JSON".length).trim();
      }
      return s;
    });
  return codes[0] || "";
}

interface Message {
  text: string;
  sender: "user" | "assistant" | "system";
}

type ChatProps = { setFilter: (filter: string) => void };

export function ChatApp({ setFilter }: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    { sender: "assistant", text: "Hey, I'm a chatbot to help with OGC CQL2 filters. How can I help?" },
  ]);
  const [input, setInput] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  // Handle form submit (sending a message)
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!input.trim()) return;

    // Add the user's message to the chat
    const nextMessages: Message[] = [...messages, { text: input.trim(), sender: "user" }];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    // console.log(nextMessages);

    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
          model: "chatgpt-4o-latest",
          messages: [PROMPT, ...nextMessages].map((message) => ({
            role: message.sender,
            content: message.text,
          })),
          stream: true, // Enable streaming
        }),
      });

      const reader = response.body!.getReader();
      // Stream processing
      const decoder = new TextDecoder();
      let tmp = "";
      while (true) {
        const { value, done } = await reader.read();
        //   console.log({ value, done });
        if (done) break;

        try {
          let sent = "";
          if (tmp) {
            sent = tmp;
            tmp = "";
          }

          sent += decoder
            .decode(value)
            .split("\n")
            .map((v) => v.slice("data: ".length))
            .filter((v) => Boolean(v) && !v.startsWith("[DONE]"))
            .map((v) => {
              try {
                return JSON.parse(v);
              } catch (err: unknown) {
                console.log(v);
                tmp = v;
              }
            })
            .reduce((acc, curr) => (acc += curr.choices[0]?.delta?.content || ""), "");

          setMessages((prevMessages) => {
            if (!sent) return prevMessages;
            const messages = [...prevMessages];
            const lastMessage = messages.pop();

            if (!lastMessage) {
              return [{ text: sent, sender: "assistant" }];
            }
            if (lastMessage.sender === "assistant") {
              return [...messages, { text: lastMessage.text + sent, sender: "assistant" }];
            }
            return [...messages, lastMessage, { text: sent, sender: "assistant" }];
          });
        } catch (_err: unknown) {
          tmp = "zzz";
        }
        //   console.log(sent);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section>
      <h2>Chatobt</h2>
      <div style={{ display: "flex", gap: "8px", flexDirection: "column" }}>
        <div style={{ display: "flex", gap: "8px", flexDirection: "column" }}>
          {messages.map((msg) => (
            <div key={msg.text} className={msg.sender}>
              <strong>{msg.sender === "user" ? "User" : "Bot"}: </strong>
              <Markdown>{msg.text}</Markdown>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} style={{ paddingTop: "8px", display: "flex", gap: "8px", flexDirection: "row" }}>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            disabled={loading}
            placeholder="Type a message"
            rows={2}
          />
          <button type="submit" disabled={loading}>
            {loading ? "Loading..." : "Send"}
          </button>
          <br />
        </form>
        <button
          style={{ marginTop: "8px", width: "250px" }}
          onClick={() => {
            const text = messages.at(-1)?.text ?? "";
            setFilter(extractCode(text));
          }}
        >
          Use filter from last message
        </button>
      </div>
    </section>
  );
}
