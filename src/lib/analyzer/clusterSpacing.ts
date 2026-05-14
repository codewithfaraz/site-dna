import type { ElementSnapshot, SpacingExtraction } from "@/src/lib/analyzer/types";
import { detectScaleType, parsePxValues, pickTopTokens } from "@/src/lib/analyzer/utils";

export function clusterSpacing(elements: ElementSnapshot[]): SpacingExtraction {
  const marginValues = elements.flatMap((element) => parsePxValues(element.margin));
  const paddingValues = elements.flatMap((element) => parsePxValues(element.padding));
  const gapValues = elements.flatMap((element) => parsePxValues(element.gap));
  const combined = [...marginValues, ...paddingValues, ...gapValues];

  return {
    spacingScale: pickTopTokens(combined, 12),
    scaleType: detectScaleType(combined),
    commonMargin: pickTopTokens(marginValues, 8),
    commonPadding: pickTopTokens(paddingValues, 8),
    commonGap: pickTopTokens(gapValues, 6),
    notes: [
      `Most frequent spacing values were derived from ${combined.length} visible spacing measurements.`,
      gapValues.length > 0
        ? `Gap utilities cluster around ${pickTopTokens(gapValues, 4).join(", ")}.`
        : "Gap-based layout spacing was limited; padding and margin dominate the rhythm.",
    ],
  };
}
