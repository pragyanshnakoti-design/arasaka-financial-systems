import { useEffect, useRef, useState, type MouseEvent } from "react";
import { Armchair, Landmark, Radio, ScanLine, Server, type LucideIcon } from "lucide-react";
import { FLOORS } from "@/lib/data";
import { cn } from "@/lib/cn";
import { Label } from "./chrome";
import { Seal } from "./seal";
import { useSession } from "@/lib/session";
import { GlitchText } from "./motion";

const ICONS: Record<(typeof FLOORS)[number]["id"], LucideIcon> = {
  reception: ScanLine,
  netwatch: Radio,
  lounge: Armchair,
  server: Server,
  vault: Landmark,
};

const START = 0;

const ROUTES = [
  ["01 // IDENTITY HASH", "identity"],
  ["02 // ASSET CUSTODY", "custody"],
  ["03 // NETWATCH TRACE", "trace"],
  ["04 // VAULT PERMISSION", "vault"],
] as const;

function finePointer() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(hover: hover) and (pointer: fine)").matches &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

export function FloorTour() {
  const node = useSession((s) => s.node);
  const root = useRef<HTMLElement>(null);
  const cam = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(START);
  const [held, setHeld] = useState(false);
  const [clock, setClock] = useState("00:00:00");
  const [phase, setPhase] = useState<"idle" | "approach" | "arrive">("idle");
  const [front, setFront] = useState(0);
  const frontRef = useRef(0);
  const [plates, setPlates] = useState<[string, string]>([FLOORS[START].image, FLOORS[START].image]);
  const [inView, setInView] = useState(false);
  const [hovering, setHovering] = useState<number | null>(null);
  const [brief, setBrief] = useState(false);
  const timers = useRef<number[]>([]);
  const hoverWait = useRef<number>(0);
  const floor = FLOORS[active];

  function clearTimers() {
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];
  }

  useEffect(() => () => {
    clearTimers();
    window.clearTimeout(hoverWait.current);
  }, []);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(!!e?.isIntersecting), { threshold: 0.28 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const tick = () => setClock(new Date().toLocaleTimeString("en-GB", { hour12: false }));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (held || phase !== "idle" || brief) return;
    const t = window.setInterval(() => pick((active + 1) % FLOORS.length, false), 9000);
    return () => window.clearInterval(t);
  }, [held, phase, active, brief]);

  function swapPlate(src: string) {
    const next = 1 - frontRef.current;
    const apply = () => {
      setPlates((prev) => {
        const copy: [string, string] = [prev[0], prev[1]];
        copy[next] = src;
        return copy;
      });
      frontRef.current = next;
      setFront(next);
    };
    const im = new Image();
    im.src = src;
    if (im.complete) apply();
    else im.onload = apply;
  }

  function pick(i: number, stop = true) {
    if (stop) setHeld(true);
    if (i === active && phase === "idle") return;
    const next = FLOORS[i];
    if (!next) return;
    setBrief(false);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setActive(i);
      swapPlate(next.image);
      setPhase("idle");
      return;
    }
    clearTimers();
    setActive(i);
    setPhase("approach");
    swapPlate(next.image);
    timers.current.push(
      window.setTimeout(() => {
        setPhase("arrive");
      }, 240),
    );
    timers.current.push(
      window.setTimeout(() => {
        setPhase("idle");
      }, 720),
    );
  }

  function openBrief() {
    setHeld(true);
    setBrief((v) => !v);
  }

  function onCamMove(e: MouseEvent<HTMLDivElement>) {
    const el = cam.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--cx", `${e.clientX - r.left}px`);
    el.style.setProperty("--cy", `${e.clientY - r.top}px`);
    if (phase !== "idle") return;
    el.style.setProperty("--mx", `${((e.clientX - r.left) / r.width - 0.5) * 8}px`);
    el.style.setProperty("--my", `${((e.clientY - r.top) / r.height - 0.5) * 5}px`);
  }

  function onStageMove(e: MouseEvent<HTMLElement>) {
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 100;
    const y = ((e.clientY - r.top) / r.height) * 100;
    el.style.setProperty("--sx", `${x}%`);
    el.style.setProperty("--sy", `${y}%`);
    el.style.setProperty("--px", `${((e.clientX - r.left) / r.width - 0.5) * 24}px`);
    el.style.setProperty("--py", `${((e.clientY - r.top) / r.height - 0.5) * 16}px`);
  }

  function onRowEnter(i: number) {
    setHovering(i);
    if (!finePointer()) return;
    window.clearTimeout(hoverWait.current);
    hoverWait.current = window.setTimeout(() => pick(i), 55);
  }

  function onRowLeave() {
    setHovering(null);
    window.clearTimeout(hoverWait.current);
  }

  useEffect(() => {
    function keys(e: KeyboardEvent) {
      if (!inView) return;
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key === "Escape") {
        setBrief(false);
        return;
      }
      if (e.key === "ArrowDown" || e.key === "ArrowRight") {
        e.preventDefault();
        pick((active + 1) % FLOORS.length);
      }
      if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
        e.preventDefault();
        pick((active - 1 + FLOORS.length) % FLOORS.length);
      }
      if (e.key === "Enter" && phase === "idle") openBrief();
    }
    window.addEventListener("keydown", keys);
    return () => window.removeEventListener("keydown", keys);
  }, [active, phase, inView]);

  const status = floor.id === "netwatch" ? "ACTIVE" : floor.id === "vault" ? "SEALED" : floor.id === "lounge" ? "OPEN" : "SYNCED";
  const hot = floor.tone;
  const briefData = floor.briefing;

  return (
    <section
      id="floors"
      ref={root}
      data-phase={phase}
      data-tone={floor.tone}
      className="tower"
      onMouseMove={onStageMove}
      onMouseEnter={() => setHeld(true)}
      onMouseLeave={() => {
        setHeld(false);
        setHovering(null);
      }}
    >
      <div className="tower-plates" aria-hidden>
        <img src={plates[0]} alt="" className={cn("tower-plate", front === 0 && "is-front")} />
        <img src={plates[1]} alt="" className={cn("tower-plate", front === 1 && "is-front")} />
      </div>
      <div className="tower-wash" />
      <div className="tower-spot" />
      <div className="tower-interfere" aria-hidden />

      <div className="tower-hud">
        <header className="flex flex-wrap items-start justify-between gap-6">
          <div className="max-w-2xl">
            <p className="font-mono text-[10px] tracking-[0.32em] text-blood">
              <span className="mr-2 inline-block size-1.5 bg-blood" style={{ animation: "pulse-dot 1.2s ease-in-out infinite" }} />
              TOWER ACCESS // CLEARANCE ROUTER
            </p>
            <h2 className="mt-3 font-display text-5xl font-semibold leading-[0.88] tracking-tight md:text-7xl">
              ENTER THE <GlitchText className="text-ice" text="ARASAKA" idle />
              <br />
              TOWER.
            </h2>
            <p className="mt-4 max-w-lg font-display text-base text-fg/80 md:text-lg">
              One gateway routes every client, asset, command node, and restricted floor through the same secured spine.
            </p>
          </div>
          <div className="hud-glass hud-tick assemble flex items-center gap-4 px-4 py-3">
            <Seal className="size-9 shrink-0" />
            <div>
              <p className="font-display text-sm font-semibold tracking-[0.32em]">ARASAKA</p>
              <p className="font-mono text-[9px] tracking-[0.22em] text-mute">NM / FINANCIAL SYSTEMS</p>
            </div>
            <div className="h-10 w-px bg-line" />
            <dl className="font-mono text-[9px] tracking-[0.2em] text-mute">
              <div className="flex gap-3">
                <dt>NODE</dt>
                <dd className="text-fg">{node ? node.id : "UNREGISTERED"}</dd>
              </div>
              <div className="flex gap-3">
                <dt>NETWATCH</dt>
                <dd className="text-ice">ACTIVE</dd>
              </div>
              <div className="flex gap-3">
                <dt>SECTOR</dt>
                <dd className="text-fg">7-A</dd>
              </div>
            </dl>
          </div>
        </header>

        <div className="tower-grid">
          <div className="floor-panel hud-glass hud-tick">
            <div className="flex items-center justify-between px-3 pb-1 pt-3">
              <Label>FLOOR SELECT</Label>
              <span className="font-mono text-[9px] tracking-[0.22em] text-ice">
                <span className="mr-1.5 inline-block size-1 bg-ice" style={{ animation: "pulse-dot 1.4s ease-in-out infinite" }} />
                {held ? "HELD" : "AUTO"}
              </span>
            </div>
            <div className="floor-list">
              {FLOORS.map((f, i) => {
                const Icon = ICONS[f.id];
                const on = i === active;
                const hotRow = hovering === i && !on;
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => pick(i)}
                    onMouseEnter={() => onRowEnter(i)}
                    onMouseLeave={onRowLeave}
                    data-tone={f.tone}
                    className={cn("floor-row", on && "is-on", hotRow && "is-hot")}
                  >
                    <Icon
                      className={cn(
                        "size-4 shrink-0 transition-colors duration-150",
                        on ? "floor-accent" : hotRow ? "text-blood" : "text-mute",
                      )}
                      strokeWidth={1.6}
                    />
                    <span className="min-w-0">
                      <span className="block font-display text-[13px] tracking-[0.14em] text-fg">{f.name}</span>
                      <span className={cn("block font-mono text-[9px] tracking-[0.18em]", on ? "floor-accent" : "text-mute")}>
                        {f.tag}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div
            ref={cam}
            role="button"
            tabIndex={0}
            data-phase={phase}
            onClick={openBrief}
            onMouseMove={onCamMove}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                openBrief();
              }
            }}
            className="cam-stage tower-cam"
            data-floor={floor.id}
            aria-label={`Read brief for ${floor.human}`}
          >
            <img src={plates[0]} alt="" className={cn("cam-feed", front === 0 && "is-front")} />
            <img src={plates[1]} alt="" className={cn("cam-feed", front === 1 && "is-front")} />
            <div className="cam-tint" />
            <div className="cam-fog" />
            <div className="cam-corners" aria-hidden />
            <div className="pointer-events-none absolute left-3 top-3 z-10 flex items-center gap-2 font-mono text-[10px] tracking-[0.22em] text-fg">
              <span className="size-1.5 bg-blood" style={{ animation: "rec-blink 1.1s steps(1) infinite" }} />
              {floor.cam}
            </div>
            <div className="pointer-events-none absolute right-3 top-3 z-10 font-mono text-[10px] tracking-[0.22em] floor-accent">
              {status}
            </div>
            {brief ? (
              <article
                className="floor-brief"
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => e.stopPropagation()}
              >
                <div className="flex items-start justify-between gap-4">
                  <Label>
                    <span className="floor-accent">▸ {briefData.kicker}</span>
                  </Label>
                  <button
                    type="button"
                    className="hot-link min-h-11 px-2 font-mono text-[10px] tracking-[0.2em] text-mute"
                    onClick={(e) => {
                      e.stopPropagation();
                      setBrief(false);
                    }}
                  >
                    CLOSE [X]
                  </button>
                </div>
                <h3 className="mt-3 font-display text-2xl font-semibold leading-tight md:text-3xl">{briefData.title}</h3>
                <p className="mt-3 max-w-xl text-sm leading-relaxed text-fg/80">{briefData.body}</p>
                <div className="mt-6 grid gap-3 border-t border-line pt-4 sm:grid-cols-3">
                  {briefData.facts.map(([k, v]) => (
                    <div key={k}>
                      <Label>{k}</Label>
                      <p className="mt-1 font-display text-lg floor-accent">{v}</p>
                    </div>
                  ))}
                </div>
              </article>
            ) : (
              <div className="cam-legend assemble" key={floor.id}>
                <p className="font-mono text-[10px] tracking-[0.28em] text-mute">{floor.tag} // FLOOR ACCESS</p>
                <h3 className="mt-1 font-display text-4xl font-semibold tracking-wide md:text-5xl">
                  <GlitchText text={floor.name} />
                </h3>
                <p className="mt-2 max-w-lg text-sm text-fg/80">{floor.copy}</p>
                <p className="mt-3 font-mono text-[10px] tracking-[0.24em] floor-accent">CLICK IN · READ BRIEF →</p>
              </div>
            )}
          </div>

          <div className="tower-telem">
            <div className="hud-glass hud-tick assemble p-4" key={`bio-${floor.id}`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <Label>BIOMETRIC LOCK</Label>
                  <p className="floor-accent mt-1 font-display text-3xl font-semibold tracking-[0.16em]">
                    {floor.id === "vault" ? "SEALED" : "VERIFIED"}
                  </p>
                </div>
                <span className={cn("reticle", hot === "blood" && "is-armed")} aria-hidden>
                  <span className="reticle-core" />
                </span>
              </div>
              <div className="mt-3 flex h-14 items-end gap-1">
                {Array.from({ length: 18 }).map((_, i) => (
                  <span
                    key={i}
                    className="bar-accent w-full origin-bottom"
                    style={{
                      height: `${22 + ((i * 37 + active * 19) % 78)}%`,
                      animation: `bar-live ${0.62 + (i % 5) * 0.15}s ease-in-out ${i * 32}ms infinite`,
                    }}
                  />
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-1.5" key={`st-${floor.id}`}>
              {floor.stats.map((s, i) => (
                <span key={s.k} className="hud-glass assemble px-2 py-2.5 text-center" style={{ animationDelay: `${i * 70}ms` }}>
                  <span className="floor-accent block font-display text-lg font-semibold">{s.v}</span>
                  <span className="font-mono text-[9px] tracking-[0.14em] text-mute">{s.k}</span>
                </span>
              ))}
            </div>

            <div className="hud-glass hud-tick assemble flex flex-1 flex-col p-4" key={`rt-${floor.id}`}>
              <Label>ROUTE STATE</Label>
              <ul className="mt-3 space-y-2.5 font-mono text-[10px] tracking-[0.16em] text-mute">
                {ROUTES.map(([k], i) => (
                  <li key={k} className="route-line flex justify-between" style={{ animationDelay: `${80 + i * 70}ms` }}>
                    {k}
                    <span className="floor-accent">OK</span>
                  </li>
                ))}
              </ul>
              <p className="mt-auto pt-4 font-mono text-[10px] tracking-[0.16em] text-mute">
                NC 2077 · {clock}
                <br />
                NODE {node ? node.id : "GUEST"} · {String(active + 1).padStart(2, "0")}/{String(FLOORS.length).padStart(2, "0")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
