"use client";

import { LoaderCircle } from "lucide-react";
import { useEffect, useState } from "react";

const STEPS = [
  "Opening website",
  "Capturing screenshots",
  "Extracting design tokens",
  "Analyzing responsive behavior",
  "Generating AI report",
];

export function ScanLoadingState() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const interval = window.setInterval(() => {
      setActiveIndex((current) => (current < STEPS.length - 1 ? current + 1 : current));
    }, 1800);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.clearInterval(interval);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/48 px-5 backdrop-blur-sm">
      <div
        role="alertdialog"
        aria-modal="true"
        aria-busy="true"
        className="w-full max-w-xl rounded-[32px] border border-cyan-500/20 bg-slate-950/92 p-6 shadow-[0_28px_90px_-36px_rgba(6,182,212,0.42)]"
      >
        <div className="flex items-start gap-4">
          <div className="mt-1 flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-400/12 text-cyan-200">
            <LoaderCircle className="h-5 w-5 animate-spin" />
          </div>
          <div className="flex-1">
            <div className="text-[11px] font-semibold uppercase tracking-[0.3em] text-cyan-300">
              SiteDNA Analysis
            </div>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">
              Scanning the live interface
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              Please keep this tab open while SiteDNA captures screenshots, extracts design
              tokens, and generates the final report.
            </p>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          {STEPS.map((step, index) => {
            const isActive = index === activeIndex;
            const isComplete = index < activeIndex;

            return (
              <div
                key={step}
                className="flex items-center gap-3 rounded-[22px] border border-white/8 bg-white/[0.03] px-4 py-3"
              >
                <div
                  className={[
                    "h-2.5 w-2.5 rounded-full transition",
                    isComplete
                      ? "bg-emerald-400 shadow-[0_0_0_6px_rgba(74,222,128,0.12)]"
                      : isActive
                        ? "bg-cyan-300 shadow-[0_0_0_6px_rgba(103,232,249,0.12)]"
                        : "bg-white/20",
                  ].join(" ")}
                />
                <div className="flex-1 text-sm text-slate-200">{step}</div>
                <div className="text-xs uppercase tracking-[0.24em] text-slate-500">
                  {isComplete ? "done" : isActive ? "live" : "queued"}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-5 rounded-[22px] border border-cyan-500/12 bg-cyan-400/6 px-4 py-3 text-sm text-cyan-100">
          This modal will close automatically when the report is ready.
        </div>
      </div>
    </div>
  );
}
