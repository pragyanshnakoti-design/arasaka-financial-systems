import { createServerFn } from "@tanstack/react-start";

export const askJava = createServerFn({ method: "POST" })
  .validator((input: { prompt: string; context: string; role: "client" | "admin" }) => input)
  .handler(async ({ data }) => {
    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) return { ok: false as const, error: "offline" };
    const system =
      data.role === "admin"
        ? "You are J.A.V.A. — Joint Arasaka Vault Assistant — for a Netwatch command desk in a fictional Cyberpunk 2077 private bank demo. Be terse, precise, human. No JACK IN slang. Help the operator with KYC queue, freezes, ledger integrity, and client files. Never claim real money or real Arasaka. Keep answers under 90 words."
        : "You are J.A.V.A. — Joint Arasaka Vault Assistant — for a fictional private bank vault in a Cyberpunk 2077 demo. Be calm, precise, human. Help with balances, ledger, KYC status, transfers, freeze meaning. Never claim real money. Keep answers under 90 words.";
    try {
      const res = await fetch("https://api.x.ai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "grok-4.5",
          max_tokens: 220,
          messages: [
            { role: "system", content: system },
            { role: "user", content: `VAULT CONTEXT:\n${data.context}\n\nQUESTION:\n${data.prompt}` },
          ],
        }),
      });
      if (!res.ok) return { ok: false as const, error: `xAI ${res.status}` };
      const body = (await res.json()) as { choices?: { message?: { content?: string } }[] };
      return { ok: true as const, text: body.choices?.[0]?.message?.content ?? "" };
    } catch {
      return { ok: false as const, error: "network" };
    }
  });
