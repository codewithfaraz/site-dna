import type { RawWebsiteExtraction } from "@/src/lib/analyzer/types";
import type { DesignReport } from "@/src/lib/schemas/designReport";

import { ReportSection } from "@/src/components/report/report-section";

type SpacingPanelProps = {
  report: DesignReport;
  extraction: RawWebsiteExtraction;
};

export function SpacingPanel({ report, extraction }: SpacingPanelProps) {
  const tokens =
    report.spacingSystem.detectedScale.length > 0
      ? report.spacingSystem.detectedScale
      : extraction.spacing.spacingScale;

  return (
    <ReportSection
      eyebrow="Spacing"
      title="Spacing, Radius & Shadows"
      description={`Scale type: ${report.spacingSystem.scaleType}. ${report.spacingSystem.layoutRhythm}`}
    >
      <div className="grid gap-5 lg:grid-cols-3">
        <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
          <div className="text-sm font-medium text-slate-500">Spacing Scale</div>
          <div className="mt-3 flex flex-wrap gap-2">
            {tokens.map((value) => (
              <span key={value} className="rounded-full bg-white px-3 py-1.5 font-mono text-xs text-slate-700">
                {value}
              </span>
            ))}
          </div>
        </div>
        <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
          <div className="text-sm font-medium text-slate-500">Radius Scale</div>
          <div className="mt-3 flex flex-wrap gap-2">
            {extraction.radius.scale.map((value) => (
              <span key={value} className="rounded-full bg-white px-3 py-1.5 font-mono text-xs text-slate-700">
                {value}
              </span>
            ))}
          </div>
        </div>
        <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
          <div className="text-sm font-medium text-slate-500">Shadow Tokens</div>
          <div className="mt-3 space-y-2">
            {extraction.shadows.commonShadows.slice(0, 4).map((shadow) => (
              <div key={shadow.value} className="rounded-2xl bg-white p-3 text-xs text-slate-600 shadow-sm">
                {shadow.value}
              </div>
            ))}
          </div>
        </div>
      </div>
    </ReportSection>
  );
}
