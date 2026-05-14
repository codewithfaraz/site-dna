import type { SiteScanResult } from "@/src/lib/scans/types";

export function toJsonExport(scan: SiteScanResult): string {
  return JSON.stringify(scan, null, 2);
}
