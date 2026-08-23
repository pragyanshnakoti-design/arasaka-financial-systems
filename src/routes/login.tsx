import { useEffect, useState, type FormEvent } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { TowerNav, Label } from "@/components/chrome";
import { Seal } from "@/components/seal";
import { DEMO_TOKEN, useSession } from "@/lib/session";
import { cn } from "@/lib/cn";
import { GlitchText, magnetProps } from "@/components/motion";

export const Route = createFileRoute("/login")({ component: Login });

function Login() {
  const navigate = useNavigate();
  const signIn = useSession((s) => s.signIn);
  const [email, setEmail] = useState("v@arasaka.net");
  const [token, setToken] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [pct, setPct] = useState(0);
  const [ice, setIce] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setErr("");
    setBusy(true);
    const steps = [12, 28, 47, 63, 81, 94, 100];
    for (const p of steps) {
      setPct(p);
      await new Promise((r) => setTimeout(r, 110));
    }
    const res = signIn(email, token);
    if (!res.ok) {
      setBusy(false);
      setPct(0);
      setIce(true);
      setErr(res.reason);
      window.setTimeout(() => setIce(false), 700);
      return;
    }
    const n = useSession.getState().node;
    navigate({ to: n?.role === "admin" ? "/admin" : "/dashboard" });
  }

  return (
    <main className={cn("relative min-h-dvh overflow-hidden bg-ink pb-20", ice && "glitch-once")}>
      <img src="/media/hero.png" alt="" className="absolute inset-0 h-full w-full object-cover opacity-25" />
      <div className="absolute inset-0 bg-ink/80" />
      <div className="relative z-10">
        <TowerNav />
        <div className="mx-auto mt-8 w-full max-w-md px-4">
          <form onSubmit={submit} method="post" action="/login" className="panel p-6 md:p-8">
            <div className="mb-6 flex justify-center">
              <Seal className="size-10" accent />
            </div>
            <Label>
              <span className="text-blood">▸ SIGN IN</span>
            </Label>
            <h1 className="mt-3 font-display text-5xl font-semibold">
              <GlitchText idle text="SIGN IN" />
            </h1>
            <p className="mt-1 text-sm text-mute">Identify yourself to the tower. Email and password.</p>
            <label className="mt-8 block font-mono text-[10px] tracking-[0.28em] text-mute">
              EMAIL
              <input
                className="mt-2 min-h-11 w-full border border-line bg-ink px-3 font-mono text-sm text-fg outline-none focus:border-blood"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="username"
                type="email"
              />
            </label>
            <label className="mt-5 block font-mono text-[10px] tracking-[0.28em] text-mute">
              PASSWORD
              <input
                className={cn(
                  "mt-2 min-h-11 w-full border bg-ink px-3 font-mono text-sm text-fg outline-none focus:border-blood",
                  err ? "border-blood" : "border-line",
                )}
                type="password"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                autoComplete="current-password"
              />
            </label>
            {busy ? (
              <div className="mt-5 flex items-center gap-4">
                <div className="iris shrink-0" aria-hidden />
                <div className="flex-1">
                  <div className="flex justify-between font-mono text-[10px] tracking-[0.2em] text-ice">
                    <span>IDENTITY CHECK</span>
                    <span>{pct}%</span>
                  </div>
                  <div className="mt-2 h-1 w-full bg-raised">
                    <div className="h-full bg-ice" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              </div>
            ) : null}
            {err ? <p className="mt-3 font-mono text-[11px] tracking-[0.12em] text-blood">{err}</p> : null}
            <button
              type="submit"
              disabled={!mounted || busy}
              className="magnet bracket-btn neon-blood mt-8 min-h-12 w-full bg-blood font-display text-sm font-semibold tracking-[0.32em] text-fg disabled:opacity-70"
              {...magnetProps(10)}
            >
              {busy ? `VERIFYING… ${pct}%` : "SIGN IN"}
            </button>
            <div className="mt-6 flex items-center justify-between font-mono text-[10px] tracking-[0.18em] text-mute">
              <Link to="/intake" className="hot-link">
                CREATE ACCOUNT →
              </Link>
              <Link to="/" className="hot-link">
                ← BACK
              </Link>
            </div>
            <div className="mt-6 border-t border-line pt-4 font-mono text-[10px] tracking-[0.12em] text-mute">
              <p className="text-ice">DEMO ACCOUNTS · PASSWORD {DEMO_TOKEN}</p>
              <p className="mt-2 leading-5">
                v@arasaka.net — live T2 vault
                <br />
                jackie@arasaka.net — T3 private
                <br />
                panam@arasaka.net — T2 nomad
                <br />
                judy@arasaka.net — KYC hold
                <br />
                river@arasaka.net — KYC documents
                <br />
                kerry@arasaka.net — frozen T1
                <br />
                admin@arasaka.net — command
              </p>
              <p className="mt-2">Fictional demo. No real money. No real Arasaka.</p>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
