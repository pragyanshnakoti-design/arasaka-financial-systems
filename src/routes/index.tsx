import { useCallback, useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { BootOverlay } from "@/components/boot-overlay";
import { TowerNav } from "@/components/chrome";
import {
  Bloodline,
  Doctrine,
  FloorTour,
  Hero,
  Lockup,
  Metrics,
  NetwatchLive,
  Operatives,
  Shards,
} from "@/components/landing";

export const Route = createFileRoute("/")({ component: Home });

let bootConsumed = false;

function Home() {
  const [showBoot, setShowBoot] = useState(() => !bootConsumed);

  useEffect(() => {
    if (bootConsumed) {
      setShowBoot(false);
      return;
    }
    if (sessionStorage.getItem("arasaka-boot-v4") === "1") {
      bootConsumed = true;
      setShowBoot(false);
    }
  }, []);

  useEffect(() => {
    if (showBoot) return;
    const id = window.location.hash.slice(1);
    if (!id) return;
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  }, [showBoot]);

  const onDone = useCallback(() => {
    bootConsumed = true;
    sessionStorage.setItem("arasaka-boot-v4", "1");
    setShowBoot(false);
  }, []);

  return (
    <main className="bg-ink pb-16 text-fg">
      {showBoot ? <BootOverlay onDone={onDone} /> : null}
      <TowerNav />
      <Hero />
      <FloorTour />
      <Shards />
      <Metrics />
      <Bloodline />
      <Operatives />
      <Doctrine />
      <NetwatchLive />
      <Lockup />
    </main>
  );
}
