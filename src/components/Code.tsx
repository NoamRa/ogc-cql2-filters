import { PropsWithChildren } from "react";

export default function Code({ children }: PropsWithChildren) {
  return (
    <pre>
      <code>{children}</code>
    </pre>
  );
}
