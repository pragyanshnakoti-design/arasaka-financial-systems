import { useCallback, useEffect, useRef, useState } from "react";

type Phase = "logo" | "play" | "out";

export function BootOverlay({ onDone }: { onDone: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const done = useRef(false);
  const [phase, setPhase] = useState<Phase>("logo");
  const [cut, setCut] = useState(false);
  const [canPlay, setCanPlay] = useState(false);
  const [logoHeld, setLogoHeld] = useState(false);

  const enter = useCallback(() => {
    if (done.current) return;
    done.current = true;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    videoRef.current?.pause();
    if (reduce) {
      onDone();
      return;
    }
    setPhase("out");
    window.setTimeout(onDone, 460);
  }, [onDone]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      onDone();
      return;
    }
    const hold = window.setTimeout(() => setLogoHeld(true), 1100);
    const failsafe = window.setTimeout(() => setCanPlay(true), 2800);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Tab") return;
      e.preventDefault();
      enter();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(hold);
      window.clearTimeout(failsafe);
      window.removeEventListener("keydown", onKey);
    };
  }, [enter, onDone]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const mark = () => setCanPlay(true);
    if (v.readyState >= 3) mark();
    v.addEventListener("canplay", mark);
    v.addEventListener("loadeddata", mark);
    v.addEventListener("playing", mark);
    return () => {
      v.removeEventListener("canplay", mark);
      v.removeEventListener("loadeddata", mark);
      v.removeEventListener("playing", mark);
    };
  }, []);

  useEffect(() => {
    if (phase !== "logo" || !logoHeld || !canPlay) return;
    setCut(true);
    const t = window.setTimeout(() => {
      setPhase("play");
      const v = videoRef.current;
      if (!v) return;
      try {
        v.currentTime = 0;
      } catch {
        /* ignore */
      }
      v.muted = true;
      void v.play().catch(() => undefined);
    }, 220);
    return () => window.clearTimeout(t);
  }, [phase, logoHeld, canPlay]);

  return (
    <div
      className={phase === "out" ? "boot-gate is-out" : "boot-gate"}
      data-phase={phase}
      onClick={enter}
      role="dialog"
      aria-label="Arasaka terminal. Press to enter."
    >
      <video
        ref={videoRef}
        className="boot-vid"
        src="/media/boot.mp4"
        poster="/media/boot-poster.jpg"
        muted
        loop
        playsInline
        preload="auto"
        disablePictureInPicture
      />
      {phase === "logo" ? <img src="/media/loading.png" alt="" className="boot-logo" /> : null}
      {cut && phase === "logo" ? <div className="film-cut" /> : null}
      {phase === "play" ? <p className="boot-press">PRESS TO ENTER</p> : null}
      <div className="scanline" />
    </div>
  );
}
