import type { DesignReport } from "@/src/lib/schemas/designReport";

import { CopyButton } from "@/src/components/copy-button";
import { ReportSection } from "@/src/components/report/report-section";

type PromptCardProps = {
  report: DesignReport;
};

export function PromptCard({ report }: PromptCardProps) {
  return (
    <ReportSection
      eyebrow="AI Prompts"
      title="Recreation Prompt Pack"
      description="Copy a ready-to-use prompt for your preferred AI builder."
    >
      <div className="space-y-4">
        <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-medium text-slate-900">Master Recreation Prompt</div>
              <div className="text-sm text-slate-500">Long-form prompt tuned for faithful UI recreation.</div>
            </div>
            <CopyButton value={report.aiRecreationPrompt} label="Copy Prompt" />
          </div>
          <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-slate-700">{report.aiRecreationPrompt}</p>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {Object.entries(report.prompts).map(([key, value]) => (
            <div key={key} className="rounded-[24px] border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="text-sm font-medium capitalize text-slate-900">{key}</div>
                <CopyButton
                  value={value}
                  label={`Copy ${key}`}
                  className="border-slate-200 bg-white text-slate-950 hover:bg-slate-50"
                />
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-600">{value}</p>
            </div>
          ))}
        </div>
      </div>
    </ReportSection>
  );
}
