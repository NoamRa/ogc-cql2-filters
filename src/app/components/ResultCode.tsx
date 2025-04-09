import { CopyButton } from "./CopyButton";

interface ResultCodeProps {
  title: string;
  code: string;
}

export function ResultCode({ title, code }: ResultCodeProps) {
  return (
    <div style={{ flex: 1 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3>{title}</h3>
        <CopyButton text={code}>Copy {title}</CopyButton>
      </div>
      <div style={{ border: "1px var(--text) solid" }}>
        <pre>
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
}
