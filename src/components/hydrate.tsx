import { useEffect, useState, type ReactNode } from "react";

export function Hydrate({ children }: { children: ReactNode }) {
  const [ok, setOk] = useState(false);
  useEffect(() => setOk(true), []);
  if (!ok) {
    return <div className="min-h-dvh bg-ink" />;
  }
  return <>{children}</>;
}
