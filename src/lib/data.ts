export type Clearance = "T0" | "T1" | "T2" | "T3";
export type NodeStatus = "APPLICANT" | "KYC_HOLD" | "ACTIVE" | "FROZEN" | "SEALED";
export type ThreatLevel = "CRITICAL" | "HIGH" | "MED" | "SEALED" | "INFO";
export type KycStage = "INTAKE" | "BIOMETRIC" | "DOCUMENTS" | "RISK" | "CLEARANCE";

export type Vault = {
  id: string;
  label: string;
  code: string;
  amount: number;
  hold?: number;
  prefix: string;
  color: "fg" | "ice" | "blood" | "mute";
};

export type NodeRecord = {
  id: string;
  name: string;
  email: string;
  clearance: Clearance;
  status: NodeStatus;
  balance: number;
  token: string;
  role: "client" | "admin";
  card: { holder: string; last: string; exp: string };
  security: number;
  vaults: Vault[];
  kycStage?: KycStage;
  riskScore?: number;
  openedAt?: string;
  successor?: { name: string; relation: string; locked: boolean };
  docs?: { kind: string; status: "RECEIVED" | "MISSING" | "REVIEW" }[];
};

export const DEMO_TOKEN = "JackIn2077!";

export const NODES: NodeRecord[] = [
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
    vaults: [
      { id: "ed", label: "EDDIES", code: "VAULT 0", amount: 142500, prefix: "₡", color: "fg" },
      { id: "usd", label: "USD", code: "VAULT 1", amount: 18000, prefix: "$", color: "ice" },
      { id: "eur", label: "EUR", code: "VAULT 2", amount: 14500, prefix: "€", color: "mute" },
      { id: "btc", label: "BTC", code: "VAULT 3", amount: 0.35, prefix: "₿", color: "blood" },
      { id: "eth", label: "ETH", code: "VAULT 4", amount: 4.2, prefix: "Ξ", color: "ice" },
    ],
  },
  {
    id: "NX-00T0ADM",
    name: "Netwatch Operator",
    email: "admin@arasaka.net",
    clearance: "T0",
    status: "ACTIVE",
    balance: 0,
    token: DEMO_TOKEN,
    role: "admin",
    card: { holder: "OPERATOR T0", last: "0000", exp: "12/2077" },
    security: 100,
    vaults: [],
  },
];

export const FLOORS = [
  {
    id: "reception",
    name: "RECEPTION",
    human: "Front desk",
    tag: "TIER-3 // PUBLIC",
    cam: "CAM // TOWER-00",
    image: "/media/reception.png",
    copy: "First contact. Your identity is confirmed here before a single eddie moves.",
    tone: "ice" as const,
    stats: [
      { k: "DESKS", v: "04" },
      { k: "QUEUE", v: "0" },
      { k: "WAIT", v: "0.00s" },
    ],
    briefing: {
      kicker: "FLOOR 00 // INTAKE",
      title: "YOU DO NOT ENTER THE TOWER. THE TOWER ADMITS YOU.",
      body: "Reception is public on purpose. The scan is not. Name, biometric hash, and guest token are taken before a corridor opens. No wealth is discussed here. No vault is named. If the hash fails, you never existed on this floor.",
      facts: [
        ["PROTOCOL", "GUEST SCAN"],
        ["HOLD", "0.00s"],
        ["NEXT GATE", "NETWATCH OR LOUNGE"],
      ],
    },
  },
  {
    id: "netwatch",
    name: "NETWATCH SECURITY",
    human: "Security command",
    tag: "TIER-0 // ACTIVE",
    cam: "CAM // TOWER-01",
    image: "/media/netwatch-security.png",
    copy: "Live security floor. Human oversight, Black ICE triggers, and threat correlation across every account.",
    tone: "blood" as const,
    stats: [
      { k: "WATCHERS", v: "18" },
      { k: "TRACE", v: "LIVE" },
      { k: "BREACHES", v: "0" },
    ],
    briefing: {
      kicker: "FLOOR 01 // PERIMETER",
      title: "UNAUTHORIZED ACCESS IS NOT A POSSIBILITY. IT IS A FAILURE CONDITION.",
      body: "Netwatch does not wait for a crime. Operators read the signal, Black ICE closes the corridor, and the ledger never records a second attempt. Eighteen watchers. Zero confirmed breaches. The tower prefers silence to apology.",
      facts: [
        ["WATCHERS", "18 LIVE"],
        ["BLACK ICE", "ARMED"],
        ["BREACH LOG", "EMPTY"],
      ],
    },
  },
  {
    id: "lounge",
    name: "PRIVATE LOUNGE",
    human: "Private lounge",
    tag: "TIER-3 // OPEN",
    cam: "CAM // TOWER-02",
    image: "/media/lounge.png",
    copy: "Client floor. Concierge briefings, vault-tier allocation, and a window on Night City that cannot look in.",
    tone: "ember" as const,
    stats: [
      { k: "CLIENT ETA", v: "<4m" },
      { k: "QUEUE", v: "02" },
      { k: "GUIDE", v: "READY" },
    ],
    briefing: {
      kicker: "FLOOR 02 // CLIENT COVER",
      title: "THE CITY CAN SEE THE GLASS. THE GLASS CANNOT SEE YOU.",
      body: "This is where money becomes a conversation instead of a threat. Concierge briefings, vault-tier allocation, Trauma Team retainers if the street gets loud. You sit. You listen. You leave with an account that still has your name on it.",
      facts: [
        ["COVER", "TIER-3"],
        ["CONCIERGE", "ON FLOOR"],
        ["WINDOW", "ONE WAY"],
      ],
    },
  },
  {
    id: "server",
    name: "SERVER ROOM",
    human: "Core systems",
    tag: "TIER-2 // SYNCED",
    cam: "CAM // TOWER-03",
    image: "/media/server-floor.png",
    copy: "Primary financial compute rack. Every movement request is mirrored through cold audit nodes before release.",
    tone: "ice" as const,
    stats: [
      { k: "NODE TEMP", v: "18.4C" },
      { k: "RACKS", v: "72" },
      { k: "LATENCY", v: "0.02s" },
    ],
    briefing: {
      kicker: "FLOOR 03 // SPINE",
      title: "IF THIS FLOOR FAILS, NIGHT CITY DOES NOT GET A REFUND.",
      body: "Seventy-two racks. Sub-second audit. Every eddie, eurodollar, and cold wallet replica lives here before it is allowed to move. The air is kept at 18.4C because heat is a leak. Latency is a leak. The spine does not leak.",
      facts: [
        ["TEMP", "18.4C"],
        ["RACKS", "72 ONLINE"],
        ["MIRROR", "COLD AUDIT"],
      ],
    },
  },
  {
    id: "vault",
    name: "EXECUTIVE VAULT",
    human: "Private vault",
    tag: "TIER-1 // SEALED",
    cam: "CAM // TOWER-04",
    image: "/media/vault.png",
    copy: "Private wealth chamber for board-level custody, inheritance locks, and zero-public-record treasury movement.",
    tone: "blood" as const,
    stats: [
      { k: "VAULTS", v: "09" },
      { k: "CIPHER", v: "4096" },
      { k: "CLEARANCE", v: "A-77" },
    ],
    briefing: {
      kicker: "FLOOR 04 // CUSTODY",
      title: "YOUR NAME OUTLIVES YOUR BODY. YOUR WEALTH DOES TOO.",
      body: "Nine sealed chambers. 4096-bit at rest. Inheritance is a protocol, not a lawyer. When a holder falls, the perimeter does not. Board and Netwatch witness. The street does not get a vote, and the city does not get a record.",
      facts: [
        ["CIPHER", "4096-BIT"],
        ["CLEARANCE", "A-77"],
        ["PUBLIC RECORD", "NONE"],
      ],
    },
  },
] as const;



export const OPERATIVES = [
  {
    id: "priya",
    name: "PRIYA",
    tier: "TIER-1",
    role: "CONCIERGE GUIDE",
    image: "/media/priya.png",
    quote: "I do not sell products. I curate the conditions under which your capital remains untouchable.",
    duties: [
      "Personal banking guidance and onboarding",
      "Vault-tier asset allocation briefings",
      "Discreet client liaison with Arasaka leadership",
      "Continuous trust calibration and threat awareness",
    ],
    stats: [
      { k: "CLIENTS GUIDED", v: "14,212" },
      { k: "AVG SESSION", v: "00:42:11" },
      { k: "TRUST INDEX", v: "99.4%" },
    ],
  },
  {
    id: "pragyansh",
    name: "PRAGYANSH",
    tier: "TIER-0",
    role: "NETWATCH SENTINEL",
    image: "/media/pragyansh.png",
    quote: "Unauthorized access is not a possibility. It is a failure condition.",
    duties: [
      "Live Netwatch correlation across all accounts",
      "Black ICE authorization and freeze staging",
      "Hostile signature detection and severance",
      "Audit trail integrity under protocol K-12",
    ],
    stats: [
      { k: "TRACES CLOSED", v: "6,041" },
      { k: "MEAN RESPONSE", v: "00:00:04" },
      { k: "BREACHES", v: "0" },
    ],
  },
  {
    id: "jenny",
    name: "JENNY",
    tier: "TIER-2",
    role: "TRAUMA TEAM MEDIC",
    image: "",
    sealed: true,
    quote: "If the body fails, the vault still holds. My job is to make sure neither happens on this floor.",
    duties: [
      "On-site trauma response for tower personnel",
      "Client extraction under hostile conditions",
      "Biometric lock recovery after ICE events",
      "Medical override for sealed corridors",
    ],
    stats: [
      { k: "DISPATCH", v: "READY" },
      { k: "EXTRACTS", v: "218" },
      { k: "DOWNTIME", v: "0.02%" },
    ],
  },
] as const;

export const SEED_THREATS: {
  id: string;
  level: ThreatLevel;
  code: string;
  detail: string;
  node: string;
  at: string;
}[] = [
  { id: "t1", level: "CRITICAL", code: "BLACK ICE DEPLOYED", detail: "Unauthorized intrusion attempt repelled.", node: "NX-91BRC2", at: "19:25:07" },
  { id: "t2", level: "HIGH", code: "HOSTILE NODE BLOCKED", detail: "Maelstrom signature detected and severed.", node: "NX-04E1F9", at: "19:18:01" },
  { id: "t3", level: "MED", code: "BIOMETRIC LOCK", detail: "Re-authentication enforced.", node: "NX-77A3F2", at: "19:12:44" },
  { id: "t4", level: "SEALED", code: "VAULT ACCESS SEALED", detail: "Cold-storage vault sealed under protocol K-12.", node: "NX-VAULT-09", at: "18:54:07" },
  { id: "t5", level: "CRITICAL", code: "KILL SWITCH ARMED", detail: "Kill-switch primed on flagged netrunner.", node: "NX-220TE1", at: "18:17:07" },
  { id: "t6", level: "INFO", code: "BIOMETRIC LOCK VERIFIED", detail: "Client identity confirmed at reception.", node: "NX-77A3F2", at: "19:19:16" },
];

export const LIVE_EVENTS = [
  { level: "HIGH" as ThreatLevel, code: "NETWATCH TRACE OK", detail: "Perimeter ping clean. Sector 7-A quiet." },
  { level: "MED" as ThreatLevel, code: "IDENTITY HASH", detail: "Account hash rotation complete." },
  { level: "CRITICAL" as ThreatLevel, code: "EXTERNAL PRESSURE", detail: "NUSA probe rejected at Blackwall edge." },
  { level: "SEALED" as ThreatLevel, code: "VAULT HEARTBEAT", detail: "K-12 ring reports sealed / green." },
  { level: "HIGH" as ThreatLevel, code: "DOGTOWN NOISE", detail: "Freelance signature ignored. Perimeter holds." },
  { level: "INFO" as ThreatLevel, code: "SESSION SEALED", detail: "Client session keys rotated." },
];

export const SHARDS = [
  {
    id: "01",
    kicker: "01 / VISION — WHY WE EXIST",
    title: "WE DO NOT PROTECT WEALTH. WE CONTROL THE CONDITIONS AROUND IT.",
    body: "Arasaka Financial is not a bank. It is a perimeter. A discipline. A doctrine of capital under permanent guard.",
    cols: [
      ["MANDATE", "Perimeter-grade banking"],
      ["DOCTRINE", "Capital under permanent guard"],
      ["FOUNDED", "TOKYO // 2028"],
    ],
  },
  {
    id: "02",
    kicker: "02 / OUR PROMISE — WHAT WE GUARANTEE",
    title: "YOUR ASSETS DO NOT MOVE UNLESS ARASAKA PERMITS MOVEMENT.",
    body: "Every account verified. Every transaction watched. Every threat ended before it forms.",
    cols: [
      ["GUARANTEE", "Zero unauthorized"],
      ["VERIFICATION", "Biometric on every move"],
      ["WITNESS", "Netwatch // perpetual"],
    ],
  },
  {
    id: "03",
    kicker: "03 / CORE PILLARS — HOW WE HOLD",
    title: "BLACK ICE. NETWATCH. TRAUMA TEAM. ONE SPINE.",
    body: "Machine retaliation, human command, and extraction on standby. The tower does not outsource the perimeter.",
    cols: [
      ["BLACK ICE", "Autonomous retaliation"],
      ["NETWATCH", "Human + machine"],
      ["TRAUMA TEAM", "Dispatch ready"],
    ],
  },
  {
    id: "04",
    kicker: "04 / TECHNOLOGY EDGE — WHAT WE WIELD",
    title: "4096-BIT ENCRYPTION. SUB-SECOND THREAT RESPONSE. CLASSIFIED VAULT PROTOCOLS.",
    body: "Our sentinels operate continuously. Our Black ICE retaliates on its own. Our vaults answer to no one outside Arasaka.",
    cols: [
      ["ENCRYPTION", "4096-bit at rest / in flight"],
      ["RESPONSE", "0.2 seconds"],
      ["VAULTS", "Sealed protocol K-12"],
    ],
  },
  {
    id: "05",
    kicker: "05 / CONTINUITY — WHAT SURVIVES",
    title: "YOUR NAME OUTLIVES YOUR BODY. YOUR WEALTH DOES TOO.",
    body: "Arasaka vaults are built for succession. When a holder falls, the perimeter does not. The account remains. The city does not get a vote.",
    cols: [
      ["SUCCESSION", "Locked to bloodline"],
      ["RELIC HOLD", "Engram-grade custody"],
      ["WITNESS", "Board + Netwatch"],
    ],
  },
] as const;

export function formatEddie(n: number) {
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
