"use client";

import { Check, Copy } from "lucide-react";
import { useState, useTransition } from "react";

type CopyButtonProps = {
  value: string;
  label: string;
  className?: string;
};

export function CopyButton({ value, label, className }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleCopy = () => {
    startTransition(async () => {
      try {
        await navigator.clipboard.writeText(value);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1800);
      } catch {
        setCopied(false);
      }
    });
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={[
        "inline-flex items-center gap-2 rounded-full border border-white/10 bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:border-cyan-300/50 hover:bg-slate-900 disabled:opacity-60",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      disabled={isPending}
    >
      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      {copied ? "Copied" : label}
    </button>
  );
}
