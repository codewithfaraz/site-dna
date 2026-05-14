import type { DesignReport } from "@/src/lib/schemas/designReport";

import { CopyButton } from "@/src/components/copy-button";
import { ReportSection } from "@/src/components/report/report-section";

type TailwindThemeCardProps = {
  report: DesignReport;
  exportValue: string;
};

export function TailwindThemeCard({ report, exportValue }: TailwindThemeCardProps) {
  return (
    <ReportSection
      eyebrow="Theme Export"
      title="Tailwind Theme Suggestion"
      description="A partial theme object you can drop into a design system or prototype."
    >
      <div className="flex flex-col gap-4">
        <div className="flex justify-end">
          <CopyButton value={exportValue} label="Copy Tailwind Config" />
        </div>
        <pre className="overflow-x-auto rounded-[24px] bg-slate-950 p-5 text-xs leading-6 text-cyan-100">
          <code>{JSON.stringify(report.tailwindThemeSuggestion, null, 2)}</code>
        </pre>
      </div>
    </ReportSection>
  );
}
