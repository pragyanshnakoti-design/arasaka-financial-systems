import { useRef, type HTMLAttributes, type MouseEvent, type ReactNode } from "react";
import { cn } from "@/lib/cn";

function livePointer() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(hover: hover) and (pointer: fine)").matches &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

export function Tilt({
  children,
  className,
  strength = 1,
  ...rest
}: HTMLAttributes<HTMLDivElement> & { children: ReactNode; strength?: number }) {
  const ref = useRef<HTMLDivElement>(null);

  function onMove(e: MouseEvent<HTMLDivElement>) {
    if (!livePointer()) return;
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.setProperty("--rx", `${(-y * 8 * strength).toFixed(2)}deg`);
    el.style.setProperty("--ry", `${(x * 10 * strength).toFixed(2)}deg`);
    el.style.setProperty("--tx", `${(x * 7 * strength).toFixed(1)}px`);
    el.style.setProperty("--ty", `${(y * 6 * strength).toFixed(1)}px`);
  }

  function reset() {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
    el.style.setProperty("--tx", "0px");
    el.style.setProperty("--ty", "0px");
  }

  return (
    <div ref={ref} className={cn("tilt", className)} onMouseMove={onMove} onMouseLeave={reset} {...rest}>
      {children}
    </div>
  );
}

export function GlitchText({
  text,
  as: Tag = "span",
  className,
  idle = false,
}: {
  text: string;
  as?: "span" | "h1" | "h2" | "h3" | "p";
  className?: string;
  idle?: boolean;
}) {
  return (
    <Tag className={cn("glitch-word", idle && "glitch-idle", className)} data-text={text}>
      {text}
    </Tag>
  );
}

export function magnetProps(strength = 12) {
  return {
    onMouseMove: (e: { currentTarget: HTMLElement; clientX: number; clientY: number }) => {
      if (!livePointer()) return;
      const r = e.currentTarget.getBoundingClientRect();
      e.currentTarget.style.setProperty("--mx", `${((e.clientX - r.left) / r.width - 0.5) * strength}px`);
      e.currentTarget.style.setProperty("--my", `${((e.clientY - r.top) / r.height - 0.5) * strength * 0.72}px`);
    },
    onMouseLeave: (e: { currentTarget: HTMLElement }) => {
      e.currentTarget.style.setProperty("--mx", "0px");
      e.currentTarget.style.setProperty("--my", "0px");
    },
  };
}

export function trackPointer(strength = 16) {
  return {
    onMouseMove: (e: { currentTarget: HTMLElement; clientX: number; clientY: number }) => {
      const el = e.currentTarget;
      const r = el.getBoundingClientRect();
      el.style.setProperty("--cx", `${e.clientX - r.left}px`);
      el.style.setProperty("--cy", `${e.clientY - r.top}px`);
      if (!livePointer()) return;
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      el.style.setProperty("--hx", `${(px - 0.5) * strength}px`);
      el.style.setProperty("--hy", `${(py - 0.5) * strength * 0.55}px`);
      el.style.setProperty("--spot-x", `${px * 100}%`);
      el.style.setProperty("--spot-y", `${py * 100}%`);
    },
    onMouseLeave: (e: { currentTarget: HTMLElement }) => {
      e.currentTarget.style.setProperty("--hx", "0px");
      e.currentTarget.style.setProperty("--hy", "0px");
    },
  };
}

