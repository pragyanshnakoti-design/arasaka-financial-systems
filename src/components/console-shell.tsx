import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Seal } from "./seal";
import { Label } from "./chrome";
import { useSession } from "@/lib/session";
import { cn } from "@/lib/cn";
import type { AccountStatus } from "@/lib/bank";

export type RailItem = { id: string; label: string; hint?: string };

export function statusTone(status: AccountStatus | string) {
  if (status === "FROZEN" || status === "SEALED") return "text-blood";
  if (status === "KYC_HOLD" || status === "APPLICANT") return "text-ember";
  return "text-ice";
}

export function ConsoleShell({
  kicker,
  title,
  rail,
  active,
  onRail,
  children,
  frozen,
}: {
  kicker: string;
  title: string;
  rail: RailItem[];
  active: string;
  onRail: (id: string) => void;
  children: ReactNode;
  frozen?: boolean;
}) {
  const node = useSession((s) => s.node);
  const signOut = useSession((s) => s.signOut);

  return (
    <main className={cn("console-root relative min-h-dvh bg-ink", frozen && "is-frozen")}>
      <div className="pointer-events-none absolute inset-0 opacity-[0.07]">
        <img
          src={node?.role === "admin" ? "/media/netwatch-security.png" : "/media/vault.png"}
          alt=""
          className="h-full w-full object-cover"
        />
      </div>
      <header className="relative z-20 flex items-center justify-between gap-3 border-b border-line px-4 py-3 md:px-6">
        <Link to="/" className="logo-hot flex items-center gap-3">
          <Seal className="size-7" />
          <span className="font-display text-sm font-semibold tracking-[0.32em]">ARASAKA</span>
        </Link>
        <div className="hidden items-center gap-3 font-mono text-[10px] tracking-[0.18em] sm:flex">
          <span className="text-mute">{node?.id}</span>
          <span className="text-fg">{node?.clearance}</span>
          <span className={statusTone(node?.status ?? "ACTIVE")}>{node?.status}</span>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/" className="nav-link hidden px-2 py-2 font-mono text-[10px] tracking-[0.2em] text-mute md:inline">
            TOWER
          </Link>
          <button type="button" onClick={signOut} className="nav-link px-2 py-2 font-mono text-[10px] tracking-[0.2em] text-mute hover:text-blood">
            SIGN OUT
          </button>
        </div>
      </header>

      <div className="relative z-10 mx-auto grid max-w-[1400px] md:grid-cols-[210px_1fr]">
        <aside className="border-b border-line md:min-h-[calc(100dvh-52px)] md:border-b-0 md:border-r">
          <div className="px-4 py-5">
            <Label>{kicker}</Label>
            <p className="mt-1 font-display text-xl font-semibold tracking-wide">{title}</p>
            <p className="mt-1 truncate font-mono text-[10px] tracking-[0.14em] text-mute">{node?.name}</p>
          </div>
          <nav className="flex gap-1 overflow-x-auto px-2 pb-3 md:flex-col md:overflow-visible md:px-3">
            {rail.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => onRail(r.id)}
                className={cn(
                  "min-h-11 shrink-0 px-3 py-2 text-left font-mono text-[10px] tracking-[0.2em] transition-colors duration-150",
                  active === r.id ? "border-l-2 border-blood bg-raised text-fg" : "border-l-2 border-transparent text-mute hover:text-fg",
                )}
              >
                {r.label}
              </button>
            ))}
          </nav>
        </aside>
        <section className="min-w-0 px-4 py-6 md:px-8">{children}</section>
      </div>
    </main>
  );
}

export function Stamp({ children, tone = "ice" }: { children: ReactNode; tone?: "ice" | "blood" | "ember" }) {
  return (
    <span
      className={cn(
        "stamp inline-block border px-2 py-1 font-mono text-[10px] tracking-[0.22em]",
        tone === "blood" && "border-blood text-blood",
        tone === "ice" && "border-ice text-ice",
        tone === "ember" && "border-ember text-ember",
      )}
    >
      {children}
    </span>
  );
}

export function Kpi({ k, v, hot }: { k: string; v: ReactNode; hot?: boolean }) {
  return (
    <div className="panel assemble p-4">
      <Label>{k}</Label>
      <p className={cn("mt-2 font-display text-3xl font-semibold tabular", hot && "text-blood")}>{v}</p>
    </div>
  );
}
