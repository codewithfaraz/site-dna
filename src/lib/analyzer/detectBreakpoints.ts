import type { BreakpointInsight, ViewportDomSnapshot } from "@/src/lib/analyzer/types";
import { average } from "@/src/lib/analyzer/utils";

export function detectBreakpoints(viewports: ViewportDomSnapshot[]): BreakpointInsight[] {
  const ordered = [...viewports].sort((a, b) => b.width - a.width);
  const breakpoints: BreakpointInsight[] = [];

  for (let index = 1; index < ordered.length; index += 1) {
    const previous = ordered[index - 1];
    const current = ordered[index];
    const changes: string[] = [];
    const previousGrid = Math.max(...previous.signals.gridColumnCounts, 1);
    const currentGrid = Math.max(...current.signals.gridColumnCounts, 1);

    if (currentGrid < previousGrid) {
      changes.push(`Grid layouts reduced from roughly ${previousGrid} columns to ${currentGrid} columns.`);
    }

    if (previous.signals.heroLayout !== "unknown" && current.signals.heroLayout !== previous.signals.heroLayout) {
      changes.push(`Hero layout shifts from ${previous.signals.heroLayout} to ${current.signals.heroLayout}.`);
    }

    if (current.signals.navLinkCount < previous.signals.navLinkCount) {
      changes.push("Navigation appears more condensed, suggesting a collapsed or simplified menu.");
    }

    const fontDelta = compareNumbers(previous.signals.averageBodyFontSize, current.signals.averageBodyFontSize);
    if (fontDelta <= -1) {
      changes.push("Body typography scales down on smaller screens.");
    }

    const gapDelta = compareNumbers(previous.signals.averageGap, current.signals.averageGap);
    if (gapDelta <= -4) {
      changes.push("Spacing tightens on smaller breakpoints.");
    }

    if (current.signals.sectionCount < previous.signals.sectionCount) {
      changes.push("Section density drops in the smaller viewport, likely through stacking or hidden detail.");
    }

    if (changes.length > 0) {
      breakpoints.push({
        width: current.width,
        changes,
      });
    }
  }

  if (breakpoints.length === 0) {
    breakpoints.push({
      width: average(viewports.map((viewport) => viewport.width)) ?? 768,
      changes: ["Responsive changes were subtle across the sampled viewports."],
    });
  }

  return breakpoints;
}

function compareNumbers(previous: number | null, current: number | null): number {
  if (previous === null || current === null) {
    return 0;
  }

  return current - previous;
}
