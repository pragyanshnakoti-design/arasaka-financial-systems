import { cn } from "@/lib/cn";

export function Seal({ className, accent = false }: { className?: string; accent?: boolean }) {
  return (
    <img
      src={accent ? "/media/mon-blood.png" : "/media/mon.png"}
      alt=""
      className={cn("object-contain", className)}
      aria-hidden
    />
  );
}

export function BrandLogo({ className, alt = "Arasaka. Secure your money." }: { className?: string; alt?: string }) {
  return <img src="/media/logo.png" alt={alt} className={cn("brand-logo", className)} />;
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Seal className="size-7" />
      <span className="font-display text-xl font-semibold tracking-[0.38em]">ARASAKA</span>
    </div>
  );
}
