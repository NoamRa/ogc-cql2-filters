import { PropsWithChildren } from "react";

export function Result({ title, children }: PropsWithChildren<{ title: string }>) {
  return (
    <div style={{ flex: 1 }}>
      <h3>{title}</h3>
      <div style={{ border: "1px var(--text) solid" }}>{children}</div>
    </div>
  );
}
