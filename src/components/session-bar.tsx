import { useEffect, useState } from "react";
import { LIVE_EVENTS } from "@/lib/data";
import { useSession } from "@/lib/session";

function ncStamp(d: Date) {
  const y = 2077;
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  const ss = String(d.getSeconds()).padStart(2, "0");
  return `${y}.${m}.${day}  ${hh}:${mm}:${ss}`;
}

export function SessionBar() {
  const node = useSession((s) => s.node);
  const [now, setNow] = useState("");
  const [sec, setSec] = useState(0);
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const step = () => {
      setSec((n) => n + 1);
      setNow(ncStamp(new Date()));
    };
    step();
    const t = window.setInterval(step, 1000);
    const r = window.setInterval(() => setTick((n) => n + 1), 4200);
    return () => {
      window.clearInterval(t);
      window.clearInterval(r);
    };
  }, []);
  const mm = String(Math.floor(sec / 60)).padStart(2, "0");
  const ss = String(sec % 60).padStart(2, "0");
  const ev = LIVE_EVENTS[tick % LIVE_EVENTS.length];
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 border-t border-line bg-ink/92 px-3 py-2 font-mono text-[10px] tracking-[0.18em] text-mute backdrop-blur-sm md:px-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="flex items-center gap-2 text-fg/80">
          <span className="size-1.5 bg-blood" style={{ animation: "pulse-dot 1.2s ease-in-out infinite" }} />
          {ev ? `${ev.code} · ${ev.detail}` : "ARASAKA FINANCIAL SYSTEMS HAS BEEN MONITORING THIS SESSION"}
        </span>
        <span className="flex flex-wrap items-center gap-4">
          <span>ACCOUNT // {node ? node.id : "GUEST"}</span>
          <span className="text-ice">{now ? `NC ${now}` : "NC —"}</span>
          <span>
            DURATION <span className="tabular text-fg">{mm}:{ss}</span>
          </span>
          <span className="text-blood">ALL KEYSTROKES LOCKED</span>
        </span>
      </div>
    </div>
  );
}