import type { SiteScanResult } from "@/src/lib/scans/types";

export function toMarkdownReport(scan: SiteScanResult): string {
  const report = scan.report;
  const extraction = scan.rawExtraction;

  if (!report || !extraction) {
    return `# SiteDNA Design Intelligence Report

## Website
URL: ${scan.normalizedUrl}
Date: ${new Date(scan.createdAt).toISOString()}

## Summary
This scan did not complete successfully.
`;
  }

  return `# SiteDNA Design Intelligence Report

## Website
URL: ${scan.normalizedUrl}
Date: ${new Date(scan.createdAt).toISOString()}

## Summary
${report.summary}

## Typography
Primary fonts: ${report.typographyInsights.primaryFonts.join(", ")}
Scale: ${report.typographyInsights.scaleDescription}

## Colors
Palette: ${report.colorSystem.palette.join(", ")}
Primary: ${report.colorSystem.primary}
Background: ${report.colorSystem.background}
Text: ${report.colorSystem.text}
Accent: ${report.colorSystem.accent}

## Spacing
Detected scale: ${report.spacingSystem.detectedScale.join(", ")}
Scale type: ${report.spacingSystem.scaleType}

## Layout
Layout type: ${report.layoutInsights.layoutType}
Container strategy: ${report.layoutInsights.containerStrategy}
Grid strategy: ${report.layoutInsights.gridStrategy}

## Components
Detected components: ${report.componentInsights.detectedComponents.join(", ")}

## Responsive Behavior
${report.responsiveInsights.breakpoints
  .map((breakpoint) => `- ${breakpoint.width}px: ${breakpoint.changes.join("; ")}`)
  .join("\n")}

## Motion
${report.motionInsights.motionStyle}

## AI Recreation Prompt
${report.aiRecreationPrompt}

## Tailwind Theme Suggestion
\`\`\`ts
${JSON.stringify(report.tailwindThemeSuggestion, null, 2)}
\`\`\`

## Raw Extraction Notes
Colors: ${extraction.colors.notes.join(" ")}
Typography: ${extraction.typography.notes.join(" ")}
Spacing: ${extraction.spacing.notes.join(" ")}
`;
}
