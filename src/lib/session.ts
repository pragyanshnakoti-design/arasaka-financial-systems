import { create } from "zustand";
import { persist } from "zustand/middleware";
import { SEED_THREATS, type NodeStatus, type ThreatLevel, type Vault } from "./data";
import {
  BANK_NODES,
  GENESIS,
  SEED_BENE,
  SEED_KYC,
  SEED_LEDGER,
  lineHash,
  stampClock,
  stampIso,
  uid,
  vaultBalance,
  verifyChain,
  type AccountStatus,
  type BankNode,
  type Beneficiary,
  type KycCase,
  type LedgerKind,
  type LedgerLine,
  type LedgerSide,
} from "./bank";

export type AuditLine = { id: string; at: string; text: string };

export type LedgerTx = {
  id: string;
  at: string;
  to: string;
  amount: number;
  memo: string;
};

type SessionState = {
  node: BankNode | null;
  nodes: BankNode[];
  ledger: LedgerLine[];
  kyc: KycCase[];
  beneficiaries: Beneficiary[];
  threats: typeof SEED_THREATS;
  audit: AuditLine[];
  txs: LedgerTx[];
  bootDone: boolean;
  signIn: (email: string, token: string) => { ok: true } | { ok: false; reason: string };
  signOut: () => void;
  freeze: (id: string, reason: string) => void;
  unfreeze: (id: string) => void;
  transfer: (
    to: string,
    amount: number,
    memo: string,
    vaultId?: string,
  ) => { ok: true; pendingId: string } | { ok: false; reason: string };
  confirmPending: (id: string) => { ok: true } | { ok: false; reason: string };
  enroll: (name: string, email: string, token: string) => { ok: true } | { ok: false; reason: string };
  clearKyc: (id: string, note: string) => void;
  rejectKyc: (id: string, note: string) => void;
  setSuccessor: (name: string, relation: string) => void;
  addBeneficiary: (name: string, email: string, nickname: string) => void;
  ledgerOk: () => { ok: boolean; brokenAt?: string };
  setBootDone: () => void;
};

function lastHash(ledger: LedgerLine[]): string {
  const posted = ledger.filter((l) => l.status === "POSTED" || l.status === "REVERSED");
  return posted.at(-1)?.hash ?? GENESIS;
}

function syncEddies(node: BankNode, ledger: LedgerLine[]): BankNode {
  if (node.role !== "client") return node;
  if (node.status === "KYC_HOLD" || node.status === "APPLICANT") {
    return { ...node, balance: 0, vaults: node.vaults };
  }
  const ed = vaultBalance(ledger, node.id, "ed");
  const vaults = node.vaults.map((v) => (v.id === "ed" ? { ...v, amount: ed } : v));
  if (!vaults.some((v) => v.id === "ed") && ed > 0) {
    vaults.unshift({ id: "ed", label: "EDDIES", code: "VAULT 0", amount: ed, prefix: "₡", color: "fg", hold: 0 });
  }
  return { ...node, balance: ed, vaults };
}

function syncAll(nodes: BankNode[], ledger: LedgerLine[], current: BankNode | null): { nodes: BankNode[]; node: BankNode | null } {
  const next = nodes.map((n) => syncEddies(n, ledger));
  const node = current ? next.find((n) => n.id === current.id) ?? null : null;
  return { nodes: next, node };
}

function appendAudit(audit: AuditLine[], text: string) {
  return [{ id: uid("AUD"), at: stampClock(), text }, ...audit].slice(0, 60);
}

function makeLine(partial: {
  accountId: string;
  vaultId: string;
  side: LedgerSide;
  amount: number;
  kind: LedgerKind;
  counterparty: string;
  memo: string;
  status?: LedgerLine["status"];
  prev: string;
}): LedgerLine {
  const now = new Date();
  const base = {
    id: uid("TX"),
    at: stampClock(now),
    iso: stampIso(now),
    accountId: partial.accountId,
    vaultId: partial.vaultId,
    side: partial.side,
    amount: partial.amount,
    currency: "EDDIES",
    memo: partial.memo,
    counterparty: partial.counterparty,
    kind: partial.kind,
    status: partial.status ?? "POSTED",
    prevHash: partial.prev,
    hash: "",
  };
  return { ...base, hash: lineHash(partial.prev, base) };
}

export const useSession = create<SessionState>()(
  persist(
    (set, get) => ({
      node: null,
      nodes: BANK_NODES,
      ledger: SEED_LEDGER,
      kyc: SEED_KYC,
      beneficiaries: SEED_BENE,
      threats: SEED_THREATS,
      audit: [{ id: "a0", at: "18:01:00", text: "SYSTEM READY. FIVE CLIENT NODES + COMMAND SEEDED." }],
      txs: [],
      bootDone: false,
      setBootDone: () => set({ bootDone: true }),
      signIn: (email, token) => {
        const e = email.trim().toLowerCase();
        const n = get().nodes.find((x) => x.email === e);
        if (!n) return { ok: false, reason: "Account not found." };
        if (n.token !== token) return { ok: false, reason: "Wrong password." };
        set({
          node: n,
          audit: appendAudit(get().audit, `SIGNED IN // ${n.id} // ${n.email} // ${n.status}`),
        });
        return { ok: true };
      },
      signOut: () => set({ node: null }),
      freeze: (id, reason) => {
        const nodes = get().nodes.map((n) =>
          n.id === id ? { ...n, status: "FROZEN" as AccountStatus } : n,
        );
        const node = get().node?.id === id ? { ...get().node!, status: "FROZEN" as NodeStatus } : get().node;
        set({
          nodes,
          node,
          threats: [
            {
              id: uid("TH"),
              level: "CRITICAL" as ThreatLevel,
              code: "ACCOUNT FROZEN",
              detail: reason || "Operator freeze.",
              node: id,
              at: stampClock(),
            },
            ...get().threats,
          ].slice(0, 24),
          audit: appendAudit(get().audit, `FROZE ${id} — ${reason}`),
        });
      },
      unfreeze: (id) => {
        const nodes = get().nodes.map((n) =>
          n.id === id ? { ...n, status: "ACTIVE" as AccountStatus } : n,
        );
        const node = get().node?.id === id ? { ...get().node!, status: "ACTIVE" as NodeStatus } : get().node;
        set({
          nodes,
          node,
          audit: appendAudit(get().audit, `UNFROZE ${id}`),
        });
      },
      transfer: (to, amount, memo, vaultId = "ed") => {
        const me = get().node;
        if (!me || me.role !== "client") return { ok: false, reason: "Sign in as a client first." };
        if (me.status === "FROZEN") return { ok: false, reason: "This account is frozen." };
        if (me.status === "KYC_HOLD" || me.status === "APPLICANT") {
          return { ok: false, reason: "Vault closed until Netwatch clears KYC." };
        }
        if (me.status !== "ACTIVE") return { ok: false, reason: "Account is not active." };
        if (amount <= 0) return { ok: false, reason: "Enter a valid amount." };
        const available = vaultBalance(get().ledger, me.id, vaultId);
        if (amount > available) return { ok: false, reason: "Not enough funds in this vault." };
        const dest = get().nodes.find((n) => n.email === to.trim().toLowerCase() && n.role === "client");
        const pending = makeLine({
          accountId: me.id,
          vaultId,
          side: "DR",
          amount,
          kind: dest ? "DEBIT" : "WIRE_OUT",
          counterparty: dest?.email ?? to.trim().toLowerCase(),
          memo: memo || "Client transfer",
          status: "PENDING",
          prev: lastHash(get().ledger),
        });
        set({ ledger: [...get().ledger, pending] });
        return { ok: true, pendingId: pending.id };
      },
      confirmPending: (id) => {
        const me = get().node;
        const line = get().ledger.find((l) => l.id === id);
        if (!me || !line || line.status !== "PENDING") return { ok: false, reason: "Nothing to confirm." };
        const prev = lastHash(get().ledger.filter((l) => l.id !== id));
        const posted: LedgerLine = { ...line, status: "POSTED", prevHash: prev, at: stampClock(), iso: stampIso() };
        posted.hash = lineHash(prev, posted);
        let ledger = get().ledger.map((l) => (l.id === id ? posted : l));
        const peer = get().nodes.find((n) => n.email === line.counterparty.toLowerCase());
        if (peer && peer.id !== me.id && peer.status === "ACTIVE") {
          const cr = makeLine({
            accountId: peer.id,
            vaultId: "ed",
            side: "CR",
            amount: line.amount,
            kind: "WIRE_IN",
            counterparty: me.name,
            memo: line.memo,
            prev: lastHash(ledger),
          });
          ledger = [...ledger, cr];
        }
        const synced = syncAll(get().nodes, ledger, me);
        set({
          ...synced,
          ledger,
          txs: [
            { id: posted.id, at: posted.at, to: line.counterparty, amount: line.amount, memo: line.memo },
            ...get().txs,
          ].slice(0, 40),
          audit: appendAudit(get().audit, `POSTED ${line.amount.toFixed(2)} → ${line.counterparty} // ${me.id}`),
        });
        return { ok: true };
      },
      enroll: (name, email, token) => {
        const e = email.trim().toLowerCase();
        if (get().nodes.some((n) => n.email === e)) return { ok: false, reason: "That email is already registered." };
        if (token.length < 6) return { ok: false, reason: "Password must be at least 6 characters." };
        const rec: BankNode = {
          id: uid("NX"),
          name: name.trim() || "New client",
          email: e,
          clearance: "T3",
          status: "KYC_HOLD",
          balance: 0,
          token,
          role: "client",
          card: { holder: name.trim().toUpperCase() || "CLIENT", last: "HOLD", exp: "12/2078" },
          security: 54,
          vaults: [],
          kycStage: "RISK",
          riskScore: 38 + Math.floor(Math.random() * 20),
          openedAt: new Date().toISOString().slice(0, 10),
          successor: { name: "—", relation: "Unnamed", locked: false },
          docs: [
            { kind: "NIGHT CITY ID", status: "RECEIVED" },
            { kind: "PROOF OF RESIDENCE", status: "RECEIVED" },
            { kind: "BIOMETRIC HASH", status: "RECEIVED" },
          ],
        };
        const kyc: KycCase = {
          id: uid("KYC"),
          nodeId: rec.id,
          stage: "RISK",
          biometric: true,
          riskScore: rec.riskScore,
          decision: "HOLD",
          notes: ["Intake complete. Waiting on Netwatch clearance."],
          docs: rec.docs,
        };
        set({
          nodes: [...get().nodes, rec],
          kyc: [kyc, ...get().kyc],
          node: rec,
          audit: appendAudit(get().audit, `KYC HOLD // ${rec.id} // ${rec.email}`),
        });
        return { ok: true };
      },
      clearKyc: (id, note) => {
        const target = get().nodes.find((n) => n.id === id);
        if (!target) return;
        const opening = makeLine({
          accountId: id,
          vaultId: "ed",
          side: "CR",
          amount: 25000,
          kind: "OPENING",
          counterparty: "ARASAKA TREASURY",
          memo: "KYC cleared · T3 vault opened",
          prev: lastHash(get().ledger),
        });
        const vault: Vault = { id: "ed", label: "EDDIES", code: "VAULT 0", amount: 25000, prefix: "₡", color: "fg", hold: 0 };
        const nodes = get().nodes.map((n) =>
          n.id === id
            ? {
                ...n,
                status: "ACTIVE" as AccountStatus,
                kycStage: "CLEARANCE" as const,
                clearance: (n.clearance === "T0" ? "T0" : "T3") as BankNode["clearance"],
                vaults: n.vaults.some((v) => v.id === "ed") ? n.vaults : [vault, ...n.vaults],
                card: { ...n.card, last: n.id.slice(-4) },
              }
            : n,
        );
        const ledger = [...get().ledger, opening];
        const synced = syncAll(nodes, ledger, get().node);
        set({
          ...synced,
          ledger,
          kyc: get().kyc.map((k) =>
            k.nodeId === id
              ? {
                  ...k,
                  stage: "CLEARANCE",
                  decision: "CLEARED",
                  notes: [...k.notes, note || "Cleared by Netwatch. T3 vault live."],
                }
              : k,
          ),
          audit: appendAudit(get().audit, `KYC CLEARED // ${id} // T3 · ${note}`),
        });
      },
      rejectKyc: (id, note) => {
        set({
          nodes: get().nodes.map((n) => (n.id === id ? { ...n, status: "SEALED" as AccountStatus } : n)),
          node: get().node?.id === id ? { ...get().node!, status: "SEALED" } : get().node,
          kyc: get().kyc.map((k) =>
            k.nodeId === id
              ? { ...k, decision: "REJECTED", notes: [...k.notes, note || "Rejected."] }
              : k,
          ),
          audit: appendAudit(get().audit, `KYC REJECTED // ${id} — ${note}`),
        });
      },
      setSuccessor: (name, relation) => {
        const me = get().node;
        if (!me) return;
        const next = { ...me, successor: { name, relation, locked: true } };
        set({
          node: next,
          nodes: get().nodes.map((n) => (n.id === me.id ? next : n)),
          audit: appendAudit(get().audit, `SUCCESSION LOCK // ${me.id} → ${name}`),
        });
      },
      addBeneficiary: (name, email, nickname) => {
        const me = get().node;
        if (!me) return;
        set({
          beneficiaries: [
            { id: uid("BN"), ownerId: me.id, name, email: email.trim().toLowerCase(), nickname, approved: true },
            ...get().beneficiaries,
          ],
        });
      },
      ledgerOk: () => verifyChain(get().ledger),
    }),
    {
      name: "arasaka-bank-v2",
      partialize: (s) => ({
        nodes: s.nodes,
        node: s.node,
        threats: s.threats,
        audit: s.audit,
        txs: s.txs,
        ledger: s.ledger,
        kyc: s.kyc,
        beneficiaries: s.beneficiaries,
      }),
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<SessionState>;
        const nodes = (p.nodes?.length ?? 0) >= BANK_NODES.length ? p.nodes! : BANK_NODES;
        const have = new Set(nodes.map((n) => n.email));
        const merged = [...nodes];
        for (const seed of BANK_NODES) {
          if (!have.has(seed.email)) merged.push(seed);
        }
        const ledger = p.ledger && p.ledger.length >= SEED_LEDGER.length ? p.ledger : SEED_LEDGER;
        const kyc = p.kyc && p.kyc.length >= SEED_KYC.length ? p.kyc : SEED_KYC;
        const beneficiaries = p.beneficiaries && p.beneficiaries.length ? p.beneficiaries : SEED_BENE;
        return {
          ...current,
          ...p,
          nodes: merged,
          ledger,
          kyc,
          beneficiaries,
        };
      },
    },
  ),
);

export { DEMO_TOKEN } from "./data";
