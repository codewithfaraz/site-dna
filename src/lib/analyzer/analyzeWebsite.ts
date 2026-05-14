import "server-only";

import type { Browser } from "playwright";

import { clusterColors } from "@/src/lib/analyzer/clusterColors";
import { clusterSpacing } from "@/src/lib/analyzer/clusterSpacing";
import { clusterTypography } from "@/src/lib/analyzer/clusterTypography";
import { detectBreakpoints } from "@/src/lib/analyzer/detectBreakpoints";
import { extractDomDesignData } from "@/src/lib/analyzer/extractDomDesignData";
import type {
  ComponentExtraction,
  LayoutExtraction,
  MotionExtraction,
  RawWebsiteExtraction,
  ViewportConfig,
  ViewportDomSnapshot,
  WebsiteExtractionResult,
} from "@/src/lib/analyzer/types";
import {
  cleanString,
  clampList,
  isCardLikeElement,
  normalizeShadow,
  parsePxValues,
  pickTopTokens,
  pxToToken,
  toFrequencyMap,
} from "@/src/lib/analyzer/utils";

const VIEWPORTS: ViewportConfig[] = [
  { name: "desktop", width: 1440, height: 1000 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "mobile", width: 390, height: 844 },
];

const DEFAULT_TIMEOUT_MS = 45_000;

export class WebsiteAnalysisError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "WebsiteAnalysisError";
  }
}

export async function analyzeWebsite(
  url: string,
  normalizedUrl = url,
): Promise<WebsiteExtractionResult> {
  const analysisStartedAt = Date.now();
  const browser = await launchAnalysisBrowser();
  const snapshots: ViewportDomSnapshot[] = [];
  const screenshots = {
    desktop: "",
    tablet: "",
    mobile: "",
  } as WebsiteExtractionResult["screenshots"];
  const warnings: string[] = [];
  const timeoutMs = Number.parseInt(
    process.env.SITE_ANALYSIS_TIMEOUT_MS ?? `${DEFAULT_TIMEOUT_MS}`,
    10,
  );
  const perViewportTimeout = Math.max(10_000, Math.floor(timeoutMs / VIEWPORTS.length));

  try {
    for (const viewport of VIEWPORTS) {
      const context = await browser.newContext({
        viewport: { width: viewport.width, height: viewport.height },
        isMobile: viewport.name === "mobile",
        deviceScaleFactor: 1,
        locale: "en-US",
        colorScheme: "light",
      });

      try {
        await context.route("**/*", (route) => {
          const resourceType = route.request().resourceType();
          if (resourceType === "media") {
            return route.abort();
          }
          return route.continue();
        });

        const page = await context.newPage();
        page.setDefaultNavigationTimeout(perViewportTimeout);
        page.setDefaultTimeout(perViewportTimeout);

        await page.goto(normalizedUrl, {
          waitUntil: "domcontentloaded",
          timeout: perViewportTimeout,
        });

        try {
          await page.waitForLoadState("networkidle", { timeout: 5_000 });
        } catch {
          warnings.push(
            `${viewport.name} viewport hit the network-idle wait limit; continuing with the rendered DOM.`,
          );
        }

        await page.waitForTimeout(700);
        const snapshot = await extractDomDesignData(page, viewport.name, viewport.width, viewport.height);
        snapshots.push(snapshot);

        const screenshotBuffer = await page.screenshot({
          type: "jpeg",
          quality: 65,
          fullPage: false,
          animations: "disabled",
        });
        screenshots[viewport.name] = `data:image/jpeg;base64,${screenshotBuffer.toString("base64")}`;
      } finally {
        await context.close();
      }
    }
  } catch (error) {
    console.error("SiteDNA analysis error", error);
    throw new WebsiteAnalysisError(getAnalysisErrorMessage(error));
  } finally {
    await browser.close();
  }

  const allElements = snapshots.flatMap((snapshot) => snapshot.elements);
  if (allElements.length < 12) {
    throw new WebsiteAnalysisError(
      "The website rendered, but there was too little visible design data to build a useful report.",
    );
  }

  const typography = clusterTypography(allElements);
  const colors = clusterColors(allElements);
  const spacing = clusterSpacing(allElements);
  const radius = extractRadius(allElements);
  const shadows = extractShadows(allElements);
  const layout = extractLayout(snapshots);
  const breakpoints = detectBreakpoints(snapshots);
  const motion = extractMotion(allElements);
  const components = extractComponents(snapshots);

  const desktopSnapshot = snapshots.find((snapshot) => snapshot.viewport === "desktop") ?? snapshots[0];
  const rawExtraction: RawWebsiteExtraction = {
    metadata: {
      domain: new URL(normalizedUrl).hostname,
      title: desktopSnapshot?.metadata.title ?? "",
      description: desktopSnapshot?.metadata.description ?? "",
      language: desktopSnapshot?.metadata.language ?? "",
      analyzedAt: new Date().toISOString(),
      timeTakenMs: Date.now() - analysisStartedAt,
      warnings,
      viewportStats: snapshots.map((snapshot) => ({
        viewport: snapshot.viewport,
        width: snapshot.width,
        height: snapshot.height,
        extractedElementCount: snapshot.elements.length,
        scrollHeight: snapshot.metadata.scrollHeight,
      })),
    },
    typography,
    colors,
    spacing,
    radius,
    shadows,
    layout,
    breakpoints,
    motion,
    components,
  };

  return {
    url,
    normalizedUrl,
    domain: new URL(normalizedUrl).hostname,
    screenshots,
    rawExtraction,
  };
}

async function launchAnalysisBrowser(): Promise<Browser> {
  if (isServerlessChromiumRuntime()) {
    const [{ chromium: playwrightChromium }, chromium] = await Promise.all([
      import("playwright-core"),
      import("@sparticuz/chromium"),
    ]);

    return playwrightChromium.launch({
      args: chromium.default.args,
      executablePath: await chromium.default.executablePath(),
      headless: true,
    });
  }

  const { chromium } = await import("playwright");
  return chromium.launch({ headless: true });
}

function isServerlessChromiumRuntime() {
  return Boolean(process.env.VERCEL || process.env.AWS_REGION || process.env.AWS_LAMBDA_FUNCTION_NAME);
}

function extractRadius(elements: ViewportDomSnapshot["elements"]) {
  const values = elements.flatMap((element) => parsePxValues(element.borderRadius));
  return {
    scale: pickTopTokens(values, 8),
    notes: values.length > 0 ? ["Radius scale inferred from visible cards, buttons, and inputs."] : ["Rounded corners were minimally used."],
  };
}

function extractShadows(elements: ViewportDomSnapshot["elements"]) {
  const commonShadows = toFrequencyMap(
    elements
      .map((element) => normalizeShadow(element.boxShadow))
      .filter((value) => value && value !== "none"),
  ).slice(0, 8);

  return {
    commonShadows,
    notes:
      commonShadows.length > 0
        ? ["Shadows are present on visible interactive or card-like surfaces."]
        : ["Shadow usage is sparse or absent."],
  };
}

function extractLayout(snapshots: ViewportDomSnapshot[]): LayoutExtraction {
  const desktop = snapshots.find((snapshot) => snapshot.viewport === "desktop") ?? snapshots[0];
  const patterns = new Set<string>();
  const gridColumns = new Set<string>();
  const containerWidths = new Set<string>();

  for (const snapshot of snapshots) {
    if (snapshot.signals.gridColumnCounts.some((count) => count >= 3)) {
      patterns.add("card grid");
    }
    if (snapshot.elements.some((element) => element.tagName === "header" || element.tagName === "nav")) {
      patterns.add("navbar");
    }
    if (snapshot.elements.some((element) => element.tagName === "footer")) {
      patterns.add("footer");
    }
    if (snapshot.componentHints.includes("hero")) {
      patterns.add("hero section");
    }
    if (snapshot.elements.some((element) => element.display === "grid")) {
      patterns.add("grid layout");
    }
    if (snapshot.elements.some((element) => element.display === "flex" && element.flexDirection === "row")) {
      patterns.add("flex row");
    }
    if (snapshot.elements.some((element) => element.display === "flex" && element.flexDirection === "column")) {
      patterns.add("flex column");
    }
    if (snapshot.signals.containerWidths.length > 0) {
      for (const width of snapshot.signals.containerWidths) {
        containerWidths.add(pxToToken(Math.round(width)));
      }
    }
    for (const count of snapshot.signals.gridColumnCounts) {
      gridColumns.add(String(count));
    }
  }

  if (desktop.elements.length < 80) {
    patterns.add("minimal interface");
  } else if (desktop.elements.length > 150) {
    patterns.add("dense content layout");
  } else {
    patterns.add("balanced section rhythm");
  }

  return {
    layoutType:
      desktop.signals.gridColumnCounts.length > 0
        ? "Responsive marketing layout with grid-driven sections"
        : "Responsive stacked layout with flex-based sections",
    patterns: Array.from(patterns),
    containerWidths: clampList(Array.from(containerWidths).sort((a, b) => parseFloat(a) - parseFloat(b)), 8),
    gridColumns: clampList(Array.from(gridColumns).sort((a, b) => Number(a) - Number(b)), 6),
    notes: [
      desktop.signals.containerWidths.length > 0
        ? "Container widths suggest deliberate max-width constraints for large screens."
        : "Container constraints were subtle in the extracted DOM.",
      desktop.signals.heroLayout !== "unknown"
        ? `Hero region behaves like a ${desktop.signals.heroLayout}-oriented layout on desktop.`
        : "Hero container behavior was inferred from visible section structure.",
    ],
    viewportSummaries: snapshots.map((snapshot) => ({
      viewport: snapshot.viewport,
      width: snapshot.width,
      sectionCount: snapshot.signals.sectionCount,
      heroLayout: snapshot.signals.heroLayout,
      gridColumnCounts: snapshot.signals.gridColumnCounts,
    })),
  };
}

function extractMotion(elements: ViewportDomSnapshot["elements"]): MotionExtraction {
  const transitionProperties = toFrequencyMap(
    elements
      .map((element) => cleanString(element.transitionProperty))
      .filter((value) => value && value !== "all 0s ease 0s" && value !== "none"),
  )
    .map((entry) => entry.value)
    .slice(0, 8);
  const durations = toFrequencyMap(
    elements
      .flatMap((element) => cleanString(element.transitionDuration).split(","))
      .map((value) => value.trim())
      .filter((value) => value && value !== "0s"),
  )
    .map((entry) => entry.value)
    .slice(0, 8);
  const easing = toFrequencyMap(
    elements
      .flatMap((element) => cleanString(element.transitionTimingFunction).split(","))
      .map((value) => value.trim())
      .filter((value) => value && value !== "ease"),
  )
    .map((entry) => entry.value)
    .slice(0, 8);
  const animatedElements = clampList(
    elements
      .filter(
        (element) =>
          element.animationName !== "none" ||
          (element.transitionDuration !== "0s" && element.transitionProperty !== "none"),
      )
      .map((element) => `${element.tagName}${element.className ? `.${element.className.split(" ")[0]}` : ""}`),
    12,
  );

  return {
    transitionProperties,
    durations,
    easing,
    animatedElements,
    likelyMotionStyle:
      durations.length > 0
        ? "Subtle interaction-driven transitions with lightweight motion."
        : "Motion usage appears minimal.",
    notes: [
      durations.length > 0
        ? `Most common transition durations include ${durations.slice(0, 3).join(", ")}.`
        : "The visible DOM exposed very little transition timing information.",
    ],
  };
}

function extractComponents(snapshots: ViewportDomSnapshot[]): ComponentExtraction {
  const allElements = snapshots.flatMap((snapshot) => snapshot.elements);
  const detected = new Set<string>(snapshots.flatMap((snapshot) => snapshot.componentHints));

  if (allElements.some((element) => isCardLikeElement(element))) {
    detected.add("feature card");
  }
  if (allElements.some((element) => element.tagName === "button")) {
    detected.add("CTA button");
  }
  if (allElements.some((element) => element.tagName === "img")) {
    detected.add("logo area");
  }

  const detectedList = Array.from(detected);

  return {
    detected: detectedList,
    patterns: [
      detected.has("navbar") ? "Header-first navigation pattern" : "Navigation pattern is lightweight or embedded.",
      detected.has("hero") ? "Hero-led top-of-page composition" : "Top-of-page content is more modular than hero-driven.",
      detected.has("feature card")
        ? "Card-based reusable content blocks"
        : "Content blocks rely on simple stacked sections more than cards.",
    ],
    reusablePatterns: [
      detected.has("CTA button") ? "Reusable prominent button variant" : "Minimal button system",
      detected.has("feature card") ? "Card component with surface, radius, and shadow tokens" : "Section wrapper component",
      detected.has("footer") ? "Footer with grouped navigation/content columns" : "Compact footer",
    ],
  };
}

function getAnalysisErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    if (error.message.includes("ERR_CONNECTION")) {
      return "The website could not be reached from the analyzer.";
    }
    if (error.message.toLowerCase().includes("timeout")) {
      return "The website took too long to load for analysis.";
    }
    if (error.message.toLowerCase().includes("net::err")) {
      return "The website could not be opened successfully.";
    }
    return error.message;
  }

  return "SiteDNA could not analyze that website.";
}
