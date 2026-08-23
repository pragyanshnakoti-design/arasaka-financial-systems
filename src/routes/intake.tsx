import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { TowerNav, Label } from "@/components/chrome";
import { useSession } from "@/lib/session";
import { cn } from "@/lib/cn";
import { magnetProps } from "@/components/motion";

export const Route = createFileRoute("/intake")({ component: Intake });

const PHASES = [
  { id: "01", name: "YOUR DETAILS" },
  { id: "02", name: "IDENTITY CHECK" },
  { id: "03", name: "ACCOUNT TYPE" },
  { id: "04", name: "SUBMIT" },
];

function Intake() {
  const navigate = useNavigate();
  const enroll = useSession((s) => s.enroll);
  const [phase, setPhase] = useState(0);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [err, setErr] = useState("");
  const [scan, setScan] = useState(0);

  useEffect(() => {
    if (phase !== 1) return;
    setScan(0);
    const t = window.setInterval(() => {
      setScan((n) => (n >= 100 ? 100 : n + 4));
    }, 40);
    return () => window.clearInterval(t);
  }, [phase]);

  function next() {
    setErr("");
    if (phase === 0 && (!name.trim() || !email.includes("@"))) {
      setErr("Enter a name and a valid email.");
      return;
    }
    if (phase === 1 && scan < 100) {
      setErr("Let the identity check finish.");
      return;
    }
    if (phase === 3) {
      const r = enroll(name, email, token);
      if (!r.ok) {
        setErr(r.reason);
        return;
      }
      navigate({ to: "/dashboard" });
      return;
    }
    setPhase((p) => p + 1);
  }

  return (
    <main className="relative min-h-dvh overflow-hidden bg-ink pb-20">
      <img src="/media/reception.png" alt="" className="absolute inset-0 h-full w-full object-cover opacity-20" />
      <div className="absolute inset-0 bg-ink/85" />
      <div className="relative z-10">
        <TowerNav />
        <div className="mx-auto max-w-3xl px-4 py-8">
          <div className="flex items-center justify-between font-mono text-[10px] tracking-[0.2em] text-mute">
            <span>CREATE ACCOUNT // 04 STEPS</span>
            <Link to="/" className="hot-link hover:text-blood">
              CANCEL
            </Link>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-2 font-mono text-[10px] tracking-[0.14em] sm:grid-cols-4">
          {PHASES.map((p, i) => (
            <div key={p.id} className={cn("border-t-2 pt-2", i <= phase ? "border-blood text-fg" : "border-line text-mute")}>
              {p.id} / {p.name}
            </div>
          ))}
        </div>
        <div className="panel mt-10 p-6 md:p-10">
          <Label>
            <span className="text-blood">
              ▸ STEP {PHASES[phase].id} // {PHASES[phase].name}
            </span>
          </Label>
          {phase === 0 && (
            <>
              <h1 className="mt-4 font-display text-4xl font-semibold">CREATE YOUR ACCOUNT.</h1>
              <p className="mt-3 text-sm text-mute">
                Arasaka does not open anonymous vaults. Your name and email are recorded, indexed, and held.
              </p>
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <Field label="FULL NAME" value={name} onChange={setName} />
                <Field label="EMAIL" value={email} onChange={setEmail} />
              </div>
            </>
          )}
          {phase === 1 && (
            <>
              <h1 className="mt-4 font-display text-4xl font-semibold">IDENTITY CHECK.</h1>
              <p className="mt-3 text-sm text-mute">
                You agree that this account, vault, and session can be frozen if the tower detects a threat. That is the
                cost of the perimeter.
              </p>
              <div className="mt-8 border border-line p-5">
                <div className="flex justify-between font-mono text-[10px] tracking-[0.2em] text-ice">
                  <span>BIOMETRIC PLEDGE</span>
                  <span>{scan}%</span>
                </div>
                <div className="mt-3 flex h-12 items-end gap-1">
                  {Array.from({ length: 28 }).map((_, i) => (
                    <span
                      key={i}
                      className="w-full origin-bottom bg-ice/80"
                      style={{
                        height: `${20 + ((i * 17) % 80)}%`,
                        opacity: scan > i * 3.5 ? 1 : 0.15,
                        animation: scan > 10 ? `bar-live ${0.6 + (i % 4) * 0.15}s ease-in-out infinite` : undefined,
                      }}
                    />
                  ))}
                </div>
                <p className="mt-4 font-display text-xl">{scan >= 100 ? "IDENTITY CONFIRMED." : "HOLD STILL."}</p>
              </div>
            </>
          )}
          {phase === 2 && (
            <>
              <h1 className="mt-4 font-display text-4xl font-semibold">YOUR ACCOUNT TYPE.</h1>
              <p className="mt-3 text-sm text-mute">
                New clients open at Private (Tier-3). Higher clearance is granted, not requested.
              </p>
              <ul className="mt-6 space-y-2 border border-line p-4 font-mono text-xs tracking-[0.12em] text-mute">
                <li className="text-fg">T3 — Private · read · lounge access</li>
                <li>T2 — Dual-key vaults · trauma cover</li>
                <li>T1 — Executive allocation</li>
                <li>T0 — Command. Not for clients.</li>
              </ul>
            </>
          )}
          {phase === 3 && (
            <>
              <h1 className="mt-4 font-display text-4xl font-semibold">SUBMIT IDENTITY.</h1>
              <p className="mt-3 text-sm text-mute">Set a password. Minimum six characters. Netwatch still has to clear you before a vault opens.</p>
              <div className="mt-8">
                <Field label="PASSWORD (MIN 6)" value={token} onChange={setToken} password />
              </div>
            </>
          )}
          {err ? <p className="mt-4 font-mono text-[11px] tracking-[0.12em] text-blood">{err}</p> : null}
          <div className="mt-10 flex items-center justify-between">
            <button
              type="button"
              className="min-h-11 px-4 font-mono text-[10px] tracking-[0.2em] text-mute hover:text-fg"
              onClick={() => setPhase((p) => Math.max(0, p - 1))}
              disabled={phase === 0}
            >
              ← BACK
            </button>
            <button
              type="button"
              onClick={next}
              className="magnet bracket-btn neon-blood min-h-11 bg-blood px-8 font-display text-sm tracking-[0.28em] text-fg"
              {...magnetProps(10)}
            >
              {phase === 3 ? "SUBMIT IDENTITY →" : "CONTINUE →"}
            </button>
          </div>
        </div>
        </div>
      </div>
    </main>
  );
}

function Field({
  label,
  value,
  onChange,
  password,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  password?: boolean;
}) {
  return (
    <label className="block font-mono text-[10px] tracking-[0.24em] text-mute">
      {label}
      <input
        className="mt-2 min-h-11 w-full border border-line bg-ink px-3 font-mono text-sm text-fg outline-none focus:border-blood"
        value={value}
        type={password ? "password" : "text"}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}
