import type { ElementSnapshot, TypographyExtraction } from "@/src/lib/analyzer/types";
import {
  normalizeFontFamily,
  parsePxValues,
  pickTopTokens,
  pxToToken,
  toFrequencyMap,
} from "@/src/lib/analyzer/utils";

const HEADING_TAGS = new Set(["h1", "h2", "h3", "h4", "h5", "h6"]);
const BODY_TAGS = new Set(["p", "li", "a", "button", "input", "textarea", "label", "span"]);

export function clusterTypography(elements: ElementSnapshot[]): TypographyExtraction {
  const fontFamilies = elements
    .map((element) => normalizeFontFamily(element.fontFamily))
    .filter(Boolean);
  const fontUsage = toFrequencyMap(fontFamilies).slice(0, 8);
  const fontSizes = elements.flatMap((element) => parsePxValues(element.fontSize));
  const lineHeights = elements.flatMap((element) => parsePxValues(element.lineHeight));
  const letterSpacing = elements.flatMap((element) => parsePxValues(element.letterSpacing));
  const fontWeights = toFrequencyMap(elements.map((element) => element.fontWeight)).slice(0, 8);
  const headingScale = elements
    .filter((element) => HEADING_TAGS.has(element.tagName))
    .flatMap((element) => parsePxValues(element.fontSize))
    .sort((a, b) => b - a)
    .slice(0, 6)
    .map(pxToToken);
  const bodyScale = elements
    .filter((element) => BODY_TAGS.has(element.tagName))
    .flatMap((element) => parsePxValues(element.fontSize))
    .sort((a, b) => a - b)
    .slice(0, 6)
    .map(pxToToken);

  return {
    primaryFonts: fontUsage.map((entry) => entry.value).slice(0, 4),
    fontUsage,
    fontSizeScale: pickTopTokens(fontSizes, 10),
    fontWeightScale: fontWeights.map((entry) => entry.value),
    lineHeightScale: pickTopTokens(lineHeights, 10),
    letterSpacingScale: pickTopTokens(letterSpacing, 8),
    headingScale,
    bodyScale,
    notes: [
      fontUsage[0]
        ? `Primary font usage is led by ${fontUsage[0].value}.`
        : "Font family detection was limited.",
      headingScale.length > 0
        ? `Visible heading sizes ranged around ${headingScale.join(", ")}.`
        : "Heading scale could not be strongly inferred.",
    ],
  };
}
