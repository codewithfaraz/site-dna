"use client";

import Link from "next/link";
import { AlertTriangle } from "lucide-react";

import { ScanReportView } from "@/src/components/report/scan-report-view";
import { getSiteScanStorageKey, type SiteScanResult } from "@/src/lib/scans/types";

type EphemeralScanPageProps = {
  scanId: string;
};

export function EphemeralScanPage({ scanId }: EphemeralScanPageProps) {
  if (typeof window === "undefined") {
    return (
      <main className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#e2e8f0_100%)] px-5 py-8 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-3xl rounded-[32px] border border-slate-200 bg-white/90 p-8 text-slate-700 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.35)]">
          Loading scan report...
        </div>
      </main>
    );
  }

  const stored = window.sessionStorage.getItem(getSiteScanStorageKey(scanId));
  if (!stored) {
    return <MissingScanState />;
  }

  const scan = parseStoredScan(stored);
  if (!scan) {
    return <MissingScanState />;
  }

  return <ScanReportView scan={scan} />;
}

function MissingScanState() {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#e2e8f0_100%)] px-5 py-8 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-3xl rounded-[32px] border border-amber-200 bg-amber-50 p-8 text-amber-950 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.25)]">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5" />
          <div>
            <h1 className="text-xl font-semibold">This report is not available in the current browser session</h1>
            <p className="mt-3 text-sm leading-6">
              SiteDNA is running in stateless demo mode right now, so reports are stored only in this tab session.
            </p>
            <Link
              href="/"
              className="mt-4 inline-flex rounded-full border border-amber-300 bg-white px-4 py-2 text-sm font-medium text-amber-900 transition hover:bg-amber-100"
            >
              Run a new scan
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

function parseStoredScan(stored: string): SiteScanResult | null {
  try {
    return JSON.parse(stored) as SiteScanResult;
  } catch {
    return null;
  }
}
