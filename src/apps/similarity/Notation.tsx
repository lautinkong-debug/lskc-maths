import { Math } from "@/components/Math";

/** Geometric point names use mathematical italic; symbols and prose stay upright. */
export function GeometryName({ children }: { children: string }) {
  const match = children.match(/^([△∠]?[A-Z][A-Z0-9]*)(\s+\(candidate\))?$/);
  if (!match) return <>{children}</>;
  const name = match[1];
  const symbol = name.startsWith("△")
    ? "\\triangle "
    : name.startsWith("∠")
      ? "\\angle "
      : "";
  const letters = name.replace(/^[△∠]/, "");
  return (
    <>
      <Math label={name}>{`${symbol}\\mathit{${letters}}`}</Math>
      {match[2]}
    </>
  );
}

export function GeometryText({ children }: { children: string }) {
  return (
    <>
      {children
        .replace(/[∥‖]/g, "//")
        .split(/([△∠][A-Z]{3}|\b[A-Z]{2,6}\b)/g)
        .map((part, i) =>
          /^[△∠]?[A-Z]{2,6}$/.test(part) &&
          !["AAA", "AAS", "ASA", "SAS", "SSS", "RHS"].includes(part) ? (
            <GeometryName key={i}>{part}</GeometryName>
          ) : (
            part
          ),
        )}
    </>
  );
}
