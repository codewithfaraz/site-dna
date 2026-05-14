import type { DesignReport } from "@/src/lib/schemas/designReport";

export function toTailwindConfig(report: DesignReport): string {
  return `export const theme = {
  extend: {
    colors: ${JSON.stringify(report.tailwindThemeSuggestion.colors, null, 2)},
    fontFamily: ${JSON.stringify(report.tailwindThemeSuggestion.fontFamily, null, 2)},
    spacing: ${JSON.stringify(report.tailwindThemeSuggestion.spacing, null, 2)},
    borderRadius: ${JSON.stringify(report.tailwindThemeSuggestion.borderRadius, null, 2)},
    boxShadow: ${JSON.stringify(report.tailwindThemeSuggestion.boxShadow, null, 2)}
  }
};`;
}
