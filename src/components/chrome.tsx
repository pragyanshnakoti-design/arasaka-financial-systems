import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Seal } from "./seal";
import { useSession } from "@/lib/session";
import { cn } from "@/lib/cn";

export function TowerNav() {
  const node = useSession((s) => s.node);
  const signOut = useSession((s) => s.signOut);
  return (
    <header className="relative z-30 flex items-center justify-between px-4 py-4 md:px-8">
      <Link to="/" className="logo-hot flex items-center gap-3">
        <Seal className="size-8 transition-transform duration-150 hover:scale-110" />
        <span className="glitch-word glitch-idle font-display text-lg font-semibold tracking-[0.35em]" data-text="ARASAKA">
          ARASAKA
        </span>
      </Link>
      <nav className="flex items-center gap-1 font-mono text-[10px] tracking-[0.22em] md:gap-3">
        <Link
          to="/"
          hash="floors"
          className="nav-link hidden px-2 py-2 text-mute sm:inline"
          onClick={(e) => {
            if (window.location.pathname === "/" || window.location.pathname === "") {
              const el = document.getElementById("floors");
              if (el) {
                e.preventDefault();
                el.scrollIntoView({ behavior: "smooth" });
              }
            }
          }}
        >
          TOWER
        </Link>
        <Link
          to="/"
          hash="about"
          className="nav-link px-2 py-2 text-mute"
          onClick={(e) => {
            if (window.location.pathname === "/" || window.location.pathname === "") {
              const el = document.getElementById("about");
              if (el) {
                e.preventDefault();
                el.scrollIntoView({ behavior: "smooth" });
              }
            }
          }}
        >
          ABOUT
        </Link>
        {node?.role === "admin" ? (
          <Link to="/admin" className="nav-link px-2 py-2 text-blood">
            COMMAND
          </Link>
        ) : node ? (
          <Link to="/dashboard" className="nav-link px-2 py-2 text-mute">
            VAULT
          </Link>
        ) : null}
        {node ? (
          <button type="button" onClick={signOut} className="nav-link px-2 py-2 text-mute hover:text-blood">
            SIGN OUT
          </button>
        ) : (
          <Link to="/login" className="nav-link px-2 py-2 text-blood">
            SIGN IN
          </Link>
        )}
      </nav>
    </header>
  );
}

export function Label({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn("font-mono text-[10px] tracking-[0.32em] text-mute", className)}>{children}</p>;
}
