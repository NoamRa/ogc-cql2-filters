import { PropsWithChildren } from "react";

export function Code({ children }: PropsWithChildren) {
  return (
    <pre>
      <code>{children}</code>
    </pre>
  );
}
