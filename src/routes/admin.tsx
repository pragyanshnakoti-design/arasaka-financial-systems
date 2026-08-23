import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Navigate } from "@tanstack/react-router";
import { Hydrate } from "@/components/hydrate";
import { Label } from "@/components/chrome";
import { Roll } from "@/components/roll";
import { BlackIceSlam } from "@/components/kiroshi";
import { magnetProps } from "@/components/motion";
import { ConsoleShell, Kpi, Stamp, statusTone } from "@/components/console-shell";
import { JavaChat } from "@/components/java-chat";
import { LIVE_EVENTS, formatEddie, type ThreatLevel } from "@/lib/data";
import { type BankNode, type LedgerLine } from "@/lib/bank";
import { useSession } from "@/lib/session";
import { cn } from "@/lib/cn";

export const Route = createFileRoute("/admin")({ component: AdminPage });

function AdminPage() {
  return (
    <Hydrate>
      <Admin />
    </Hydrate>
  );
}

const RAIL = [
  { id: "desk", label: "DESK" },
  { id: "clients", label: "CLIENTS" },
  { id: "kyc", label: "KYC QUEUE" },
  { id: "ledger", label: "LEDGER" },
  { id: "threats", label: "THREATS" },
  { id: "audit", label: "AUDIT" },
];

function Admin() {
  const node = useSession((s) => s.node);
  const nodes = useSession((s) => s.nodes);
  const threats = useSession((s) => s.threats);
  const audit = useSession((s) => s.audit);
  const ledger = useSession((s) => s.ledger);
  const kyc = useSession((s) => s.kyc);
  const freeze = useSession((s) => s.freeze);
  const unfreeze = useSession((s) => s.unfreeze);
  const clearKyc = useSession((s) => s.clearKyc);
  const rejectKyc = useSession((s) => s.rejectKyc);
  const ledgerOk = useSession((s) => s.ledgerOk);
  const [tab, setTab] = useState("desk");
  const [q, setQ] = useState("");
  const [file, setFile] = useState<string | null>(null);
  const [reason, setReason] = useState("Hostile signature. Perimeter first.");
  const [ice, setIce] = useState(false);
  const [live, setLive] = useState(threats);
  const [note, setNote] = useState("Cleared. T3 vault opened.");
  const [lq, setLq] = useState("");
  const [openLine, setOpenLine] = useState<LedgerLine | null>(null);

  useEffect(() => {
    const t = window.setInterval(() => {
      const ev = LIVE_EVENTS[Math.floor(Math.random() * LIVE_EVENTS.length)];
      setLive((prev) =>
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
        ].slice(0, 18),
      );
    }, 8000);
    return () => window.clearInterval(t);
  }, []);

  useEffect(() => {
    setLive(threats);
  }, [threats]);

  if (!node) return <Navigate to="/login" />;
  if (node.role !== "admin") return <Navigate to="/dashboard" />;

  const clients = nodes.filter((n) => n.role === "client");
  const frozen = clients.filter((n) => n.status === "FROZEN").length;
  const hold = kyc.filter((k) => k.decision === "HOLD").length;
  const aum = clients.reduce((s, n) => s + n.balance, 0);
  const integrity = ledgerOk();
  const filtered = clients.filter(
    (n) =>
      n.name.toLowerCase().includes(q.toLowerCase()) ||
      n.email.toLowerCase().includes(q.toLowerCase()) ||
      n.id.toLowerCase().includes(q.toLowerCase()),
  );
  const target = nodes.find((n) => n.id === file) ?? null;
  const queue = kyc.filter((k) => k.decision === "HOLD" || k.decision === "PENDING");
  const book = useMemo(
    () =>
      ledger
        .filter(
          (l) =>
            !lq ||
            l.accountId.toLowerCase().includes(lq.toLowerCase()) ||
            l.hash.toLowerCase().includes(lq.toLowerCase()) ||
            l.counterparty.toLowerCase().includes(lq.toLowerCase()) ||
            String(l.amount).includes(lq),
        )
        .sort((a, b) => b.iso.localeCompare(a.iso)),
    [ledger, lq],
  );

  function deploy() {
    if (!target) return;
    setIce(true);
    freeze(target.id, reason);
    window.setTimeout(() => {
      setIce(false);
      setFile(null);
    }, 720);
  }

  return (
    <>
      <ConsoleShell kicker="NETWATCH COMMAND // T0" title="COMMAND DESK" rail={RAIL} active={tab} onRail={setTab}>
        {!integrity.ok ? (
          <div className="mb-5 border border-blood px-4 py-3 font-mono text-[11px] tracking-[0.16em] text-blood">
            LEDGER INTEGRITY FAIL · broken at {integrity.brokenAt}
          </div>
        ) : null}

        {tab === "desk" && (
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Kpi k="CLIENTS" v={String(clients.length)} />
              <Kpi k="KYC HOLD" v={String(hold)} hot={hold > 0} />
              <Kpi k="FROZEN" v={String(frozen)} hot={frozen > 0} />
              <Kpi k="CHAIN" v={integrity.ok ? "CLEAN" : "FAIL"} hot={!integrity.ok} />
            </div>
            <div className="panel p-5">
              <Label>ASSETS UNDER PROTECTION</Label>
              <p className="mt-2 font-display text-4xl font-semibold tabular">
                ₡<Roll value={aum} digits={0} />
              </p>
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="cctv lens relative min-h-[200px] overflow-hidden border border-line">
                <img src="/media/netwatch-tower.png" alt="Live gate" className="h-full w-full object-cover" />
                <div className="absolute left-3 top-3 flex items-center gap-2 font-mono text-[10px] tracking-[0.22em]">
                  <span className="size-1.5 bg-blood" style={{ animation: "rec-blink 1.2s steps(1) infinite" }} />
                  CAM // CHECKPOINT · LIVE
                </div>
              </div>
              <div className="panel p-4">
                <Label>ATTENTION</Label>
                <ul className="mt-3 space-y-2 font-mono text-[11px] tracking-[0.1em]">
                  {queue.slice(0, 4).map((k) => {
                    const n = nodes.find((x) => x.id === k.nodeId);
                    return (
                      <li key={k.id} className="flex justify-between border-b border-line py-2">
                        <span>{n?.name ?? k.nodeId}</span>
                        <button type="button" className="hot-link text-ember" onClick={() => setTab("kyc")}>
                          KYC HOLD
                        </button>
                      </li>
                    );
                  })}
                  {clients
                    .filter((n) => n.status === "FROZEN")
                    .map((n) => (
                      <li key={n.id} className="flex justify-between border-b border-line py-2">
                        <span>{n.name}</span>
                        <span className="text-blood">FROZEN</span>
                      </li>
                    ))}
                  {queue.length === 0 && frozen === 0 ? <li className="text-mute">Desk is quiet.</li> : null}
                </ul>
              </div>
            </div>
          </div>
        )}

        {tab === "clients" && (
          <div className="panel p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Label>CLIENT REGISTRY</Label>
              <input
                className="min-h-11 w-full max-w-xs border border-line bg-ink px-3 font-mono text-xs outline-none focus:border-blood"
                placeholder="search name / email / id"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[760px] text-left font-mono text-[11px] tracking-[0.08em]">
                <thead className="text-mute">
                  <tr className="border-b border-line">
                    <th className="py-2 font-medium">ID</th>
                    <th className="font-medium">NAME</th>
                    <th className="font-medium">EMAIL</th>
                    <th className="font-medium">TIER</th>
                    <th className="font-medium">BALANCE</th>
                    <th className="font-medium">STATUS</th>
                    <th className="font-medium">ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((n) => (
                    <tr key={n.id} className="ledger-row border-b border-line/70">
                      <td className="py-3 text-ice">{n.id}</td>
                      <td>
                        <button type="button" className="hot-link" onClick={() => setFile(n.id)}>
                          {n.name}
                        </button>
                      </td>
                      <td>{n.email}</td>
                      <td>{n.clearance}</td>
                      <td className="tabular">₡{formatEddie(n.balance)}</td>
                      <td className={statusTone(n.status)}>{n.status}</td>
                      <td>
                        {n.status === "FROZEN" ? (
                          <button type="button" className="hot-link min-h-11 text-ice" onClick={() => unfreeze(n.id)}>
                            UNFREEZE
                          </button>
                        ) : n.status === "ACTIVE" ? (
                          <button type="button" className="hot-link min-h-11 text-blood" onClick={() => setFile(n.id)}>
                            FREEZE
                          </button>
                        ) : (
                          <button type="button" className="hot-link min-h-11" onClick={() => setFile(n.id)}>
                            FILE
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === "kyc" && (
          <div className="panel p-5">
            <Label>KYC QUEUE</Label>
            <p className="mt-1 text-sm text-mute">Oldest holds first. Clearing writes an opening credit and opens the vault.</p>
            <ul className="mt-5 space-y-3">
              {queue.length === 0 ? <li className="text-sm text-mute">Queue empty.</li> : null}
              {queue.map((k) => {
                const n = nodes.find((x) => x.id === k.nodeId);
                if (!n) return null;
                return (
                  <li key={k.id} className="assemble border border-line p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-display text-xl">{n.name}</p>
                        <p className="font-mono text-[10px] tracking-[0.16em] text-mute">
                          {n.email} · {n.id} · RISK {k.riskScore}
                        </p>
                      </div>
                      <Stamp tone="ember">{k.decision}</Stamp>
                    </div>
                    <ul className="mt-3 flex flex-wrap gap-2">
                      {k.docs.map((d) => (
                        <Stamp key={d.kind} tone={d.status === "RECEIVED" ? "ice" : "ember"}>
                          {d.kind} {d.status}
                        </Stamp>
                      ))}
                    </ul>
                    <p className="mt-3 text-sm text-mute">{k.notes.at(-1)}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <input
                        className="min-h-11 flex-1 border border-line bg-ink px-3 font-mono text-xs"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                      />
                      <button
                        type="button"
                        className="min-h-11 bg-blood px-5 font-mono text-[10px] tracking-[0.18em]"
                        onClick={() => clearKyc(n.id, note)}
                      >
                        CLEAR T3
                      </button>
                      <button
                        type="button"
                        className="min-h-11 border border-line px-5 font-mono text-[10px] tracking-[0.18em] text-blood"
                        onClick={() => rejectKyc(n.id, "Rejected at desk.")}
                      >
                        REJECT
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {tab === "ledger" && (
          <div className="panel p-5">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <Label>GLOBAL BOOK</Label>
                <p className="mt-1 text-sm text-mute">One chain. Search node, hash, party, or amount.</p>
              </div>
              <input
                className="min-h-11 w-full max-w-xs border border-line bg-ink px-3 font-mono text-xs"
                placeholder="search book"
                value={lq}
                onChange={(e) => setLq(e.target.value)}
              />
            </div>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[800px] text-left font-mono text-[11px]">
                <thead className="text-mute">
                  <tr className="border-b border-line">
                    <th className="py-2 font-medium">NODE</th>
                    <th className="font-medium">KIND</th>
                    <th className="font-medium">PARTY</th>
                    <th className="font-medium">DR</th>
                    <th className="font-medium">CR</th>
                    <th className="font-medium">HASH</th>
                  </tr>
                </thead>
                <tbody>
                  {book.slice(0, 40).map((l) => (
                    <tr key={l.id} className="ledger-row cursor-pointer border-b border-line/70" onClick={() => setOpenLine(l)}>
                      <td className="py-3 text-ice">{l.accountId}</td>
                      <td>{l.kind}</td>
                      <td>{l.counterparty}</td>
                      <td className="tabular text-blood">{l.side === "DR" ? formatEddie(l.amount) : ""}</td>
                      <td className="tabular text-ice">{l.side === "CR" ? formatEddie(l.amount) : ""}</td>
                      <td className="text-mute">{l.hash.slice(0, 8)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === "threats" && (
          <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
            <div className="panel max-h-[70vh] overflow-auto p-4">
              <Label>THREAT FEED</Label>
              <ul className="mt-3 space-y-2">
                {live.map((t) => (
                  <li key={t.id} className={cn("border-l-2 pl-3", levelBorder(t.level))}>
                    <p className="font-mono text-[10px] tracking-[0.16em] text-blood">
                      {t.level} · {t.code}
                    </p>
                    <p className="text-xs text-fg/80">{t.detail}</p>
                    <p className="font-mono text-[10px] text-mute">
                      {t.node} · {t.at}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
            <div className="panel p-4">
              <Label>SYSTEM HEALTH</Label>
              <ul className="mt-3 space-y-2 font-mono text-[10px] tracking-[0.16em]">
                {[
                  ["BLACK ICE", "ARMED", true],
                  ["NETWATCH", "ACTIVE", false],
                  ["VAULT", "SEALED", false],
                  ["TRAUMA TEAM", "READY", false],
                  ["LEDGER CHAIN", integrity.ok ? "CLEAN" : "FAIL", !integrity.ok],
                ].map(([k, v, hot]) => (
                  <li key={String(k)} className="flex items-center justify-between text-mute">
                    <span className="flex items-center gap-2">
                      <span className={cn("size-1.5", hot ? "bg-blood" : "bg-ice")} style={{ animation: "heartbeat 1.8s ease-in-out infinite" }} />
                      {k}
                    </span>
                    <span className={hot ? "text-blood" : "text-ice"}>{v}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {tab === "audit" && (
          <div className="panel max-h-[70vh] overflow-auto p-4">
            <Label>AUDIT TRAIL</Label>
            <ul className="mt-2 space-y-1 font-mono text-[11px] tracking-[0.08em] text-mute">
              {audit.map((a, i) => (
                <li key={a.id} className={i === 0 ? "text-fg" : ""}>
                  {a.at} · {a.text}
                </li>
              ))}
            </ul>
          </div>
        )}
      </ConsoleShell>

      {target ? (
        <CaseFile
          target={target}
          ledger={ledger.filter((l) => l.accountId === target.id)}
          reason={reason}
          setReason={setReason}
          onClose={() => setFile(null)}
          onFreeze={deploy}
          onUnfreeze={() => {
            unfreeze(target.id);
            setFile(null);
          }}
          onClear={() => {
            clearKyc(target.id, note);
            setFile(null);
          }}
        />
      ) : null}

      {openLine ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/80 p-4" onClick={() => setOpenLine(null)}>
          <div className="assemble panel w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <Label>LINE</Label>
            <p className="mt-3 font-mono text-[11px] leading-6 text-mute">
              {openLine.id}
              <br />
              {openLine.accountId} · {openLine.kind} · {openLine.status}
              <br />
              {openLine.side} ₡{formatEddie(openLine.amount)}
              <br />
              HASH {openLine.hash}
            </p>
            <button type="button" className="mt-6 min-h-11 w-full border border-line font-mono text-[10px]" onClick={() => setOpenLine(null)}>
              CLOSE
            </button>
          </div>
        </div>
      ) : null}

      <BlackIceSlam open={ice} name={target?.name ?? "ACCOUNT"} />
      <JavaChat role="admin" />
    </>
  );
}

function CaseFile({
  target,
  ledger,
  reason,
  setReason,
  onClose,
  onFreeze,
  onUnfreeze,
  onClear,
}: {
  target: BankNode;
  ledger: LedgerLine[];
  reason: string;
  setReason: (v: string) => void;
  onClose: () => void;
  onFreeze: () => void;
  onUnfreeze: () => void;
  onClear: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/85 p-4" onClick={onClose}>
      <div className="assemble panel max-h-[90dvh] w-full max-w-lg overflow-auto p-6" onClick={(e) => e.stopPropagation()}>
        <Label>CLIENT FILE</Label>
        <h2 className="mt-2 font-display text-3xl">{target.name}</h2>
        <p className="mt-1 font-mono text-[10px] tracking-[0.16em] text-mute">
          {target.email} · {target.id} · {target.clearance}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Stamp tone={target.status === "FROZEN" || target.status === "SEALED" ? "blood" : target.status === "ACTIVE" ? "ice" : "ember"}>
            {target.status}
          </Stamp>
          <Stamp>RISK {target.riskScore}</Stamp>
        </div>
        <p className="mt-4 font-display text-2xl tabular">₡{formatEddie(target.balance)}</p>
        <ul className="mt-4 max-h-40 space-y-1 overflow-auto font-mono text-[11px] text-mute">
          {ledger.slice(0, 8).map((l) => (
            <li key={l.id}>
              {l.at} · {l.kind} · {l.side} {formatEddie(l.amount)}
            </li>
          ))}
        </ul>
        {target.status === "KYC_HOLD" ? (
          <button type="button" className="mt-5 min-h-11 w-full bg-blood font-mono text-[10px] tracking-[0.2em]" onClick={onClear}>
            CLEAR KYC · OPEN T3
          </button>
        ) : null}
        {target.status === "ACTIVE" ? (
          <>
            <label className="mt-5 block font-mono text-[10px] tracking-[0.2em] text-mute">
              FREEZE REASON
              <input className="mt-2 min-h-11 w-full border border-line bg-ink px-3 font-mono text-sm text-fg" value={reason} onChange={(e) => setReason(e.target.value)} />
            </label>
            <button type="button" className="magnet bracket-btn neon-blood mt-4 min-h-11 w-full bg-blood font-display tracking-[0.2em]" onClick={onFreeze} {...magnetProps(8)}>
              FREEZE
            </button>
          </>
        ) : null}
        {target.status === "FROZEN" ? (
          <button type="button" className="mt-5 min-h-11 w-full border border-ice font-mono text-[10px] tracking-[0.2em] text-ice" onClick={onUnfreeze}>
            UNFREEZE
          </button>
        ) : null}
        <button type="button" className="mt-3 min-h-11 w-full border border-line font-mono text-[10px] tracking-[0.2em]" onClick={onClose}>
          CLOSE
        </button>
      </div>
    </div>
  );
}

function levelBorder(level: ThreatLevel) {
  if (level === "CRITICAL") return "border-blood";
  if (level === "HIGH") return "border-ember";
  if (level === "SEALED") return "border-ice";
  return "border-line";
}
