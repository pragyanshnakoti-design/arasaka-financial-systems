import { useEffect, useState } from "react";

const GLYPHS = "ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ01<>/|■#Ξ";

export function useDecrypt(active: boolean, duration = 1500) {
  const [t, setT] = useState(0);

  useEffect(() => {
    if (!active) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setT(1);
      return;
    }
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      setT(p);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, duration]);

  return t;
}

export function scramble(text: string, t: number) {
  if (t >= 1) return text;
  let out = "";
  const len = Math.max(1, text.length - 1);
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]!;
    if (/\s/.test(ch) || ".,—/:-'’".includes(ch)) {
      out += ch;
      continue;
    }
    out += t > i / len ? ch : GLYPHS[(i * 13 + Math.floor(t * 97)) % GLYPHS.length];
  }
  return out;
}

export function DecryptText({
  text,
  t,
  className,
}: {
  text: string;
  t: number;
  className?: string;
}) {
  return <span className={className}>{scramble(text, t)}</span>;
}
