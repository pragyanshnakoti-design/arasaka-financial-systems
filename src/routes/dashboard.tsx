import { useMemo, useState, type FormEvent } from "react";
import { createFileRoute, Navigate } from "@tanstack/react-router";
import { Hydrate } from "@/components/hydrate";
import { Label } from "@/components/chrome";
import { Roll } from "@/components/roll";
import { magnetProps } from "@/components/motion";
import { ConsoleShell, Stamp, statusTone } from "@/components/console-shell";
import { JavaChat } from "@/components/java-chat";
import { formatEddie } from "@/lib/data";
import { KYC_STAGES, vaultBalance, type LedgerLine } from "@/lib/bank";
import { useSession } from "@/lib/session";
import { cn } from "@/lib/cn";

export const Route = createFileRoute("/dashboard")({ component: VaultPage });

function VaultPage() {
  return (
    <Hydrate>
      <Vault />
    </Hydrate>
  );
}

const RAIL = [
  { id: "overview", label: "OVERVIEW" },
  { id: "holdings", label: "HOLDINGS" },
  { id: "move", label: "MOVE MONEY" },
  { id: "ledger", label: "LEDGER" },
  { id: "kyc", label: "KYC" },
  { id: "succession", label: "SUCCESSION" },
];

const vaultTone: Record<string, string> = {
  fg: "text-fg",
  ice: "text-ice",
  blood: "text-blood",
  mute: "text-mute",
};

function Vault() {
  const node = useSession((s) => s.node);
  const ledger = useSession((s) => s.ledger);
  const kyc = useSession((s) => s.kyc);
  const beneficiaries = useSession((s) => s.beneficiaries);
  const transfer = useSession((s) => s.transfer);
  const confirmPending = useSession((s) => s.confirmPending);
  const setSuccessor = useSession((s) => s.setSuccessor);
  const addBeneficiary = useSession((s) => s.addBeneficiary);
  const [tab, setTab] = useState("overview");
  const [to, setTo] = useState("jackie@arasaka.net");
  const [amount, setAmount] = useState("");
  const [memo, setMemo] = useState("");
  const [vaultId, setVaultId] = useState("ed");
  const [msg, setMsg] = useState("");
  const [hold, setHold] = useState(0);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [openLine, setOpenLine] = useState<LedgerLine | null>(null);
  const [heir, setHeir] = useState("");
  const [rel, setRel] = useState("Named heir");
  const [bnName, setBnName] = useState("");
  const [bnEmail, setBnEmail] = useState("");
  const [filter, setFilter] = useState("");

  if (!node) return <Navigate to="/login" />;
  if (node.role === "admin") return <Navigate to="/admin" />;

  const mine = useMemo(
    () =>
      ledger
        .filter((l) => l.accountId === node.id)
        .sort((a, b) => b.iso.localeCompare(a.iso)),
    [ledger, node.id],
  );
  const caseFile = kyc.find((k) => k.nodeId === node.id);
  const mineBene = beneficiaries.filter((b) => b.ownerId === node.id);
  const eddies = vaultBalance(ledger, node.id, "ed");
  const frozen = node.status === "FROZEN";
  const gated = node.status !== "ACTIVE";
  const filtered = mine.filter(
    (l) =>
      !filter ||
      l.memo.toLowerCase().includes(filter.toLowerCase()) ||
      l.counterparty.toLowerCase().includes(filter.toLowerCase()) ||
      l.kind.toLowerCase().includes(filter.toLowerCase()),
  );

  function startMove(e: FormEvent) {
    e.preventDefault();
    setMsg("");
    const n = Number(amount);
    const r = transfer(to, n, memo, vaultId);
    if (!r.ok) {
      setMsg(r.reason);
      return;
    }
    setPendingId(r.pendingId);
    setHold(0);
    let t = 0;
    const iv = window.setInterval(() => {
      t += 4;
      setHold(t);
      if (t >= 100) {
        window.clearInterval(iv);
        const done = confirmPending(r.pendingId);
        setPendingId(null);
        if (done.ok) {
          setMsg(`Posted ₡${formatEddie(n)} to ${to}`);
          setAmount("");
          setMemo("");
        } else setMsg(done.reason);
      }
    }, 90);
  }

  return (
    <>
      <ConsoleShell
        kicker={`PRIVATE VAULT // ${node.clearance}`}
        title="VAULT"
        rail={RAIL}
        active={tab}
        onRail={setTab}
        frozen={frozen}
      >
        {frozen ? (
          <div className="mb-5 border border-blood bg-blood/15 px-4 py-3 font-mono text-[11px] tracking-[0.16em] text-blood">
            BLACK ICE LOCK · this vault will not post until Netwatch unfreezes it.
          </div>
        ) : null}
        {node.status === "KYC_HOLD" ? (
          <div className="mb-5 border border-ember bg-ember/10 px-4 py-3 font-mono text-[11px] tracking-[0.16em] text-ember">
            KYC HOLD · identity is in the queue. Holdings stay sealed.
          </div>
        ) : null}

        {tab === "overview" && (
          <div className="space-y-4">
            <div className="grid gap-4 lg:grid-cols-3">
              <div className="panel assemble p-5 lg:col-span-2">
                <Label>EDDIES AVAILABLE</Label>
                <p className="mt-2 font-display text-5xl font-semibold tabular md:text-6xl">
                  <Roll value={eddies} prefix="₡" />
                </p>
                <p className="mt-3 font-mono text-[10px] tracking-[0.18em] text-mute">
                  Posted book · SHA chain · {node.card.holder} · •••• {node.card.last}
                </p>
              </div>
              <div className="panel assemble p-5" style={{ animationDelay: "40ms" }}>
                <Label>CLEARANCE</Label>
                <p className="mt-2 font-display text-4xl font-semibold">{node.clearance}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Stamp tone={frozen ? "blood" : gated ? "ember" : "ice"}>{node.status}</Stamp>
                  <Stamp>{caseFile?.decision ?? "—"}</Stamp>
                </div>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="panel p-4">
                <Label>RISK</Label>
                <p className="mt-2 font-display text-3xl tabular">{node.riskScore}</p>
              </div>
              <div className="panel p-4">
                <Label>SECURITY</Label>
                <p className="mt-2 font-display text-3xl tabular text-ice">{node.security}</p>
                <div className="mt-2 h-1 bg-raised">
                  <div className="h-full bg-ice" style={{ width: `${node.security}%` }} />
                </div>
              </div>
              <div className="panel p-4">
                <Label>SUCCESSION</Label>
                <p className="mt-2 font-display text-xl">{node.successor.locked ? "LOCKED" : "OPEN"}</p>
                <p className="mt-1 font-mono text-[10px] text-mute">{node.successor.name}</p>
              </div>
            </div>
            <div className="panel p-5">
              <Label>LAST LINES</Label>
              <ul className="mt-3">
                {mine.slice(0, 5).map((l) => (
                  <LedgerRow key={l.id} line={l} onOpen={setOpenLine} />
                ))}
                {mine.length === 0 ? <li className="py-6 text-sm text-mute">No posted lines yet.</li> : null}
              </ul>
            </div>
          </div>
        )}

        {tab === "holdings" && (
          <div>
            <Label>MULTI-CURRENCY BOOKS</Label>
            <p className="mt-1 text-sm text-mute">Each vault is its own book. Eddies are the operating currency.</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {node.vaults.length === 0 ? (
                <p className="text-sm text-mute">No vaults until KYC clears.</p>
              ) : (
                node.vaults.map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => {
                      setVaultId(v.id);
                      setTab("ledger");
                    }}
                    className="vault-chip border border-line p-5 text-left"
                  >
                    <p className="font-mono text-[10px] tracking-[0.2em] text-mute">
                      {v.label} · {v.code}
                    </p>
                    <p className={cn("mt-2 font-display text-3xl font-semibold tabular", vaultTone[v.color])}>
                      {v.prefix}
                      {v.id === "ed" ? formatEddie(vaultBalance(ledger, node.id, "ed")) : v.amount.toLocaleString()}
                    </p>
                    <p className="mt-2 font-mono text-[10px] text-mute">HOLD {v.hold ?? 0}</p>
                  </button>
                ))
              )}
            </div>
          </div>
        )}

        {tab === "move" && (
          <form onSubmit={startMove} className="panel p-6">
            <Label>MOVE MONEY</Label>
            <h2 className="mt-2 font-display text-3xl font-semibold">Send from this vault.</h2>
            <p className="mt-2 text-sm text-mute">
              Internal Arasaka emails credit the other book. Anything else posts as a wire out. Biometric hold is required.
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <label className="font-mono text-[10px] tracking-[0.2em] text-mute">
                FROM VAULT
                <select
                  className="mt-2 min-h-11 w-full border border-line bg-ink px-3 font-mono text-sm text-fg"
                  value={vaultId}
                  onChange={(e) => setVaultId(e.target.value)}
                >
                  {node.vaults.filter((v) => v.id === "ed").map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="font-mono text-[10px] tracking-[0.2em] text-mute">
                BENEFICIARY
                <select
                  className="mt-2 min-h-11 w-full border border-line bg-ink px-3 font-mono text-sm text-fg"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                >
                  {mineBene.map((b) => (
                    <option key={b.id} value={b.email}>
                      {b.nickname} · {b.email}
                    </option>
                  ))}
                  <option value="afterlife@nightcity.bar">Afterlife · external</option>
                </select>
              </label>
              <label className="font-mono text-[10px] tracking-[0.2em] text-mute">
                AMOUNT ₡
                <input
                  className="mt-2 min-h-11 w-full border border-line bg-ink px-3 font-mono text-sm text-fg outline-none focus:border-blood"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </label>
              <label className="font-mono text-[10px] tracking-[0.2em] text-mute">
                MEMO
                <input
                  className="mt-2 min-h-11 w-full border border-line bg-ink px-3 font-mono text-sm text-fg outline-none focus:border-blood"
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                />
              </label>
            </div>
            {pendingId ? (
              <div className="mt-6">
                <div className="flex justify-between font-mono text-[10px] tracking-[0.2em] text-ice">
                  <span>BIOMETRIC CONFIRM</span>
                  <span>{hold}%</span>
                </div>
                <div className="mt-2 h-1 bg-raised">
                  <div className="hold-bar h-full origin-left bg-ice" style={{ width: `${hold}%` }} />
                </div>
              </div>
            ) : null}
            {msg ? <p className="mt-4 font-mono text-[11px] tracking-[0.12em] text-ice">{msg}</p> : null}
            <button
              type="submit"
              disabled={gated || !!pendingId}
              className="magnet bracket-btn neon-blood mt-8 min-h-12 bg-blood px-8 font-display tracking-[0.28em] disabled:opacity-50"
              {...magnetProps(8)}
            >
              {pendingId ? "HOLDING…" : "SEND"}
            </button>
          </form>
        )}

        {tab === "ledger" && (
          <div className="panel p-5">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <Label>PERSONAL LEDGER</Label>
                <p className="mt-1 text-sm text-mute">Debit and credit. Running eddies from posted lines only.</p>
              </div>
              <input
                className="min-h-11 w-full max-w-xs border border-line bg-ink px-3 font-mono text-xs outline-none focus:border-ice"
                placeholder="filter memo / party / kind"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              />
            </div>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[720px] text-left font-mono text-[11px] tracking-[0.06em]">
                <thead className="text-mute">
                  <tr className="border-b border-line">
                    <th className="py-2 font-medium">TIME</th>
                    <th className="font-medium">KIND</th>
                    <th className="font-medium">PARTY</th>
                    <th className="font-medium">DEBIT</th>
                    <th className="font-medium">CREDIT</th>
                    <th className="font-medium">STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((l) => (
                    <tr
                      key={l.id}
                      className="ledger-row cursor-pointer border-b border-line/70 hover:bg-raised"
                      onClick={() => setOpenLine(l)}
                    >
                      <td className="py-3 text-mute">{l.at}</td>
                      <td>{l.kind}</td>
                      <td>{l.counterparty}</td>
                      <td className="tabular text-blood">{l.side === "DR" ? `₡${formatEddie(l.amount)}` : ""}</td>
                      <td className="tabular text-ice">{l.side === "CR" ? `₡${formatEddie(l.amount)}` : ""}</td>
                      <td className={l.status === "PENDING" ? "text-ember" : "text-mute"}>{l.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === "kyc" && (
          <div className="panel p-6">
            <Label>IDENTITY FILE</Label>
            <h2 className="mt-2 font-display text-3xl font-semibold">Know your client.</h2>
            <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-5">
              {KYC_STAGES.map((s, i) => {
                const order = KYC_STAGES.findIndex((x) => x.id === (caseFile?.stage ?? "INTAKE"));
                const on = i <= order;
                return (
                  <div key={s.id} className={cn("border-t-2 pt-2 font-mono text-[10px] tracking-[0.16em]", on ? "border-blood text-fg" : "border-line text-mute")}>
                    {s.no} / {s.label}
                  </div>
                );
              })}
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              <Stamp tone={statusTone(node.status) === "text-blood" ? "blood" : gated ? "ember" : "ice"}>{node.status}</Stamp>
              <Stamp>{caseFile?.decision ?? "—"}</Stamp>
              <Stamp>RISK {node.riskScore}</Stamp>
            </div>
            <ul className="mt-6 space-y-2">
              {(caseFile?.docs ?? node.docs).map((d) => (
                <li key={d.kind} className="flex items-center justify-between border border-line px-4 py-3">
                  <span className="font-mono text-[11px] tracking-[0.14em]">{d.kind}</span>
                  <Stamp tone={d.status === "RECEIVED" ? "ice" : d.status === "REVIEW" ? "ember" : "blood"}>{d.status}</Stamp>
                </li>
              ))}
            </ul>
            <div className="mt-6 space-y-1 font-mono text-[11px] text-mute">
              {(caseFile?.notes ?? []).map((n) => (
                <p key={n}>▸ {n}</p>
              ))}
            </div>
          </div>
        )}

        {tab === "succession" && (
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="panel p-6">
              <Label>NAMED HEIR</Label>
              <p className="mt-2 font-display text-3xl">{node.successor.name}</p>
              <p className="mt-1 font-mono text-[11px] tracking-[0.16em] text-mute">
                {node.successor.relation} · {node.successor.locked ? "LOCKED" : "UNLOCKED"}
              </p>
              <div className="mt-6 grid gap-3">
                <input className="min-h-11 border border-line bg-ink px-3 font-mono text-sm" placeholder="heir name" value={heir} onChange={(e) => setHeir(e.target.value)} />
                <input className="min-h-11 border border-line bg-ink px-3 font-mono text-sm" placeholder="relation" value={rel} onChange={(e) => setRel(e.target.value)} />
                <button
                  type="button"
                  className="min-h-11 border border-line font-mono text-[10px] tracking-[0.2em] hover:border-ice"
                  onClick={() => heir.trim() && setSuccessor(heir.trim(), rel)}
                >
                  LOCK SUCCESSION
                </button>
              </div>
            </div>
            <div className="panel p-6">
              <Label>BENEFICIARIES</Label>
              <ul className="mt-4 space-y-2">
                {mineBene.map((b) => (
                  <li key={b.id} className="flex justify-between border-b border-line py-2 font-mono text-[11px]">
                    <span>{b.nickname}</span>
                    <span className="text-mute">{b.email}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-6 grid gap-3">
                <input className="min-h-11 border border-line bg-ink px-3 font-mono text-sm" placeholder="name" value={bnName} onChange={(e) => setBnName(e.target.value)} />
                <input className="min-h-11 border border-line bg-ink px-3 font-mono text-sm" placeholder="email" value={bnEmail} onChange={(e) => setBnEmail(e.target.value)} />
                <button
                  type="button"
                  className="min-h-11 border border-line font-mono text-[10px] tracking-[0.2em]"
                  onClick={() => {
                    if (!bnName || !bnEmail.includes("@")) return;
                    addBeneficiary(bnName, bnEmail, bnName);
                    setBnName("");
                    setBnEmail("");
                  }}
                >
                  ADD PAYEE
                </button>
              </div>
            </div>
          </div>
        )}
      </ConsoleShell>

      {openLine ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/80 p-4" onClick={() => setOpenLine(null)}>
          <div className="assemble panel w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <Label>RECEIPT</Label>
            <p className="mt-2 font-display text-2xl">{openLine.kind}</p>
            <p className="mt-4 font-mono text-[11px] leading-6 tracking-[0.08em] text-mute">
              {openLine.id}
              <br />
              {openLine.iso}
              <br />
              {openLine.side} ₡{formatEddie(openLine.amount)}
              <br />
              {openLine.counterparty}
              <br />
              {openLine.memo}
              <br />
              HASH {openLine.hash}
              <br />
              PREV {openLine.prevHash}
            </p>
            <button type="button" className="mt-6 min-h-11 w-full border border-line font-mono text-[10px] tracking-[0.2em]" onClick={() => setOpenLine(null)}>
              CLOSE
            </button>
          </div>
        </div>
      ) : null}
      <JavaChat role="client" />
    </>
  );
}

function LedgerRow({ line, onOpen }: { line: LedgerLine; onOpen: (l: LedgerLine) => void }) {
  return (
    <li
      className="ledger-row flex cursor-pointer justify-between border-b border-line/70 py-2 font-mono text-[11px] tracking-[0.08em]"
      onClick={() => onOpen(line)}
    >
      <span className="text-mute">
        {line.at} · {line.kind} · {line.counterparty}
      </span>
      <span className={line.side === "DR" ? "text-blood" : "text-ice"}>
        {line.side === "DR" ? "−" : "+"}₡{formatEddie(line.amount)}
      </span>
    </li>
  );
}
