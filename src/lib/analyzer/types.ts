export type ViewportName = "desktop" | "tablet" | "mobile";

export type ViewportConfig = {
  name: ViewportName;
  width: number;
  height: number;
};

export type ElementSnapshot = {
  tagName: string;
  className: string;
  id: string;
  textSample: string;
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  fontFamily: string;
  fontSize: string;
  fontWeight: string;
  lineHeight: string;
  letterSpacing: string;
  color: string;
  backgroundColor: string;
  borderColor: string;
  borderRadius: string;
  boxShadow: string;
  margin: string;
  padding: string;
  display: string;
  position: string;
  flexDirection: string;
  flexWrap: string;
  justifyContent: string;
  alignItems: string;
  gridTemplateColumns: string;
  gridTemplateRows: string;
  gap: string;
  width: string;
  height: string;
  maxWidth: string;
  transform: string;
  transitionProperty: string;
  transitionDuration: string;
  transitionTimingFunction: string;
  animationName: string;
  animationDuration: string;
  animationTimingFunction: string;
};

export type ViewportSignals = {
  navLinkCount: number;
  heroLayout: "row" | "column" | "unknown";
  averageBodyFontSize: number | null;
  averageGap: number | null;
  gridColumnCounts: number[];
  containerWidths: number[];
  sectionCount: number;
};

export type ViewportDomSnapshot = {
  viewport: ViewportName;
  width: number;
  height: number;
  metadata: {
    title: string;
    description: string;
    language: string;
    scrollHeight: number;
  };
  componentHints: string[];
  elements: ElementSnapshot[];
  signals: ViewportSignals;
};

export type FrequencyValue = {
  value: string;
  count: number;
};

export type TypographyExtraction = {
  primaryFonts: string[];
  fontUsage: FrequencyValue[];
  fontSizeScale: string[];
  fontWeightScale: string[];
  lineHeightScale: string[];
  letterSpacingScale: string[];
  headingScale: string[];
  bodyScale: string[];
  notes: string[];
};

export type ColorExtraction = {
  primaryCandidates: string[];
  backgroundCandidates: string[];
  textCandidates: string[];
  accentCandidates: string[];
  fullPalette: string[];
  notes: string[];
};

export type SpacingExtraction = {
  spacingScale: string[];
  scaleType: "4px" | "8px" | "mixed" | "unknown";
  commonMargin: string[];
  commonPadding: string[];
  commonGap: string[];
  notes: string[];
};

export type RadiusExtraction = {
  scale: string[];
  notes: string[];
};

export type ShadowExtraction = {
  commonShadows: FrequencyValue[];
  notes: string[];
};

export type LayoutExtraction = {
  layoutType: string;
  patterns: string[];
  containerWidths: string[];
  gridColumns: string[];
  notes: string[];
  viewportSummaries: Array<{
    viewport: ViewportName;
    width: number;
    sectionCount: number;
    heroLayout: "row" | "column" | "unknown";
    gridColumnCounts: number[];
  }>;
};

export type BreakpointInsight = {
  width: number;
  changes: string[];
};

export type MotionExtraction = {
  transitionProperties: string[];
  durations: string[];
  easing: string[];
  animatedElements: string[];
  likelyMotionStyle: string;
  notes: string[];
};

export type ComponentExtraction = {
  detected: string[];
  patterns: string[];
  reusablePatterns: string[];
};

export type RawWebsiteExtraction = {
  metadata: {
    domain: string;
    title: string;
    description: string;
    language: string;
    analyzedAt: string;
    timeTakenMs: number;
    warnings: string[];
    viewportStats: Array<{
      viewport: ViewportName;
      width: number;
      height: number;
      extractedElementCount: number;
      scrollHeight: number;
    }>;
  };
  typography: TypographyExtraction;
  colors: ColorExtraction;
  spacing: SpacingExtraction;
  radius: RadiusExtraction;
  shadows: ShadowExtraction;
  layout: LayoutExtraction;
  breakpoints: BreakpointInsight[];
  motion: MotionExtraction;
  components: ComponentExtraction;
};

export type WebsiteExtractionResult = {
  url: string;
  normalizedUrl: string;
  domain: string;
  screenshots: Record<ViewportName, string>;
  rawExtraction: RawWebsiteExtraction;
};
