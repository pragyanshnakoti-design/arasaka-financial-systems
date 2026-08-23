import { useMemo, useState, type FormEvent } from "react";
import { askJava } from "@/lib/java";
import { formatEddie } from "@/lib/data";
import { useSession } from "@/lib/session";
import { vaultBalance } from "@/lib/bank";
import { cn } from "@/lib/cn";
import { Label } from "./chrome";

type Msg = { id: string; who: "you" | "java"; text: string };

function localReply(prompt: string, ctx: string, role: "client" | "admin"): string {
  const p = prompt.toLowerCase();
  if (p.includes("balance") || p.includes("eddie") || p.includes("how much")) {
    const m = ctx.match(/EDDIES: ([0-9.]+)/);
    return m ? `EDDIES vault holds ₡${Number(m[1]).toLocaleString("en-US", { minimumFractionDigits: 2 })}. Other vaults stay on their own books.` : "I cannot read a live balance from this session.";
  }
  if (p.includes("kyc") || p.includes("clearance") || p.includes("identity")) {
    if (ctx.includes("KYC_HOLD")) return "Your file is on hold. Netwatch still has to clear you. The vault will not move money until then.";
    if (ctx.includes("FROZEN")) return "Identity is cleared, but Black ICE has frozen the account. Transfers stay dead until an operator unfreezes you.";
    return "KYC is cleared. You can move money from an active vault, subject to biometric confirm.";
  }
  if (p.includes("freeze") || p.includes("black ice")) {
    return role === "admin"
      ? "Open Clients, choose a node, confirm freeze. Dual-step. It writes a CRITICAL threat and blocks new posts."
      : "A freeze is a Netwatch lock. You can still read the ledger. You cannot post. Ask command to unfreeze.";
  }
  if (p.includes("ledger") || p.includes("debit") || p.includes("credit") || p.includes("statement")) {
    return "Every movement is a debit or a credit. Balance is the sum of posted lines, never a naked number. Click a line for its hash.";
  }
  if (p.includes("transfer") || p.includes("send") || p.includes("move")) {
    return "Move money: pick vault, beneficiary or email, amount, memo. Hold biometric for three seconds. The book posts a debit, and a credit if the destination is another Arasaka node.";
  }
  if (p.includes("judy") || p.includes("queue") || p.includes("who")) {
    return role === "admin"
      ? "Judy Alvarez sits in the KYC queue. Kerry Eurodyne is frozen. V, Jackie, and Panam are live."
      : "I can speak to your vault. For other nodes, Netwatch holds the file.";
  }
  if (p.includes("help") || p.includes("what can")) {
    return "Ask me about balance, ledger, KYC, freeze, or how to send eddies. I am J.A.V.A. — Joint Arasaka Vault Assistant. Fictional demo. No real money.";
  }
  return "I read the vault, not the street. Try: balance, last debit, KYC status, or how to freeze.";
}

export function JavaChat({ role }: { role: "client" | "admin" }) {
  const node = useSession((s) => s.node);
  const ledger = useSession((s) => s.ledger);
  const nodes = useSession((s) => s.nodes);
  const kyc = useSession((s) => s.kyc);
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([
    {
      id: "m0",
      who: "java",
      text:
        role === "admin"
          ? "J.A.V.A. online. Command desk. Ask about the queue, freezes, or ledger integrity."
          : "J.A.V.A. online. Joint Arasaka Vault Assistant. Ask about your balance, KYC, or a transfer.",
    },
  ]);

  const context = useMemo(() => {
    if (!node) return "";
    const ed = vaultBalance(ledger, node.id, "ed");
    const hold = kyc.filter((k) => k.decision === "HOLD").length;
    const frozen = nodes.filter((n) => n.status === "FROZEN").length;
    return [
      `NAME: ${node.name}`,
      `ID: ${node.id}`,
      `ROLE: ${node.role}`,
      `STATUS: ${node.status}`,
      `CLEARANCE: ${node.clearance}`,
      `EDDIES: ${ed}`,
      `KYC_HOLD_QUEUE: ${hold}`,
      `FROZEN: ${frozen}`,
      `AUM: ${nodes.filter((n) => n.role === "client").reduce((s, n) => s + n.balance, 0)}`,
    ].join("\n");
  }, [node, ledger, nodes, kyc]);

  async function send(e: FormEvent) {
    e.preventDefault();
    const q = input.trim();
    if (!q || busy) return;
    setInput("");
    const you: Msg = { id: `y-${Date.now()}`, who: "you", text: q };
    setMsgs((m) => [...m, you]);
    setBusy(true);
    let text = localReply(q, context, role);
    try {
      const r = await askJava({ data: { prompt: q, context, role } });
      if (r.ok && r.text.trim()) text = r.text.trim();
    } catch {
      /* local fallback */
    }
    setMsgs((m) => [...m, { id: `j-${Date.now()}`, who: "java", text }]);
    setBusy(false);
  }

  return (
    <>
      <button
        type="button"
        className="java-fab magnet neon-ice fixed bottom-4 left-4 z-30 min-h-12 border border-ice bg-ink px-4 font-mono text-[10px] tracking-[0.22em] text-ice md:left-auto md:right-6"
        onClick={() => setOpen((v) => !v)}
      >
        {open ? "CLOSE J.A.V.A." : "J.A.V.A."}
      </button>
      {open ? (
        <div className="assemble panel fixed bottom-20 left-4 z-30 flex h-[min(420px,70dvh)] w-[min(380px,calc(100vw-2rem))] flex-col overflow-hidden md:left-auto md:right-6">
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <div>
              <Label>JOINT ARASAKA VAULT ASSISTANT</Label>
              <p className="font-display text-lg font-semibold">J.A.V.A.</p>
            </div>
            <span className="size-2 bg-ice" style={{ animation: "rec-blink 1.4s steps(1) infinite" }} />
          </div>
          <ul className="flex-1 space-y-3 overflow-auto px-4 py-3">
            {msgs.map((m) => (
              <li key={m.id} className={cn("text-sm", m.who === "java" ? "text-fg" : "text-ice")}>
                <p className="font-mono text-[9px] tracking-[0.2em] text-mute">{m.who === "java" ? "J.A.V.A." : "YOU"}</p>
                <p className="mt-1 leading-relaxed">{m.text}</p>
              </li>
            ))}
            {busy ? <li className="font-mono text-[10px] tracking-[0.2em] text-mute">READING VAULT…</li> : null}
          </ul>
          <form onSubmit={send} className="flex gap-2 border-t border-line p-3">
            <input
              className="min-h-11 flex-1 border border-line bg-ink px-3 font-mono text-xs text-fg outline-none focus:border-ice"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask the vault…"
            />
            <button type="submit" className="min-h-11 bg-blood px-4 font-mono text-[10px] tracking-[0.18em]" disabled={busy}>
              ASK
            </button>
          </form>
          {node ? (
            <p className="px-3 pb-2 font-mono text-[9px] tracking-[0.14em] text-mute">
              {node.email} · ₡{formatEddie(node.balance)}
            </p>
          ) : null}
        </div>
      ) : null}
    </>
  );
}
