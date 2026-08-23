import type { Clearance, NodeRecord, Vault } from "./data";
import { DEMO_TOKEN } from "./data";

export type AccountStatus = "APPLICANT" | "KYC_HOLD" | "ACTIVE" | "FROZEN" | "SEALED";
export type KycStage = "INTAKE" | "BIOMETRIC" | "DOCUMENTS" | "RISK" | "CLEARANCE";
export type LedgerSide = "DR" | "CR";
export type LedgerStatus = "PENDING" | "POSTED" | "REJECTED" | "REVERSED";
export type LedgerKind =
  | "OPENING"
  | "CREDIT"
  | "DEBIT"
  | "WIRE_IN"
  | "WIRE_OUT"
  | "FEE"
  | "INTEREST"
  | "REVERSE";

export type LedgerLine = {
  id: string;
  at: string;
  iso: string;
  accountId: string;
  vaultId: string;
  side: LedgerSide;
  amount: number;
  currency: string;
  memo: string;
  counterparty: string;
  kind: LedgerKind;
  status: LedgerStatus;
  prevHash: string;
  hash: string;
};

export type KycCase = {
  id: string;
  nodeId: string;
  stage: KycStage;
  biometric: boolean;
  riskScore: number;
  decision: "PENDING" | "CLEARED" | "HOLD" | "REJECTED";
  notes: string[];
  docs: { kind: string; status: "RECEIVED" | "MISSING" | "REVIEW" }[];
};

export type Beneficiary = {
  id: string;
  ownerId: string;
  name: string;
  email: string;
  nickname: string;
  approved: boolean;
};

export type BankNode = NodeRecord & {
  status: AccountStatus;
  kycStage: KycStage;
  riskScore: number;
  openedAt: string;
  successor: { name: string; relation: string; locked: boolean };
  docs: { kind: string; status: "RECEIVED" | "MISSING" | "REVIEW" }[];
};

export const GENESIS = "0000000000000000";

export function demoHash(s: string): string {
  let h1 = 0x811c9dc5;
  let h2 = 0x01000193;
  for (let i = 0; i < s.length; i++) {
    h1 ^= s.charCodeAt(i);
    h1 = Math.imul(h1, 0x01000193);
    h2 ^= s.charCodeAt(i) + i * 13;
    h2 = Math.imul(h2, 16777619);
  }
  return (h1 >>> 0).toString(16).padStart(8, "0") + (h2 >>> 0).toString(16).padStart(8, "0");
}

export function lineHash(prev: string, line: Omit<LedgerLine, "hash">): string {
  return demoHash(
    [prev, line.accountId, line.vaultId, line.side, line.amount.toFixed(4), line.iso, line.kind, line.memo, line.counterparty].join("|"),
  );
}

export function chainLines(drafts: Omit<LedgerLine, "prevHash" | "hash">[]): LedgerLine[] {
  let prev = GENESIS;
  return drafts.map((d) => {
    const withPrev = { ...d, prevHash: prev };
    const hash = lineHash(prev, withPrev);
    prev = hash;
    return { ...withPrev, hash };
  });
}

export function verifyChain(lines: LedgerLine[]): { ok: boolean; brokenAt?: string } {
  const posted = lines.filter((l) => l.status === "POSTED" || l.status === "REVERSED");
  let prev = GENESIS;
  for (const line of posted) {
    if (line.prevHash !== prev) return { ok: false, brokenAt: line.id };
    const expect = lineHash(prev, { ...line, prevHash: prev });
    if (expect !== line.hash) return { ok: false, brokenAt: line.id };
    prev = line.hash;
  }
  return { ok: true };
}

export function vaultBalance(lines: LedgerLine[], accountId: string, vaultId: string): number {
  return lines
    .filter((l) => l.accountId === accountId && l.vaultId === vaultId && l.status === "POSTED")
    .reduce((sum, l) => sum + (l.side === "CR" ? l.amount : -l.amount), 0);
}

export function eddiesOf(node: BankNode, lines: LedgerLine[]): number {
  const fromBook = vaultBalance(lines, node.id, "ed");
  if (lines.some((l) => l.accountId === node.id && l.vaultId === "ed" && l.status === "POSTED")) return fromBook;
  return node.balance;
}

function v(
  id: string,
  label: string,
  code: string,
  amount: number,
  prefix: string,
  color: Vault["color"],
  hold = 0,
): Vault & { hold: number } {
  return { id, label, code, amount, prefix, color, hold };
}

const DOCS_CLEAR = [
  { kind: "NIGHT CITY ID", status: "RECEIVED" as const },
  { kind: "PROOF OF RESIDENCE", status: "RECEIVED" as const },
  { kind: "BIOMETRIC HASH", status: "RECEIVED" as const },
];

export const BANK_NODES: BankNode[] = [
  {
    id: "NX-77A3F2",
    name: "V Silverhand",
    email: "v@arasaka.net",
    clearance: "T2",
    status: "ACTIVE",
    balance: 142500,
    token: DEMO_TOKEN,
    role: "client",
    card: { holder: "V SILVERHAND", last: "A3F2", exp: "12/2077" },
    security: 98,
    kycStage: "CLEARANCE",
    riskScore: 18,
    openedAt: "2077-04-12",
    successor: { name: "Jackie Welles", relation: "Named heir", locked: true },
    docs: DOCS_CLEAR,
    vaults: [
      v("ed", "EDDIES", "VAULT 0", 142500, "₡", "fg"),
      v("usd", "USD", "VAULT 1", 18000, "$", "ice"),
      v("eur", "EUR", "VAULT 2", 14500, "€", "mute"),
      v("btc", "BTC", "VAULT 3", 0.35, "₿", "blood"),
      v("eth", "ETH", "VAULT 4", 4.2, "Ξ", "ice"),
    ],
  },
  {
    id: "NX-41JW88",
    name: "Jackie Welles",
    email: "jackie@arasaka.net",
    clearance: "T3",
    status: "ACTIVE",
    balance: 48200,
    token: DEMO_TOKEN,
    role: "client",
    card: { holder: "JACKIE WELLES", last: "JW88", exp: "08/2078" },
    security: 86,
    kycStage: "CLEARANCE",
    riskScore: 24,
    openedAt: "2077-05-02",
    successor: { name: "Mama Welles", relation: "Blood", locked: true },
    docs: DOCS_CLEAR,
    vaults: [
      v("ed", "EDDIES", "VAULT 0", 48200, "₡", "fg"),
      v("usd", "USD", "VAULT 1", 2400, "$", "ice"),
    ],
  },
  {
    id: "NX-90PP11",
    name: "Panam Palmer",
    email: "panam@arasaka.net",
    clearance: "T2",
    status: "ACTIVE",
    balance: 91000,
    token: DEMO_TOKEN,
    role: "client",
    card: { holder: "PANAM PALMER", last: "PP11", exp: "03/2079" },
    security: 91,
    kycStage: "CLEARANCE",
    riskScore: 31,
    openedAt: "2077-06-18",
    successor: { name: "Aldecaldos Nomad Fund", relation: "Clan", locked: true },
    docs: DOCS_CLEAR,
    vaults: [
      v("ed", "EDDIES", "VAULT 0", 91000, "₡", "fg"),
      v("usd", "USD", "VAULT 1", 6200, "$", "ice"),
      v("btc", "BTC", "VAULT 3", 0.08, "₿", "blood"),
    ],
  },
  {
    id: "NX-22JA09",
    name: "Judy Alvarez",
    email: "judy@arasaka.net",
    clearance: "T3",
    status: "KYC_HOLD",
    balance: 0,
    token: DEMO_TOKEN,
    role: "client",
    card: { holder: "JUDY ALVAREZ", last: "JA09", exp: "01/2079" },
    security: 62,
    kycStage: "RISK",
    riskScore: 44,
    openedAt: "2077-10-01",
    successor: { name: "—", relation: "Unnamed", locked: false },
    docs: [
      { kind: "NIGHT CITY ID", status: "RECEIVED" },
      { kind: "PROOF OF RESIDENCE", status: "REVIEW" },
      { kind: "BIOMETRIC HASH", status: "RECEIVED" },
    ],
    vaults: [],
  },
  {
    id: "NX-55RW02",
    name: "River Ward",
    email: "river@arasaka.net",
    clearance: "T3",
    status: "KYC_HOLD",
    balance: 0,
    token: DEMO_TOKEN,
    role: "client",
    card: { holder: "RIVER WARD", last: "RW02", exp: "06/2078" },
    security: 58,
    kycStage: "DOCUMENTS",
    riskScore: 29,
    openedAt: "2077-10-08",
    successor: { name: "—", relation: "Unnamed", locked: false },
    docs: [
      { kind: "NIGHT CITY ID", status: "RECEIVED" },
      { kind: "PROOF OF RESIDENCE", status: "MISSING" },
      { kind: "BIOMETRIC HASH", status: "RECEIVED" },
    ],
    vaults: [],
  },
  {
    id: "NX-07KE44",
    name: "Kerry Eurodyne",
    email: "kerry@arasaka.net",
    clearance: "T1",
    status: "FROZEN",
    balance: 620000,
    token: DEMO_TOKEN,
    role: "client",
    card: { holder: "KERRY EURODYNE", last: "KE44", exp: "11/2077" },
    security: 77,
    kycStage: "CLEARANCE",
    riskScore: 71,
    openedAt: "2076-11-20",
    successor: { name: "Us Cracks Trust", relation: "Estate", locked: true },
    docs: DOCS_CLEAR,
    vaults: [
      v("ed", "EDDIES", "VAULT 0", 620000, "₡", "fg", 620000),
      v("usd", "USD", "VAULT 1", 88000, "$", "ice"),
      v("eur", "EUR", "VAULT 2", 41000, "€", "mute"),
    ],
  },
  {
    id: "NX-00T0ADM",
    name: "Netwatch Operator",
    email: "admin@arasaka.net",
    clearance: "T0" as Clearance,
    status: "ACTIVE",
    balance: 0,
    token: DEMO_TOKEN,
    role: "admin",
    card: { holder: "OPERATOR T0", last: "0000", exp: "12/2077" },
    security: 100,
    kycStage: "CLEARANCE",
    riskScore: 0,
    openedAt: "2028-01-01",
    successor: { name: "Netwatch Continuity", relation: "Protocol", locked: true },
    docs: DOCS_CLEAR,
    vaults: [],
  },
];

function iso(d: string, t: string) {
  return `${d}T${t}Z`;
}

function draft(
  id: string,
  accountId: string,
  atDay: string,
  clock: string,
  side: LedgerSide,
  amount: number,
  kind: LedgerKind,
  counterparty: string,
  memo: string,
  vaultId = "ed",
  status: LedgerStatus = "POSTED",
): Omit<LedgerLine, "prevHash" | "hash"> {
  return {
    id,
    at: clock,
    iso: iso(atDay, clock),
    accountId,
    vaultId,
    side,
    amount,
    currency: "EDDIES",
    memo,
    counterparty,
    kind,
    status,
  };
}

const RAW_LEDGER: Omit<LedgerLine, "prevHash" | "hash">[] = [
  draft("TX-V-01", "NX-77A3F2", "2077-04-12", "09:00:11", "CR", 200000, "OPENING", "ARASAKA TREASURY", "Opening credit · T2 vault"),
  draft("TX-V-02", "NX-77A3F2", "2077-04-18", "21:14:02", "DR", 32000, "WIRE_OUT", "AFTERLIFE", "Tab · Afterlife private booth"),
  draft("TX-V-03", "NX-77A3F2", "2077-05-03", "16:41:55", "CR", 18500, "CREDIT", "FIXER · WAKAKO", "Gig payout · Watson"),
  draft("TX-V-04", "NX-77A3F2", "2077-05-11", "11:02:40", "DR", 12000, "DEBIT", "JACKIE WELLES", "Personal loan to Jackie"),
  draft("TX-V-05", "NX-77A3F2", "2077-06-02", "02:18:09", "CR", 8000, "CREDIT", "RIPPERDOC", "Relic salvage rebate"),
  draft("TX-V-06", "NX-77A3F2", "2077-06-20", "08:00:00", "DR", 15500, "FEE", "TRAUMA TEAM", "Gold retainer · Q3"),
  draft("TX-V-07", "NX-77A3F2", "2077-07-01", "14:22:17", "DR", 9000, "DEBIT", "NCPD", "Citation · later reversed"),
  draft("TX-V-08", "NX-77A3F2", "2077-07-04", "10:07:33", "CR", 9000, "REVERSE", "NCPD", "Reverse citation TX-V-07"),
  draft("TX-V-09", "NX-77A3F2", "2077-08-15", "19:48:01", "DR", 24500, "WIRE_OUT", "MEGABUILDING H10", "Megabuilding rent lock"),
  draft("TX-V-10", "NX-77A3F2", "2077-09-01", "00:00:12", "CR", 5000, "INTEREST", "ARASAKA TREASURY", "Sealed vault interest"),
  draft("TX-V-11", "NX-77A3F2", "2077-09-22", "13:11:44", "DR", 5000, "WIRE_OUT", "PANAM PALMER", "Nomad fuel float"),

  draft("TX-J-01", "NX-41JW88", "2077-05-02", "10:12:00", "CR", 50000, "OPENING", "ARASAKA TREASURY", "Opening credit · T3"),
  draft("TX-J-02", "NX-41JW88", "2077-05-11", "11:03:02", "CR", 12000, "WIRE_IN", "V SILVERHAND", "Loan received from V"),
  draft("TX-J-03", "NX-41JW88", "2077-05-20", "23:41:18", "DR", 9800, "DEBIT", "AFTERLIFE", "El Coyote + Afterlife"),
  draft("TX-J-04", "NX-41JW88", "2077-06-08", "07:15:40", "DR", 4000, "FEE", "TRAUMA TEAM", "Silver cover"),

  draft("TX-P-01", "NX-90PP11", "2077-06-18", "15:00:00", "CR", 88000, "OPENING", "ARASAKA TREASURY", "Opening credit · T2"),
  draft("TX-P-02", "NX-90PP11", "2077-07-04", "12:22:09", "CR", 14000, "CREDIT", "ALDECALDOS", "Convoy surplus"),
  draft("TX-P-03", "NX-90PP11", "2077-08-01", "09:00:00", "DR", 16000, "DEBIT", "SUNSET MOTEL", "Badlands resupply"),
  draft("TX-P-04", "NX-90PP11", "2077-09-22", "13:12:01", "CR", 5000, "WIRE_IN", "V SILVERHAND", "Fuel float from V"),

  draft("TX-K-01", "NX-07KE44", "2076-11-20", "18:00:00", "CR", 740000, "OPENING", "ARASAKA TREASURY", "Opening credit · T1 artist"),
  draft("TX-K-02", "NX-07KE44", "2077-01-14", "21:40:22", "DR", 80000, "DEBIT", "US CRACKS", "Studio buyout float"),
  draft("TX-K-03", "NX-07KE44", "2077-03-03", "04:11:55", "DR", 40000, "WIRE_OUT", "AFTERLIFE", "Private concert"),
  draft("TX-K-04", "NX-07KE44", "2077-08-09", "16:02:18", "CR", 0, "FEE", "NETWATCH", "Account freeze witness", "ed", "POSTED"),
];

export const SEED_LEDGER: LedgerLine[] = chainLines(RAW_LEDGER);

export const SEED_KYC: KycCase[] = BANK_NODES.filter((n) => n.role === "client").map((n) => ({
  id: `KYC-${n.id.slice(-4)}`,
  nodeId: n.id,
  stage: n.kycStage,
  biometric: n.docs.some((d) => d.kind === "BIOMETRIC HASH" && d.status === "RECEIVED"),
  riskScore: n.riskScore,
  decision: n.status === "KYC_HOLD" ? "HOLD" : n.status === "SEALED" ? "REJECTED" : "CLEARED",
  notes:
    n.status === "KYC_HOLD"
      ? ["Address proof under review. Netwatch is reading the file."]
      : n.status === "FROZEN"
        ? ["Cleared historically. Currently frozen by Netwatch."]
        : ["Cleared. Vault live."],
  docs: n.docs,
}));

export const SEED_BENE: Beneficiary[] = [
  { id: "BN-01", ownerId: "NX-77A3F2", name: "Jackie Welles", email: "jackie@arasaka.net", nickname: "Jackie", approved: true },
  { id: "BN-02", ownerId: "NX-77A3F2", name: "Panam Palmer", email: "panam@arasaka.net", nickname: "Panam", approved: true },
  { id: "BN-03", ownerId: "NX-77A3F2", name: "Afterlife Bar", email: "afterlife@nightcity.bar", nickname: "Afterlife", approved: true },
  { id: "BN-04", ownerId: "NX-41JW88", name: "V Silverhand", email: "v@arasaka.net", nickname: "V", approved: true },
  { id: "BN-05", ownerId: "NX-90PP11", name: "V Silverhand", email: "v@arasaka.net", nickname: "V", approved: true },
  { id: "BN-06", ownerId: "NX-07KE44", name: "Us Cracks Trust", email: "uscracks@arasaka.net", nickname: "Us Cracks", approved: true },
];

export const KYC_STAGES: { id: KycStage; no: string; label: string }[] = [
  { id: "INTAKE", no: "01", label: "DETAILS" },
  { id: "BIOMETRIC", no: "02", label: "BIOMETRIC" },
  { id: "DOCUMENTS", no: "03", label: "DOCUMENTS" },
  { id: "RISK", no: "04", label: "RISK" },
  { id: "CLEARANCE", no: "05", label: "CLEARANCE" },
];

export function stampClock(d = new Date()) {
  return d.toLocaleTimeString("en-GB", { hour12: false });
}

export function stampIso(d = new Date()) {
  return d.toISOString();
}

export function uid(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

export const DEMO_ACCOUNTS = [
  { role: "Client T2", email: "v@arasaka.net", note: "Live vault + full ledger" },
  { role: "Client T3", email: "jackie@arasaka.net", note: "Active private" },
  { role: "Client T2", email: "panam@arasaka.net", note: "Active dual-key" },
  { role: "KYC hold", email: "judy@arasaka.net", note: "Waiting on Netwatch" },
  { role: "KYC hold", email: "river@arasaka.net", note: "Documents missing" },
  { role: "Frozen T1", email: "kerry@arasaka.net", note: "Black ICE lock" },
  { role: "Admin T0", email: "admin@arasaka.net", note: "Command desk" },
];
