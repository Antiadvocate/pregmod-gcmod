/** The interface's vocabulary. Everything in Warp is built from these, so a number looks the same
 *  wherever it appears and a bounded value always reads as a meter rather than as a digit you have
 *  to know the range of. */
import type { ReactNode } from "react";

export function cx(...xs: (string | false | null | undefined)[]): string {
  return xs.filter(Boolean).join(" ");
}

export function Card({ children, className, onClick }: { children: ReactNode; className?: string; onClick?: () => void }) {
  return <div className={cx("card p-4", onClick && "press cursor-pointer", className)} onClick={onClick}>{children}</div>;
}

export function Section({ title, right, children, className }: { title: string; right?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={cx("mb-6", className)}>
      <header className="flex items-baseline justify-between mb-2.5">
        <h2 className="font-display text-[15px] tracking-tight">{title}</h2>
        {right}
      </header>
      {children}
    </section>
  );
}

export function Stat({ label, value, sub, tone }: { label: string; value: ReactNode; sub?: ReactNode; tone?: "good" | "bad" | "warn" }) {
  const color = tone === "good" ? "var(--good)" : tone === "bad" ? "var(--danger)" : tone === "warn" ? "var(--warn)" : "var(--text-hi)";
  return (
    <div className="card-2 px-3 py-2.5">
      <div className="text-[10.5px] uppercase tracking-[.09em] dim">{label}</div>
      <div className="font-mono text-[19px] leading-tight mt-0.5" style={{ color }}>{value}</div>
      {sub ? <div className="text-[11px] dim mt-0.5">{sub}</div> : null}
    </div>
  );
}

/** A bounded number, as a bar. `range` gives the domain; the fill colour comes from where in it
 *  the value sits, not from the caller, so red always means the same thing. */
export function Meter({ value, range = [0, 100], invert, label, showValue = true }:
  { value: number; range?: [number, number]; invert?: boolean; label?: string; showValue?: boolean }) {
  const [lo, hi] = range;
  const pct = Math.max(0, Math.min(1, (value - lo) / (hi - lo)));
  const good = invert ? 1 - pct : pct;
  const color = good > 0.66 ? "var(--good)" : good > 0.33 ? "var(--accent)" : "var(--danger)";
  return (
    <div>
      {label ? (
        <div className="flex justify-between text-[11px] mb-1">
          <span className="mid">{label}</span>
          {showValue ? <span className="font-mono dim">{Math.round(value)}</span> : null}
        </div>
      ) : null}
      <div className="meter"><div style={{ width: `${pct * 100}%`, background: color }} /></div>
    </div>
  );
}

export function Chip({ children, tone, on, onClick, title }:
  { children: ReactNode; tone?: "good" | "bad"; on?: boolean; onClick?: () => void; title?: string }) {
  return (
    <button type="button" title={title} onClick={onClick}
      className={cx("chip", on && "on", tone === "good" && "good", tone === "bad" && "bad", !onClick && "pointer-events-none")}>
      {children}
    </button>
  );
}

export function Button({ children, onClick, kind, size, disabled, title, className }:
  { children: ReactNode; onClick?: () => void; kind?: "primary" | "danger" | "ghost"; size?: "sm"; disabled?: boolean; title?: string; className?: string }) {
  return (
    <button type="button" title={title} disabled={disabled} onClick={onClick}
      className={cx("btn", kind === "primary" && "btn-primary", kind === "danger" && "btn-danger", kind === "ghost" && "btn-ghost", size === "sm" && "btn-sm", className)}>
      {children}
    </button>
  );
}

export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <div className="mb-3">
      <label className="block mb-1.5">{label}</label>
      {children}
      {hint ? <div className="text-[11px] dim mt-1">{hint}</div> : null}
    </div>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return <div className="card p-8 text-center dim text-[13px]">{children}</div>;
}

export function Money({ n, sign }: { n: number; sign?: boolean }) {
  const neg = n < 0;
  return (
    <span className="font-mono" style={{ color: neg ? "var(--danger)" : sign ? "var(--good)" : undefined }}>
      {neg ? "−" : sign ? "+" : ""}¤{Math.abs(Math.round(n)).toLocaleString()}
    </span>
  );
}

/** A modal that is a sheet on a phone and a dialog on a desk. */
export function Sheet({ open, onClose, title, children, wide }:
  { open: boolean; onClose: () => void; title: string; children: ReactNode; wide?: boolean }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" style={{ background: "rgba(0,0,0,.6)" }} onClick={onClose}>
      <div className={cx("card w-full max-h-[88dvh] overflow-y-auto", wide ? "sm:max-w-3xl" : "sm:max-w-lg")}
        style={{ borderRadius: "16px 16px 0 0" }} onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 hairline" style={{ background: "var(--ink-1)" }}>
          <h3 className="font-display text-[15px]">{title}</h3>
          <Button kind="ghost" size="sm" onClick={onClose}>close</Button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}
