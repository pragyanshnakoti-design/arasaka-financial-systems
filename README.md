# Arasaka Financial Systems

Night City private-banking demo. Cinematic front + working client vault and Netwatch command desk.

Fictional. No real money. No real Arasaka.

## Run

```bash
npm install
npm run dev
```

## Demo logins

Password for all: `JackIn2077!`

| Email | Role |
| --- | --- |
| `v@arasaka.net` | Live T2 vault + full ledger |
| `jackie@arasaka.net` | Active T3 |
| `panam@arasaka.net` | Active T2 |
| `judy@arasaka.net` | KYC hold |
| `river@arasaka.net` | KYC documents missing |
| `kerry@arasaka.net` | Frozen T1 |
| `admin@arasaka.net` | Netwatch command |

## What it does

- Client vault: holdings, move money (debit/credit book), personal ledger, KYC, succession
- Admin: KYC queue, freeze / unfreeze, global ledger + hash chain, audit
- J.A.V.A. in-console assistant
- New accounts sit in KYC hold until command clears them (opens a T3 vault)

## Stack

React 19, TypeScript, TanStack Start, Vite, Tailwind CSS v4, Zustand (local demo persistence).
