import { AlertTriangle, CalendarDays, Globe, WandSparkles } from "lucide-react";
import Link from "next/link";

import { CopyButton } from "@/src/components/copy-button";
import { ColorPalette } from "@/src/components/report/color-palette";
import { PromptCard } from "@/src/components/report/prompt-card";
import { ReportSection } from "@/src/components/report/report-section";
import { ScreenshotTabs } from "@/src/components/report/screenshot-tabs";
import { SpacingPanel } from "@/src/components/report/spacing-panel";
import { TailwindThemeCard } from "@/src/components/report/tailwind-theme-card";
import { TypographyPanel } from "@/src/components/report/typography-panel";
import { toJsonExport } from "@/src/lib/exporters/toJsonExport";
import { toMarkdownReport } from "@/src/lib/exporters/toMarkdownReport";
import { toTailwindConfig } from "@/src/lib/exporters/toTailwindConfig";
import type { SiteScanResult } from "@/src/lib/scans/types";

type ScanReportViewProps = {
  scan: SiteScanResult;
};

export function ScanReportView({ scan }: ScanReportViewProps) {
  const markdownExport = toMarkdownReport(scan);
  const jsonExport = toJsonExport(scan);
  const tailwindExport = scan.report ? toTailwindConfig(scan.report) : "";

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#e2e8f0_100%)]">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-5 py-8 sm:px-8 lg:px-10">
        <div className="rounded-[34px] border border-slate-200/80 bg-white/92 p-6 shadow-[0_32px_80px_-45px_rgba(15,23,42,0.4)] backdrop-blur lg:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-4">
              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600 transition hover:bg-white"
              >
                Back to SiteDNA
              </Link>
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.3em] text-cyan-700">
                  Design Intelligence Report
                </div>
                <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-5xl">
                  {scan.domain}
                </h1>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">{scan.normalizedUrl}</p>
              </div>
            </div>
            <div className="grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
              <InfoPill icon={Globe} label="Source URL" value={scan.domain} />
              <InfoPill
                icon={CalendarDays}
                label="Scan Date"
                value={new Date(scan.createdAt).toLocaleString()}
              />
            </div>
          </div>
        </div>

        {scan.status === "failed" ? (
          <div className="rounded-[32px] border border-rose-200 bg-rose-50 p-6 text-rose-950 shadow-[0_20px_50px_-36px_rgba(190,24,93,0.45)]">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5" />
              <div>
                <h2 className="text-lg font-semibold">This scan failed</h2>
                <p className="mt-2 text-sm leading-6">{scan.error ?? "No error details were saved."}</p>
              </div>
            </div>
          </div>
        ) : scan.report && scan.rawExtraction ? (
          <>
            <ScreenshotTabs screenshots={scan.screenshots ?? {}} />

            <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
              <ReportSection
                eyebrow="Summary"
                title="Interface DNA Overview"
                description={scan.report.visualStyle.overallImpression}
              >
                <div className="space-y-5">
                  <p className="text-base leading-7 text-slate-700">{scan.report.summary}</p>
                  <div className="flex flex-wrap gap-2">
                    {scan.report.visualStyle.personality.map((trait) => (
                      <span
                        key={trait}
                        className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-700"
                      >
                        {trait}
                      </span>
                    ))}
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <InsightBox title="Design category" value={scan.report.visualStyle.designCategory} />
                    <InsightBox title="Density" value={scan.report.visualStyle.density} />
                  </div>
                </div>
              </ReportSection>

              <ReportSection
                eyebrow="Exports"
                title="Copy & Handoff"
                description="Use these exports directly in AI tools, documentation, or a Tailwind prototype."
              >
                <div className="grid gap-3 sm:grid-cols-2">
                  <CopyButton value={scan.report.aiRecreationPrompt} label="Copy AI Prompt" />
                  <CopyButton value={tailwindExport} label="Copy Tailwind Config" />
                  <CopyButton value={jsonExport} label="Copy JSON Report" />
                  <CopyButton value={markdownExport} label="Copy Markdown Report" />
                </div>
              </ReportSection>
            </div>

            <div className="grid gap-6 2xl:grid-cols-[1.1fr_0.9fr]">
              <ColorPalette report={scan.report} />
              <TypographyPanel report={scan.report} extraction={scan.rawExtraction} />
            </div>

            <div className="grid gap-6 2xl:grid-cols-[1.1fr_0.9fr]">
              <SpacingPanel report={scan.report} extraction={scan.rawExtraction} />
              <ReportSection
                eyebrow="Layout"
                title="Layout & Component Patterns"
                description={scan.report.layoutInsights.containerStrategy}
              >
                <div className="grid gap-5 lg:grid-cols-2">
                  <div>
                    <h3 className="text-sm font-medium text-slate-500">Layout insights</h3>
                    <div className="mt-3 space-y-2 text-sm leading-6 text-slate-700">
                      <p>{scan.report.layoutInsights.layoutType}</p>
                      <p>{scan.report.layoutInsights.gridStrategy}</p>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {scan.report.layoutInsights.hierarchy.map((item) => (
                        <span key={item} className="rounded-full bg-slate-50 px-3 py-1.5 text-sm text-slate-700">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-slate-500">Components detected</h3>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {scan.report.componentInsights.detectedComponents.map((component) => (
                        <span
                          key={component}
                          className="rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1.5 text-sm text-cyan-900"
                        >
                          {component}
                        </span>
                      ))}
                    </div>
                    <div className="mt-4 space-y-2 text-sm leading-6 text-slate-700">
                      {scan.report.componentInsights.componentPatterns.map((pattern) => (
                        <p key={pattern}>{pattern}</p>
                      ))}
                    </div>
                  </div>
                </div>
              </ReportSection>
            </div>

            <div className="grid gap-6 xl:grid-cols-2">
              <ReportSection
                eyebrow="Responsive"
                title="Breakpoint Behavior"
                description={scan.report.responsiveInsights.mobileStrategy}
              >
                <div className="space-y-4">
                  {scan.report.responsiveInsights.breakpoints.map((breakpoint) => (
                    <div key={breakpoint.width} className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                      <div className="text-sm font-semibold text-slate-900">{breakpoint.width}px</div>
                      <div className="mt-2 space-y-2 text-sm leading-6 text-slate-700">
                        {breakpoint.changes.map((change) => (
                          <p key={change}>{change}</p>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </ReportSection>

              <ReportSection
                eyebrow="Motion"
                title="Animation & Interaction Clues"
                description={scan.report.motionInsights.motionStyle}
              >
                <div className="space-y-5">
                  <div className="flex flex-wrap gap-2">
                    {scan.report.motionInsights.transitions.map((transition) => (
                      <span key={transition} className="rounded-full bg-slate-50 px-3 py-1.5 text-sm text-slate-700">
                        {transition}
                      </span>
                    ))}
                  </div>
                  <div className="space-y-2 text-sm leading-6 text-slate-700">
                    {scan.report.motionInsights.animationNotes.map((note) => (
                      <p key={note}>{note}</p>
                    ))}
                  </div>
                </div>
              </ReportSection>
            </div>

            <PromptCard report={scan.report} />
            <TailwindThemeCard report={scan.report} exportValue={tailwindExport} />

            {scan.report.warnings.length > 0 ? (
              <ReportSection
                eyebrow="Warnings"
                title="Caveats"
                description="These are the places where SiteDNA saw incomplete or ambiguous evidence."
              >
                <div className="space-y-2 text-sm leading-6 text-slate-700">
                  {scan.report.warnings.map((warning) => (
                    <p key={warning}>{warning}</p>
                  ))}
                </div>
              </ReportSection>
            ) : null}
          </>
        ) : (
          <div className="rounded-[32px] border border-amber-200 bg-amber-50 p-6 text-amber-950">
            <div className="flex items-start gap-3">
              <WandSparkles className="mt-0.5 h-5 w-5" />
              <div>
                <h2 className="text-lg font-semibold">This scan is still processing</h2>
                <p className="mt-2 text-sm leading-6">
                  Refresh this page in a moment. The analyzer has not yet produced the final report.
                </p>
              </div>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}

function InfoPill({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Globe;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-3">
      <div className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-slate-400">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <div className="mt-2 text-sm font-medium text-slate-800">{value}</div>
    </div>
  );
}

function InsightBox({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
      <div className="text-xs uppercase tracking-[0.22em] text-slate-400">{title}</div>
      <div className="mt-2 text-base font-medium text-slate-900">{value}</div>
    </div>
  );
}
