import type { ReactNode } from "react";

type ReportSectionProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
};

export function ReportSection({
  eyebrow,
  title,
  description,
  children,
  className,
}: ReportSectionProps) {
  return (
    <section
      className={[
        "rounded-[32px] border border-slate-200/80 bg-white/90 p-6 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.35)] backdrop-blur",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="flex flex-col gap-2 border-b border-slate-200/80 pb-5">
        {eyebrow ? (
          <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-700">
            {eyebrow}
          </div>
        ) : null}
        <h2 className="text-xl font-semibold tracking-tight text-slate-950">{title}</h2>
        {description ? <p className="max-w-3xl text-sm leading-6 text-slate-600">{description}</p> : null}
      </div>
      <div className="pt-5">{children}</div>
    </section>
  );
}
