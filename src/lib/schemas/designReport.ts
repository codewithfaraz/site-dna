import { z } from "zod";

import type { RawWebsiteExtraction } from "@/src/lib/analyzer/types";

const stringMapSchema = z.record(z.string(), z.string());
const stringArrayMapSchema = z.record(z.string(), z.array(z.string()));

export const DesignReportSchema = z.object({
  summary: z.string().min(1),
  visualStyle: z.object({
    overallImpression: z.string().min(1),
    designCategory: z.string().min(1),
    density: z.enum(["minimal", "balanced", "dense"]),
    personality: z.array(z.string()).default([]),
    qualityNotes: z.array(z.string()).default([]),
  }),
  typographyInsights: z.object({
    primaryFonts: z.array(z.string()).default([]),
    scaleDescription: z.string().min(1),
    hierarchyNotes: z.array(z.string()).default([]),
    recommendations: z.array(z.string()).default([]),
  }),
  colorSystem: z.object({
    paletteName: z.string().min(1),
    primary: z.string().min(1),
    background: z.string().min(1),
    surface: z.string().min(1),
    text: z.string().min(1),
    mutedText: z.string().min(1),
    accent: z.string().min(1),
    palette: z.array(z.string()).default([]),
    usageNotes: z.array(z.string()).default([]),
  }),
  spacingSystem: z.object({
    detectedScale: z.array(z.string()).default([]),
    scaleType: z.enum(["4px", "8px", "mixed", "unknown"]),
    layoutRhythm: z.string().min(1),
    notes: z.array(z.string()).default([]),
  }),
  layoutInsights: z.object({
    layoutType: z.string().min(1),
    containerStrategy: z.string().min(1),
    gridStrategy: z.string().min(1),
    hierarchy: z.array(z.string()).default([]),
    notes: z.array(z.string()).default([]),
  }),
  componentInsights: z.object({
    detectedComponents: z.array(z.string()).default([]),
    componentPatterns: z.array(z.string()).default([]),
    reusablePatterns: z.array(z.string()).default([]),
  }),
  responsiveInsights: z.object({
    breakpoints: z
      .array(
        z.object({
          width: z.number(),
          changes: z.array(z.string()).default([]),
        }),
      )
      .default([]),
    mobileStrategy: z.string().min(1),
    notes: z.array(z.string()).default([]),
  }),
  motionInsights: z.object({
    motionStyle: z.string().min(1),
    transitions: z.array(z.string()).default([]),
    animationNotes: z.array(z.string()).default([]),
  }),
  tailwindThemeSuggestion: z.object({
    colors: stringMapSchema.default({}),
    fontFamily: stringArrayMapSchema.default({}),
    spacing: stringMapSchema.default({}),
    borderRadius: stringMapSchema.default({}),
    boxShadow: stringMapSchema.default({}),
  }),
  aiRecreationPrompt: z.string().min(1),
  prompts: z.object({
    v0: z.string().min(1),
    cursor: z.string().min(1),
    lovable: z.string().min(1),
    bolt: z.string().min(1),
    figma: z.string().min(1),
  }),
  warnings: z.array(z.string()).default([]),
});

export type DesignReport = z.infer<typeof DesignReportSchema>;

export function buildFallbackDesignReport(
  extraction: RawWebsiteExtraction,
): DesignReport {
  const primary = extraction.colors.primaryCandidates[0] ?? "#111827";
  const background = extraction.colors.backgroundCandidates[0] ?? "#FFFFFF";
  const surface = extraction.colors.backgroundCandidates[1] ?? background;
  const text = extraction.colors.textCandidates[0] ?? "#111827";
  const mutedText = extraction.colors.textCandidates[1] ?? "#6B7280";
  const accent = extraction.colors.accentCandidates[0] ?? primary;
  const fonts = extraction.typography.primaryFonts;
  const spacing = extraction.spacing.spacingScale.slice(0, 8);
  const radius = extraction.radius.scale;
  const shadows = extraction.shadows.commonShadows
    .slice(0, 5)
    .reduce<Record<string, string>>((acc, shadow, index) => {
      acc[`elevation${index + 1}`] = shadow.value;
      return acc;
    }, {});
  const scaleType = extraction.spacing.scaleType;

  return {
    summary: `SiteDNA generated a fallback report for ${extraction.metadata.domain} based on extracted design tokens because Gemini output was unavailable or invalid.`,
    visualStyle: {
      overallImpression:
        extraction.layout.notes[0] ??
        "Structured interface with a production-style component system.",
      designCategory:
        extraction.layout.patterns[0] ?? "Marketing website / product landing page",
      density: extraction.layout.patterns.includes("minimal interface")
        ? "minimal"
        : extraction.layout.patterns.includes("dense content layout")
          ? "dense"
          : "balanced",
      personality: extraction.layout.patterns.slice(0, 4),
      qualityNotes: extraction.metadata.warnings,
    },
    typographyInsights: {
      primaryFonts: fonts,
      scaleDescription:
        extraction.typography.headingScale.length > 0
          ? `Heading scale: ${extraction.typography.headingScale.join(", ")}. Body scale: ${extraction.typography.bodyScale.join(", ")}.`
          : "Typography scale was inferred from visible text elements.",
      hierarchyNotes: extraction.typography.notes,
      recommendations: [
        "Preserve the dominant heading-to-body ratio when recreating the interface.",
        "Use the extracted weight and line-height values as the initial theme baseline.",
      ],
    },
    colorSystem: {
      paletteName: `${extraction.metadata.domain} inferred palette`,
      primary,
      background,
      surface,
      text,
      mutedText,
      accent,
      palette: extraction.colors.fullPalette.slice(0, 12),
      usageNotes: extraction.colors.notes,
    },
    spacingSystem: {
      detectedScale: spacing,
      scaleType,
      layoutRhythm:
        extraction.spacing.notes[0] ??
        "Spacing rhythm is based on the most common padding, margin, and gap values.",
      notes: extraction.spacing.notes,
    },
    layoutInsights: {
      layoutType: extraction.layout.layoutType,
      containerStrategy:
        extraction.layout.containerWidths.length > 0
          ? `Common container widths: ${extraction.layout.containerWidths.join(", ")}`
          : "Container widths were not strongly signaled by the extracted DOM.",
      gridStrategy:
        extraction.layout.gridColumns.length > 0
          ? `Grid patterns most often used ${extraction.layout.gridColumns.join(", ")} columns.`
          : "Grid usage appears limited or highly custom.",
      hierarchy: extraction.layout.patterns,
      notes: extraction.layout.notes,
    },
    componentInsights: {
      detectedComponents: extraction.components.detected,
      componentPatterns: extraction.components.patterns,
      reusablePatterns: extraction.components.reusablePatterns,
    },
    responsiveInsights: {
      breakpoints: extraction.breakpoints.map((breakpoint) => ({
        width: breakpoint.width,
        changes: breakpoint.changes,
      })),
      mobileStrategy:
        extraction.breakpoints[0]?.changes[0] ??
        "Responsive behavior was inferred from viewport-to-viewport layout deltas.",
      notes: extraction.breakpoints.flatMap((breakpoint) => breakpoint.changes),
    },
    motionInsights: {
      motionStyle: extraction.motion.likelyMotionStyle,
      transitions: extraction.motion.transitionProperties,
      animationNotes: extraction.motion.notes,
    },
    tailwindThemeSuggestion: {
      colors: {
        primary,
        background,
        surface,
        text,
        muted: mutedText,
        accent,
      },
      fontFamily: {
        sans: fonts.length > 0 ? fonts : ["Inter", "sans-serif"],
      },
      spacing: spacing.reduce<Record<string, string>>((acc, value, index) => {
        acc[(index + 1).toString()] = value;
        return acc;
      }, {}),
      borderRadius: radius.reduce<Record<string, string>>((acc, value, index) => {
        acc[`r${index + 1}`] = value;
        return acc;
      }, {}),
      boxShadow: shadows,
    },
    aiRecreationPrompt: `Recreate ${extraction.metadata.domain} as a polished responsive SaaS interface. Use ${fonts[0] ?? "a modern sans-serif"} for the primary typography, ${primary} as the main brand color, ${background} and ${surface} for surfaces, and spacing values around ${spacing.slice(0, 4).join(", ")}. Match the detected layout patterns: ${extraction.layout.patterns.join(", ")}.`,
    prompts: {
      v0: `Build a responsive page inspired by ${extraction.metadata.domain}. Match the typography, color palette, and component structure from the extracted report.`,
      cursor: `Generate a modern Next.js + Tailwind implementation matching the extracted design system from ${extraction.metadata.domain}.`,
      lovable: `Create a product-grade UI with the same visual style, spacing rhythm, and responsive component patterns as ${extraction.metadata.domain}.`,
      bolt: `Recreate the interface DNA of ${extraction.metadata.domain} with clean cards, responsive sections, and the detected design tokens.`,
      figma: `Document a reusable design system for ${extraction.metadata.domain} including colors, typography, spacing, radius, shadows, and responsive component variants.`,
    },
    warnings: [
      "Fallback report generated because the AI response was unavailable or could not be validated.",
      ...extraction.metadata.warnings,
    ],
  };
}
