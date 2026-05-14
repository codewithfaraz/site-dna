"use client";

import { ArrowRight, Globe, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import toast from "react-hot-toast";

import { ScanLoadingState } from "@/src/components/scan-loading-state";
import { getSiteScanStorageKey, type SiteScanResult } from "@/src/lib/scans/types";

const EXAMPLE_URLS = ["https://stripe.com", "https://linear.app", "https://vercel.com"];

export function SiteUrlForm() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const normalized = normalizeUrlCandidate(url);
    if (!normalized) {
      const message = "Enter a valid website URL before starting the scan.";
      setError(message);
      toast.error(message);
      return;
    }

    startTransition(async () => {
      try {
        const response = await fetch("/api/scans", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: normalized }),
        });

        const data = (await response.json()) as
          | { success: true; scan: SiteScanResult }
          | { success: false; message: string };

        if (!data.success) {
          setError(data.message);
          toast.error(data.message);
          return;
        }

        window.sessionStorage.setItem(
          getSiteScanStorageKey(data.scan.id),
          JSON.stringify(data.scan),
        );
        toast.success("SiteDNA report is ready.");
        router.push(`/scans/${data.scan.id}`);
      } catch {
        const message = "The scan request failed before SiteDNA could start.";
        setError(message);
        toast.error(message);
      }
    });
  };

  return (
    <div className="space-y-4">
      <form
        onSubmit={onSubmit}
        className="rounded-[32px] border border-slate-200/80 bg-white/78 p-3 shadow-[0_24px_60px_-32px_rgba(15,23,42,0.26)] backdrop-blur"
      >
        <div className="flex flex-col gap-3 md:flex-row">
          <label className="flex flex-1 items-center gap-3 rounded-[24px] border border-white/10 bg-slate-950/70 px-4 py-4 text-slate-200 focus-within:border-cyan-300/60">
            <Globe className="h-5 w-5 text-cyan-300" />
            <input
              type="url"
              inputMode="url"
              autoComplete="url"
              placeholder="https://stripe.com"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              className="w-full bg-transparent text-base outline-none placeholder:text-slate-500"
              required
            />
          </label>
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center justify-center gap-2 rounded-[24px] bg-cyan-300 px-6 py-4 text-base font-semibold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-70 md:min-w-52"
          >
            {isPending ? (
              <>
                <Sparkles className="h-5 w-5 animate-pulse" />
                Analyzing
              </>
            ) : (
              <>
                Analyze Website
                <ArrowRight className="h-5 w-5" />
              </>
            )}
          </button>
        </div>
      </form>

      <div className="flex flex-wrap gap-2">
        {EXAMPLE_URLS.map((exampleUrl) => (
          <button
            key={exampleUrl}
            type="button"
            onClick={() => setUrl(exampleUrl)}
            className="rounded-full border border-slate-200 bg-white/78 px-3 py-1.5 text-sm text-slate-600 transition hover:border-cyan-300 hover:bg-cyan-50 hover:text-slate-950"
          >
            {exampleUrl}
          </button>
        ))}
      </div>

      {error ? (
        <div className="rounded-3xl border border-rose-300 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      {isPending ? <ScanLoadingState /> : null}
    </div>
  );
}

function normalizeUrlCandidate(value: string) {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const candidate = /^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;

  try {
    const url = new URL(candidate);
    if (!["http:", "https:"].includes(url.protocol) || !url.hostname.includes(".")) {
      return null;
    }
    return url.toString();
  } catch {
    return null;
  }
}
