import type { PropsWithChildren } from "react";

type CopyButtonProps = PropsWithChildren<{ text: string }>;

export function CopyButton({ text, children }: CopyButtonProps) {
  const handleCopyClick = () => {
    navigator.clipboard
      .writeText(text)
      //   .then(() => "Copy successful")
      .catch(() => {
        alert("Copy failed");
      });
  };

  return <button onClick={handleCopyClick}>{children}</button>;
}
