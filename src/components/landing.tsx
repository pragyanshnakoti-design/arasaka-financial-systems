import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { OPERATIVES, SEED_THREATS, SHARDS, LIVE_EVENTS } from "@/lib/data";
import { cn } from "@/lib/cn";
import { BrandLogo } from "./seal";
import { Label } from "./chrome";
import { Roll } from "./roll";
import { useSession } from "@/lib/session";
import { DecryptText, useDecrypt } from "./decrypt";
import { Tilt, GlitchText, magnetProps, trackPointer } from "./motion";

export function Hero() {
  const node = useSession((s) => s.node);
  const [slam, setSlam] = useState(false);
  const mag = magnetProps(14);

  useEffect(() => {
    const b = window.setTimeout(() => setSlam(true), 720);
    const c = window.setTimeout(() => setSlam(false), 1080);
    return () => {
      window.clearTimeout(b);
      window.clearTimeout(c);
    };
  }, []);

  return (
    <section className="letterbox relative min-h-[100dvh] overflow-hidden pb-14" {...trackPointer(18)}>
      <div className="lens absolute inset-0">
        <img src="/media/hero.png" alt="Arasaka Tower lobby" className="hero-plate h-full w-full object-cover" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-ink/40 via-ink/45 to-ink" />
      <div className="spot" />
      <div className="vignette" />

      <div className="relative z-10 flex min-h-[100dvh] flex-col px-4 pb-24 pt-2 md:px-10">
        <div className="mt-2 flex items-start justify-between font-mono text-[10px] tracking-[0.28em] text-mute">
          <span>ACCOUNT / {node ? node.id : "GUEST"}</span>
          <span className="hidden text-center sm:block">
            ARASAKA
            <br />
            NM / FINANCIAL SYSTEMS
          </span>
          <span className="text-right">
            NETWATCH // ACTIVE
            <br />
            SECTOR 7-A
          </span>
        </div>

        <div className="hero-hud mt-6 hidden items-start justify-between gap-4 lg:flex">
          <Tilt className="hud-card w-56 p-4 assemble">
            <Label>SESSION</Label>
            <p className="mt-2 font-display text-xl font-semibold tracking-[0.16em]">
              {node ? "REGISTERED" : "UNREGISTERED"}
            </p>
            <dl className="mt-3 space-y-1 font-mono text-[10px] tracking-[0.18em] text-mute">
              <div className="flex justify-between">
                <dt>CLEARANCE</dt>
                <dd className="text-ice">{node ? node.clearance : "PENDING"}</dd>
              </div>
              <div className="flex justify-between">
                <dt>BIOMETRIC</dt>
                <dd className="text-ice" style={!node ? { animation: "rec-blink 1.6s steps(1) infinite" } : undefined}>
                  {node ? "VERIFIED" : "SCANNING"}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt>VAULT</dt>
                <dd className="text-blood">{node?.status === "FROZEN" ? "FROZEN" : "SEALED"}</dd>
              </div>
            </dl>
          </Tilt>
          <Tilt className="hud-card w-56 p-4 assemble" strength={0.85} style={{ animationDelay: "80ms" }}>
            <Label>BLACK ICE</Label>
            <p className="mt-2 font-display text-xl font-semibold tracking-[0.16em] text-blood">ARMED</p>
            <dl className="mt-3 space-y-1 font-mono text-[10px] tracking-[0.18em] text-mute">
              <div className="flex justify-between">
                <dt>NETWATCH</dt>
                <dd className="text-ice">ACTIVE</dd>
              </div>
              <div className="flex justify-between">
                <dt>TRACE</dt>
                <dd className="text-ice">0.02s</dd>
              </div>
              <div className="flex justify-between">
                <dt>BREACHES</dt>
                <dd className="text-fg">0</dd>
              </div>
            </dl>
          </Tilt>
        </div>

        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <p className="mb-6 font-mono text-[10px] tracking-[0.42em] text-ice rise">ARASAKA // PRIVATE BANKING DIVISION</p>
          <h1 className={cn("cursor-default px-3 py-2", slam && "red-slam")}>
            <span className="sr-only">Arasaka. Secure your money.</span>
            <BrandLogo className="mx-auto rise" />
          </h1>
          <p className="mt-6 max-w-xl font-display text-lg leading-snug text-fg/85 md:text-xl">
            Night City’s private financial fortress. Zero-trust custody. Black ICE countermeasures. Executive vault control
            beneath the tower.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/login"
              className="magnet bracket-btn neon-blood min-h-12 bg-blood px-8 py-3 font-display text-sm font-semibold tracking-[0.28em] text-fg"
              {...mag}
            >
              SIGN IN
            </Link>
            <Link
              to="/intake"
              className="magnet neon-ice min-h-12 border border-ice/50 px-8 py-3 font-display text-sm font-semibold tracking-[0.28em] text-ice"
              {...magnetProps(12)}
            >
              CREATE ACCOUNT
            </Link>
            <a
              href="#floors"
              className="magnet neon-ice min-h-12 border border-line px-8 py-3 font-display text-sm font-semibold tracking-[0.28em] text-fg/80"
              {...magnetProps(12)}
            >
              EXPLORE THE TOWER
            </a>
          </div>
          <div className="mt-10 flex flex-wrap justify-center gap-2 font-mono text-[10px] tracking-[0.22em] text-mute">
            {["VAULT 4096-BIT", "NETWATCH ACTIVE", "SESSION SEALED"].map((c, i) => (
              <span key={c} className="chip-hot assemble border border-line px-4 py-2" style={{ animationDelay: `${i * 80}ms` }}>
                {c}
              </span>
            ))}
          </div>
          <p className="mt-12 font-mono text-[10px] tracking-[0.4em] text-mute">SCROLL TO DECRYPT</p>
        </div>
      </div>
      <NewsTicker />
    </section>
  );
}

function NewsTicker() {
  const line = LIVE_EVENTS.map((e) => `${e.level} · ${e.code} · ${e.detail}`).join("     ");
  return (
    <div className="ticker relative z-10">
      <div className="ticker-track">
        <span>{line}</span>
        <span>{line}</span>
      </div>
    </div>
  );
}

export { FloorTour } from "./tower";

export function Shards() {
  const [active, setActive] = useState(0);
  const [progress, setProgress] = useState(0);
  const activeRef = useRef(0);
  const onActive = useCallback((i: number) => {
    activeRef.current = i;
    setActive(i);
  }, []);
  const onProgress = useCallback((i: number, t: number) => {
    if (activeRef.current === i) setProgress(Math.round(t * 100));
  }, []);
  const shard = SHARDS[active] ?? SHARDS[0];

  return (
    <section id="doctrine" className="bg-ink px-4 py-20 md:px-10">
      <div className="grid gap-10 lg:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="lg:sticky lg:top-8 lg:self-start">
          <Label>FILE ARK/077-EX</Label>
          <p className="mt-3 font-mono text-[10px] tracking-[0.22em] text-mute">CLASSIFIED // TIER-3</p>
          <p className="mt-6 font-display text-5xl font-semibold tabular text-fg">{progress}%</p>
          <p className="mt-1 font-mono text-[10px] tracking-[0.28em] text-ice">PROGRESS</p>
          <div className="mt-3 h-1 w-full bg-raised">
            <div className="h-full bg-blood" style={{ width: `${progress}%` }} />
          </div>
          <p className="mt-6 font-mono text-[10px] tracking-[0.2em] text-mute">
            PANEL {String(active + 1).padStart(2, "0")} / {String(SHARDS.length).padStart(2, "0")}
          </p>
          <p className="mt-2 font-mono text-[10px] tracking-[0.16em] text-blood">{shard.kicker}</p>
        </aside>
        <div className="space-y-10">
          {SHARDS.map((s, i) => (
            <ShardCard key={s.id} shard={s} index={i} onActive={onActive} onProgress={onProgress} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ShardCard({
  shard,
  index,
  onActive,
  onProgress,
}: {
  shard: (typeof SHARDS)[number];
  index: number;
  onActive: (i: number) => void;
  onProgress: (i: number, t: number) => void;
}) {
  const ref = useRef<HTMLElement>(null);
  const [go, setGo] = useState(false);
  const t = useDecrypt(go, 1600);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const vis = new IntersectionObserver(
      ([e]) => {
        if (e?.isIntersecting) setGo(true);
      },
      { threshold: 0.2 },
    );
    const spy = new IntersectionObserver(
      ([e]) => {
        if (e?.isIntersecting) onActive(index);
      },
      { threshold: 0, rootMargin: "-28% 0px -42% 0px" },
    );
    vis.observe(el);
    spy.observe(el);
    return () => {
      vis.disconnect();
      spy.disconnect();
    };
  }, [index, onActive]);

  useEffect(() => {
    onProgress(index, t);
  }, [index, t, onProgress]);

  return (
    <article
      ref={ref}
      className={cn("classified panel stamp mx-auto max-w-3xl p-6 md:p-10", go && t < 1 && "decrypting", t >= 1 && "rgb-hit")}
    >
      <Label>
        <span className="text-blood">▸ {shard.kicker}</span>
      </Label>
      <h2 className="glitch-word mt-4 font-display text-3xl font-semibold leading-tight md:text-5xl" data-text={shard.title}>
        <DecryptText text={shard.title} t={t} />
      </h2>
      <p className="mt-4 max-w-xl text-sm text-mute">
        <DecryptText text={shard.body} t={Math.max(0, (t - 0.2) / 0.8)} />
      </p>
      <div className="mt-8 grid gap-4 border-t border-line pt-6 sm:grid-cols-3">
        {shard.cols.map(([k, v]) => (
          <div key={k}>
            <Label>{k}</Label>
            <p className="mt-1 font-display text-lg">
              <DecryptText text={v} t={Math.max(0, (t - 0.45) / 0.55)} />
            </p>
          </div>
        ))}
      </div>
      <p className="mt-6 font-mono text-[10px] tracking-[0.2em] text-blood">
        FILE // ARK/077-EX · CLEARANCE // TIER-3 · {t >= 1 ? "DECRYPTED IN PERPETUITY" : "ENCRYPTED"}
      </p>
    </article>
  );
}

export function Metrics() {
  return (
    <section className="border-y border-line bg-panel px-4 py-14 md:px-10">
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { k: "ASSETS UNDER PROTECTION", v: 94200000000, prefix: "₡", digits: 0 },
          { k: "PRIVATE HOLDERS", v: 1280000, prefix: "", digits: 0 },
          { k: "RACKS ONLINE", v: 72, prefix: "", digits: 0 },
          { k: "CONFIRMED BREACHES", v: 0, prefix: "", digits: 0 },
        ].map((m) => (
          <div key={m.k} className="metric-cell">
            <Label>{m.k}</Label>
            <p className="metric-value mt-2 font-display text-4xl font-semibold tabular md:text-5xl">
              <Roll value={m.v} prefix={m.prefix} digits={m.digits} />
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function Operatives() {
  const [open, setOpen] = useState<string | null>(null);
  const op = OPERATIVES.find((o) => o.id === open);
  return (
    <section className="border-t border-line px-4 py-20 md:px-10">
      <p className="max-w-xl text-sm text-mute">Two operatives on file. Trauma Team dispatch remains classified.</p>
      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {OPERATIVES.map((o) => (
          <Tilt key={o.id} strength={0.7}>
            <button type="button" onClick={() => setOpen(o.id)} className="op-card group relative w-full overflow-hidden border border-line text-left">
              {"sealed" in o && o.sealed ? (
                <div className="relative aspect-[3/4] w-full bg-ink">
                  <div className="absolute inset-6 border border-blood/40" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center">
                    <p className="font-mono text-[10px] tracking-[0.32em] text-blood">FILE SEALED // LENS REQUIRED</p>
                    <p className="glitch-word font-display text-4xl font-semibold" data-text={o.name}>
                      {o.name}
                    </p>
                    <p className="font-mono text-[10px] tracking-[0.22em] text-mute">{o.role}</p>
                  </div>
                </div>
              ) : (
                <div className="lens aspect-[3/4] w-full overflow-hidden">
                  <img
                    src={o.image}
                    alt={o.name}
                    className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/25 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4">
                <p className="font-mono text-[10px] tracking-[0.28em] text-ice">
                  {o.tier} · {o.role}
                </p>
                <p className="glitch-word font-display text-3xl font-semibold" data-text={o.name}>
                  {o.name}
                </p>
              </div>
            </button>
          </Tilt>
        ))}
      </div>
      {op ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/80 p-4 md:items-center" onClick={() => setOpen(null)}>
          <article className="assemble panel grid max-h-[90dvh] w-full max-w-4xl overflow-auto md:grid-cols-[280px_1fr]" onClick={(e) => e.stopPropagation()}>
            {"sealed" in op && op.sealed ? (
              <div className="grid h-64 place-items-center border-b border-line bg-ink md:h-full md:border-b-0 md:border-r">
                <p className="font-mono text-[10px] tracking-[0.28em] text-blood">LENS REQUIRED</p>
              </div>
            ) : (
              <img src={op.image} alt="" className="h-64 w-full object-cover object-top md:h-full" />
            )}
            <div className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <Label>CLASSIFIED DOSSIER // {op.tier}</Label>
                  <h3 className="mt-2 font-display text-4xl font-semibold">{op.name}</h3>
                  <p className="font-mono text-[10px] tracking-[0.24em] text-blood">{op.role}</p>
                </div>
                <button type="button" className="hot-link min-h-11 px-3 font-mono text-[10px] tracking-[0.2em] text-mute" onClick={() => setOpen(null)}>
                  CLOSE [X]
                </button>
              </div>
              <p className="mt-6 text-sm text-fg/80">“{op.quote}”</p>
              <Label>
                <span className="mt-6 block">OPERATIONAL ROLE</span>
              </Label>
              <ul className="mt-2 space-y-1 text-sm text-mute">
                {op.duties.map((d) => (
                  <li key={d}>▸ {d}</li>
                ))}
              </ul>
              <div className="mt-6 grid grid-cols-3 gap-3 border-t border-line pt-4">
                {op.stats.map((s) => (
                  <div key={s.k}>
                    <p className="font-display text-xl font-semibold tabular">{s.v}</p>
                    <p className="font-mono text-[10px] tracking-[0.16em] text-mute">{s.k}</p>
                  </div>
                ))}
              </div>
            </div>
          </article>
        </div>
      ) : null}
    </section>
  );
}

export function Bloodline() {
  const { ref, on } = useInView<HTMLDivElement>();
  return (
    <section id="about" className="border-t border-line">
      <div ref={ref} className={cn("story-open px-6 py-20 md:px-16 md:py-28", on && "is-in")}>
        <Label>LINEAGE // THREE NAMES. ONE PERIMETER.</Label>
        <h2 className="mt-5 max-w-4xl font-display text-4xl font-semibold leading-[0.95] md:text-6xl">
          <span className="story-line block">THE EMPEROR BUILT THE VAULT.</span>
          <span className="story-line block">THE DAUGHTER HOLDS THE KEY.</span>
          <span className="story-line block text-ember">THE TABLE IS NOT IN THE TOWER.</span>
        </h2>
        <div className="story-cast mt-10 flex flex-wrap gap-2">
          {STORY.map((act) => (
            <a
              key={act.id}
              href={`#story-${act.id}`}
              className="story-jump"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById(`story-${act.id}`)?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              <span className="font-mono text-[9px] tracking-[0.28em] text-mute">{act.no}</span>
              <span className="mt-1 block font-display text-lg font-semibold tracking-[0.12em]">{act.short}</span>
            </a>
          ))}
        </div>
      </div>
      {STORY.map((act) => (
        <StoryAct key={act.id} act={act} />
      ))}
    </section>
  );
}

const STORY = [
  {
    id: "saburo",
    no: "01",
    short: "SABURO",
    kicker: "THE EMPEROR // INTERNAL CIRCULAR",
    name: "SABURO ARASAKA",
    role: "CHAIRMAN",
    stamp: "BIOMETRIC // CHAIRMAN TIER-0",
    image: "/media/saburo.png",
    scene: "/media/saburo-bg.png",
    face: "center 10%",
    align: "left" as const,
    quote: "There are banks. And then there is Arasaka.",
    body: "He does not serve clients. He defines the conditions under which capital is allowed to exist. Banking, security, and manufacturing are one doctrine. Night City does not get a vote. The vaults do not ask permission. They wait.",
    facts: [
      { k: "SEAT", v: "CHAIRMAN", note: "Tokyo 2028. The board does not vote." },
      { k: "ORIGIN", v: "TOKYO", note: "The tower in Night City is a limb. The head is still Japan." },
      { k: "DOCTRINE", v: "PERIMETER", note: "If it can be entered, it is not Arasaka." },
    ],
  },
  {
    id: "hanako",
    no: "02",
    short: "HANAKO",
    kicker: "KIJI FACTION // CONTINUITY",
    name: "HANAKO ARASAKA",
    role: "SUCCESSOR",
    stamp: "BIOMETRIC // SUCCESSOR KIJI",
    image: "/media/hanako.jpg",
    scene: "/media/hanako-bg.png",
    face: "38% 12%",
    align: "right" as const,
    quote: "She does not inherit a bank. She inherits a perimeter.",
    body: "The public voice of the tower after the emperor. A netrunner. The reason the corporation still speaks in one voice. When the board’s future is on the line, she summons the table — not in the lobby, not in the vault. At Black Sapphire.",
    facts: [
      { k: "FACTION", v: "KIJI", note: "The loyal line. The one that still answers the emperor." },
      { k: "ROLE", v: "SUCCESSOR", note: "Continuity is not inheritance. It is enforcement." },
      { k: "CLEARANCE", v: "TIER-0", note: "She opens the vault. She can also close the city." },
    ],
  },
  {
    id: "sapphire",
    no: "03",
    short: "SAPPHIRE",
    kicker: "THRESHOLD // NOT THE TOWER",
    name: "BLACK SAPPHIRE",
    role: "UNLOGGED TABLE",
    stamp: "VENUE // UNLOGGED",
    image: "/media/black-sapphire.jpg",
    face: "center 52%",
    align: "center" as const,
    quote: "Some meetings cannot be logged. They are still binding.",
    body: "When the street can see who enters Arasaka Tower, the board does not enter Arasaka Tower. Black Sapphire is the off-record table. Sapphire light. No cameras that Netwatch did not put there. You request an audience. Hanako decides if the city still needs you.",
    facts: [
      { k: "STATUS", v: "UNLOGGED", note: "If it is on a ledger, it did not happen here." },
      { k: "CHAIR", v: "HANAKO", note: "She sets the table. She ends the conversation." },
      { k: "RECORD", v: "NONE", note: "No feed. No stamp. The decision still holds." },
    ],
    cta: true,
  },
];

function useInView<T extends HTMLElement>(threshold = 0.28) {
  const ref = useRef<T>(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e?.isIntersecting) setOn(true);
      },
      { threshold },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return { ref, on };
}

function StoryAct({ act }: { act: (typeof STORY)[number] }) {
  const { ref, on } = useInView<HTMLElement>(0.24);
  const [open, setOpen] = useState(0);
  const t = useDecrypt(on, 1200);
  const note = act.facts[open]?.note;
  const center = act.align === "center";
  const right = act.align === "right";
  const scene = "scene" in act ? act.scene : undefined;

  return (
    <article
      ref={ref}
      id={`story-${act.id}`}
      className={cn("story-act", on && "is-in")}
      data-align={act.align}
      data-who={act.id}
    >
      {scene ? (
        <div className="story-scene" aria-hidden>
          <img src={scene} alt="" className="kenburns" />
        </div>
      ) : null}
      <div className={cn("story-stage", center && "is-full")}>
        <div className="story-portrait" {...trackPointer(12)}>
          <img src={act.image} alt={act.name} className="story-face" style={{ objectPosition: act.face }} />
          <span className="story-scan" aria-hidden />
          <span className="story-stamp">{act.stamp}</span>
        </div>
        <div className={cn("story-copy", center && "is-center", right && "is-right")}>
          <p className="story-no" aria-hidden>
            {act.no}
          </p>
          <Label>{act.kicker}</Label>
          <p className="mt-3 font-mono text-[10px] tracking-[0.32em] text-blood">{act.role}</p>
          <div className="story-rule mt-4 w-24" />
          <h2 className="glitch-word mt-5 font-display text-5xl font-semibold leading-[0.9] md:text-7xl" data-text={act.name}>
            <DecryptText text={act.name} t={t} />
          </h2>
          <p className="mt-5 max-w-lg text-sm leading-relaxed text-fg/80">{act.body}</p>
          <p className="quote-hot mt-6 max-w-lg font-display text-xl text-fg/90 md:text-2xl">“{act.quote}”</p>
          <div className={cn("mt-8 grid grid-cols-3 gap-2", center && "mx-auto max-w-md")}>
            {act.facts.map((f, i) => (
              <button
                key={f.k}
                type="button"
                onMouseEnter={() => setOpen(i)}
                onFocus={() => setOpen(i)}
                onClick={() => setOpen(i)}
                className={cn("story-fact", open === i && "is-on")}
              >
                <span className="block font-mono text-[9px] tracking-[0.2em] text-mute">{f.k}</span>
                <span className="mt-1 block font-display text-lg font-semibold">{f.v}</span>
              </button>
            ))}
          </div>
          <p className="story-note mt-4 font-mono text-[11px] tracking-[0.08em] text-ice/80">{note}</p>
          {act.cta ? (
            <Link
              to="/intake"
              className="magnet neon-ice mt-8 inline-flex min-h-11 items-center border border-ember px-8 py-3 font-display text-sm tracking-[0.3em] text-ember"
              {...magnetProps(10)}
            >
              REQUEST AN AUDIENCE
            </Link>
          ) : null}
        </div>
      </div>
    </article>
  );
}

export function Doctrine() {
  return (
    <section className="relative overflow-hidden border-t border-line px-4 py-24 md:px-10" {...trackPointer(10)}>
      <div className="para-mover">
        <img src="/media/saburo-bg.png" alt="" className="absolute inset-0 h-full w-full object-cover opacity-40 kenburns" />
      </div>
      <div className="absolute inset-0 bg-ink/75" />
      <div className="relative z-10 mx-auto max-w-4xl">
        <div className="mb-8 flex flex-wrap gap-x-6 gap-y-2 font-mono text-[10px] tracking-[0.22em] text-mute">
          {["TIER", "TRAUMA TEAM ON STANDBY", "SIGNATURE LOCKED", "NETWATCH ACTIVE", "BLACK ICE ARMED"].map((t) => (
            <span key={t} className="chip-hot flex items-center gap-2">
              <span className="size-1.5 bg-blood" />
              {t}
            </span>
          ))}
        </div>
        <Label>DOCTRINE // INTERNAL CIRCULAR // 077-EX</Label>
        <h2 className="mt-6 font-display text-4xl font-semibold leading-tight md:text-6xl">
          THERE ARE BANKS.
          <br />
          AND THEN THERE IS <GlitchText className="text-blood" idle text="ARASAKA" />
        </h2>
      </div>
    </section>
  );
}

function LiveFeed() {
  const [rows, setRows] = useState(SEED_THREATS);
  useEffect(() => {
    const t = window.setInterval(() => {
      const ev = LIVE_EVENTS[Math.floor(Math.random() * LIVE_EVENTS.length)];
      setRows((prev) =>
        [
          {
            id: `L${Date.now()}`,
            level: ev.level,
            code: ev.code,
            detail: ev.detail,
            node: "NX-PERIM",
            at: new Date().toLocaleTimeString("en-GB", { hour12: false }),
          },
          ...prev,
        ].slice(0, 8),
      );
    }, 4200);
    return () => window.clearInterval(t);
  }, []);

  const tone: Record<string, string> = {
    CRITICAL: "bg-blood text-fg",
    HIGH: "bg-ember/80 text-ink",
    MED: "bg-ice/80 text-ink",
    SEALED: "border border-ice text-ice",
    INFO: "border border-line text-mute",
  };

  return (
    <ul className="space-y-2">
      {rows.map((t) => (
        <li key={t.id} className="feed-row feed-in flex flex-wrap items-center gap-3 border-b border-line/60 py-2 font-mono text-[11px] tracking-[0.08em]">
          <span className={cn("min-w-16 px-2 py-0.5 text-center text-[10px] tracking-[0.16em]", tone[t.level] ?? "text-mute")}>
            {t.level}
          </span>
          <span className="flex-1 text-fg">{t.code}</span>
          <span className="text-mute">{t.node}</span>
          <span className="text-mute">{t.at}</span>
        </li>
      ))}
    </ul>
  );
}

const SECTORS = [
  {
    id: "7-A",
    st: "CLEAN",
    copy: "Operators on the gate. No hostile signature.",
    cam: "/media/netwatch-security.png",
    camId: "CAM-7743",
  },
  {
    id: "7-B",
    st: "QUIET",
    copy: "Client lounge. Cover holds. One-way glass.",
    cam: "/media/lounge.png",
    camId: "CAM-7811",
  },
  {
    id: "EDGE",
    st: "HOLD",
    copy: "Tower spine corridor. Red sector. Perimeter holds.",
    cam: "/media/netwatch-tower.png",
    camId: "CAM-8090",
  },
  {
    id: "WALL",
    st: "REJECT",
    copy: "Vault 7A sealed. Unauthorized personnel refused.",
    cam: "/media/vault.png",
    camId: "CAM-7A01",
  },
] as const;

export function NetwatchLive() {
  const [locked, setLocked] = useState(0);
  const [hover, setHover] = useState<number | null>(null);
  const lit = hover ?? locked;
  const sector = SECTORS[lit] ?? SECTORS[0];

  return (
    <section id="security" className="border-t border-line px-4 py-20 md:px-10">
      <p className="font-mono text-[10px] tracking-[0.3em] text-blood">NETWATCH / ARMED // LIVE</p>
      <h2 className="mt-4 font-display text-4xl font-semibold md:text-6xl">
        ARASAKA NETWATCH <GlitchText className="text-blood" text="ACTIVE." />
      </h2>
      <p className="mt-3 max-w-xl text-sm text-mute">
        Hover a sector to preview the feed. Click to lock the trace. Unauthorized access is a failure condition.
      </p>
      <div className="mt-10 grid gap-6 lg:grid-cols-[1.45fr_1fr]">
        <div className="cam-live lens relative overflow-hidden border border-line">
          <img key={sector.id} src={sector.cam} alt="" className="h-72 w-full object-cover md:h-96 rgb-hit" />
          <div className="cam-live-scan" aria-hidden />
          <div className="absolute left-3 top-3 flex items-center gap-2 font-mono text-[10px] tracking-[0.22em]">
            <span className="size-1.5 bg-blood" style={{ animation: "rec-blink 1.2s steps(1) infinite" }} />
            {sector.camId} // LIVE
          </div>
          <div className="pointer-events-none absolute right-3 top-3 font-mono text-[10px] tracking-[0.22em] text-ice">
            {hover === null ? "TRACE LOCKED" : "PREVIEW"}
          </div>
          <div className="reticle is-armed pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />
          <div className="trace-bars" aria-hidden>
            {Array.from({ length: 8 }).map((_, i) => (
              <span key={i} style={{ animationDelay: `${i * 80}ms` }} />
            ))}
          </div>
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink to-transparent p-4">
            <p className="font-mono text-[10px] tracking-[0.22em] text-mute">
              SECTOR {sector.id} // {sector.st}
            </p>
            <p className="mt-1 text-sm text-fg/85">{sector.copy}</p>
          </div>
        </div>
        <div>
          <Label>PERIMETER BOARD</Label>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {SECTORS.map((s, i) => (
              <button
                key={s.id}
                type="button"
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
                onFocus={() => setHover(i)}
                onBlur={() => setHover(null)}
                onClick={() => setLocked(i)}
                className={cn("sector-pad", lit === i && "is-on", locked === i && hover === null && "is-locked")}
              >
                <span className="block font-mono text-[9px] tracking-[0.22em] text-mute">SECTOR</span>
                <span className="mt-1 block font-display text-2xl font-semibold tracking-[0.08em]">{s.id}</span>
                <span className={cn("mt-1 block font-mono text-[10px] tracking-[0.2em]", lit === i ? "text-ice" : "text-mute")}>
                  {s.st}
                </span>
                <span className="sector-fill" />
              </button>
            ))}
          </div>
          <Tilt className="panel mt-3 p-5" strength={0.45}>
            <h3 className="font-display text-3xl font-semibold leading-tight">
              LIVE COMMAND.
              <br />
              ONE ROUTE.
              <br />
              <span className="text-blood">ZERO BREACHES.</span>
            </h3>
            <dl className="mt-5 space-y-2 font-mono text-[10px] tracking-[0.18em] text-mute">
              <div className="flex justify-between">
                <dt>MEAN RESPONSE</dt>
                <dd className="text-fg">00:00:04</dd>
              </div>
              <div className="flex justify-between">
                <dt>KILL-CHAIN</dt>
                <dd className="text-blood">AUTOMATED</dd>
              </div>
              <div className="flex justify-between">
                <dt>INTRUDER STATUS</dt>
                <dd className="text-ice">NEUTRALIZED</dd>
              </div>
              <div className="flex justify-between">
                <dt>LOCKED SECTOR</dt>
                <dd className="text-fg">{SECTORS[locked]?.id}</dd>
              </div>
            </dl>
          </Tilt>
        </div>
      </div>
      <div className="mt-8 grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <div className="panel p-5">
          <Label>LIVE THREAT FEED</Label>
          <div className="mt-3">
            <LiveFeed />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 lg:grid-cols-1">
          {[
            ["0", "CONFIRMED BREACHES"],
            ["4096-BIT", "ENCRYPTION"],
            ["0.2s", "THREAT RESPONSE"],
          ].map(([v, k]) => (
            <div key={k} className="panel metric-cell p-4">
              <p className="metric-value font-display text-3xl font-semibold tabular text-fg">{v}</p>
              <p className="mt-1 font-mono text-[10px] tracking-[0.2em] text-mute">{k}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Lockup() {
  return (
    <section className="relative overflow-hidden">
      <img src="/media/hero.png" alt="" className="absolute inset-0 h-full w-full object-cover opacity-22" />
      <div className="absolute inset-0 bg-ink/80" />
      <div className="relative z-10 flex min-h-[56vh] flex-col items-center justify-center px-4 py-24 text-center">
        <BrandLogo />
      </div>
      <footer className="relative z-10 border-t border-line px-4 py-12 md:px-10">
        <div className="grid gap-4 font-mono text-[10px] tracking-[0.18em] text-mute sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-fg">TOKYO HQ</p>
            <p className="mt-2">ARASAKA TOWER // SECTOR 1</p>
          </div>
          <div>
            <p className="text-fg">NIGHT CITY HUB</p>
            <p className="mt-2">MIKOSHI / VAULT-09</p>
          </div>
          <div>
            <p className="text-fg">CLEARANCE</p>
            <p className="mt-2">TIER-3 PUBLIC // READ</p>
          </div>
          <div>
            <p className="text-fg">FILE STAMP</p>
            <p className="mt-2">ARK/077-EX/0451</p>
          </div>
        </div>
        <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <FooterCol
            title="DIVISIONS"
            items={["Private Banking", "Netwatch Operations", "Black ICE Defense", "Trauma Team Retainer", "Vault Custody"]}
          />
          <FooterCol
            title="ACCESS"
            items={[
              ["Sign In", "/login"],
              ["Create Account", "/intake"],
              ["Security Status", "/#security"],
              ["Tower", "/#floors"],
            ]}
          />
          <FooterCol
            title="DIRECTORATE"
            items={["Saburo Arasaka // Chairman", "Hanako Arasaka // Successor", "Adam Smasher // Security", "Yorinobu // Disowned"]}
          />
          <FooterCol
            title="COMPLIANCE"
            items={["Tamper-evident ledger", "4096-bit at rest", "Netwatch perpetual logs", "Read & burn protocol"]}
          />
        </div>
      </footer>
    </section>
  );
}

function FooterCol({ title, items }: { title: string; items: (string | [string, string])[] }) {
  return (
    <div>
      <p className="font-mono text-[10px] tracking-[0.28em] text-blood">{title}</p>
      <ul className="mt-3 space-y-1 font-mono text-[11px] tracking-[0.08em] text-mute">
        {items.map((it) =>
          Array.isArray(it) ? (
            <li key={it[0]}>
              <a href={it[1]} className="hot-link">
                {it[0]}
              </a>
            </li>
          ) : (
            <li key={it}>{it}</li>
          ),
        )}
      </ul>
    </div>
  );
}
