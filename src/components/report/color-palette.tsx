import type { DesignReport } from "@/src/lib/schemas/designReport";

import { ReportSection } from "@/src/components/report/report-section";

type ColorPaletteProps = {
  report: DesignReport;
};

export function ColorPalette({ report }: ColorPaletteProps) {
  const palette =
    report.colorSystem.palette.length > 0
      ? report.colorSystem.palette
      : [
          report.colorSystem.primary,
          report.colorSystem.background,
          report.colorSystem.surface,
          report.colorSystem.text,
          report.colorSystem.accent,
        ];

  return (
    <ReportSection
      eyebrow="Color System"
      title={report.colorSystem.paletteName}
      description={report.colorSystem.usageNotes.join(" ")}
    >
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {palette.map((color) => (
          <div key={color} className="rounded-[24px] border border-slate-200 bg-slate-50 p-3">
            <div className="h-20 rounded-[18px] border border-white/40" style={{ backgroundColor: color }} />
            <div className="mt-3 flex items-center justify-between gap-3 text-sm">
              <span className="font-medium text-slate-900">{color}</span>
              <span className="rounded-full bg-white px-2.5 py-1 text-xs text-slate-500">swatch</span>
            </div>
          </div>
        ))}
      </div>
    </ReportSection>
  );
}
