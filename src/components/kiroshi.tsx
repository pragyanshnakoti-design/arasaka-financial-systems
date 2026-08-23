import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

export function KiroshiCursor() {
  const root = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);
  const [on, setOn] = useState(false);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const hover = window.matchMedia("(hover: hover)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || !hover || reduce || window.innerWidth < 768) return;
    setOn(true);
    document.documentElement.classList.add("optics-on");
    return () => document.documentElement.classList.remove("optics-on");
  }, []);

  useEffect(() => {
    if (!on) return;
    const el = root.current;
    const tag = label.current;
    if (!el) return;

    const move = (e: MouseEvent) => {
      el.style.opacity = "1";
      el.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
      if (tag) tag.textContent = `KIROSHI  ${e.clientX.toString().padStart(4, "0")}  ${e.clientY.toString().padStart(4, "0")}`;
    };
    const over = (e: Event) => {
      const t = e.target as HTMLElement | null;
      const hit = !!t?.closest("a,button,input,textarea,select,[role='button']");
      el.dataset.hot = hit ? "1" : "0";
    };
    window.addEventListener("mousemove", move, { passive: true });
    window.addEventListener("mouseover", over, { passive: true });
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseover", over);
    };
  }, [on]);

  if (!on) return null;

  return (
    <div ref={root} className="kiroshi-cursor" aria-hidden>
      <span className="kiroshi-reticle" />
      <span ref={label} className="kiroshi-tag">
        KIROSHI
      </span>
    </div>
  );
}

const BLIPS = [
  { x: 38, y: 28, delay: "0s" },
  { x: 62, y: 44, delay: "0.4s" },
  { x: 48, y: 68, delay: "1.1s" },
  { x: 72, y: 22, delay: "1.8s" },
  { x: 24, y: 56, delay: "2.2s" },
];

export function PerimeterRadar({ className }: { className?: string }) {
  return (
    <div className={cn("radar", className)} aria-hidden>
      <span className="radar-sweep" />
      {BLIPS.map((b) => (
        <span
          key={`${b.x}-${b.y}`}
          className="radar-blip"
          style={{ left: `${b.x}%`, top: `${b.y}%`, animationDelay: b.delay }}
        />
      ))}
      <span className="radar-core" />
    </div>
  );
}

export function BlackIceSlam({
  open,
  name,
}: {
  open: boolean;
  name: string;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-blood text-fg" role="alert">
      <div className="stamp text-center">
        <p className="font-mono text-[10px] tracking-[0.48em]">BLACK ICE // DEPLOYED</p>
        <p className="mt-4 font-display text-6xl font-semibold tracking-[0.08em] md:text-8xl">FROZEN</p>
        <p className="mt-4 font-mono text-xs tracking-[0.28em]">{name}</p>
      </div>
    </div>
  );
}
