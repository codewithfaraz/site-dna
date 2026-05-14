import type { RawWebsiteExtraction } from "@/src/lib/analyzer/types";
import type { DesignReport } from "@/src/lib/schemas/designReport";

export type SiteScanResult = {
  id: string;
  url: string;
  normalizedUrl: string;
  domain: string;
  status: "processing" | "completed" | "failed";
  error?: string;
  screenshots?: {
    desktop?: string;
    tablet?: string;
    mobile?: string;
  };
  rawExtraction?: RawWebsiteExtraction;
  report?: DesignReport;
  createdAt: string;
  updatedAt: string;
};

export function getSiteScanStorageKey(scanId: string) {
  return `site-dna-scan:${scanId}`;
}
