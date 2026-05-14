import type { RawWebsiteExtraction } from "@/src/lib/analyzer/types";
import type { DesignReport } from "@/src/lib/schemas/designReport";

import { ReportSection } from "@/src/components/report/report-section";

type TypographyPanelProps = {
  report: DesignReport;
  extraction: RawWebsiteExtraction;
};

export function TypographyPanel({ report, extraction }: TypographyPanelProps) {
  return (
    <ReportSection
      eyebrow="Typography"
      title="Type Scale & Hierarchy"
      description={report.typographyInsights.scaleDescription}
    >
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-4">
          <div>
            <div className="text-sm font-medium text-slate-500">Primary Fonts</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {report.typographyInsights.primaryFonts.map((font) => (
                <span
                  key={font}
                  className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-900"
                >
                  {font}
                </span>
              ))}
            </div>
          </div>
          <div>
            <div className="text-sm font-medium text-slate-500">Hierarchy Notes</div>
            <div className="mt-2 space-y-2 text-sm leading-6 text-slate-700">
              {report.typographyInsights.hierarchyNotes.map((note) => (
                <p key={note}>{note}</p>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
          <div className="text-sm font-medium text-slate-500">Detected Scale</div>
          <div className="mt-3 flex flex-wrap gap-2">
            {[...extraction.typography.headingScale, ...extraction.typography.bodyScale]
              .filter((value, index, all) => all.indexOf(value) === index)
              .map((value) => (
                <span key={value} className="rounded-full bg-white px-3 py-1.5 font-mono text-xs text-slate-700">
                  {value}
                </span>
              ))}
          </div>
        </div>
      </div>
    </ReportSection>
  );
}
