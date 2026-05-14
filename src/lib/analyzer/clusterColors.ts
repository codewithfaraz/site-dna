import type { ColorExtraction, ElementSnapshot, FrequencyValue } from "@/src/lib/analyzer/types";
import {
  clampList,
  colorDistance,
  normalizeCssColorToHex,
  relativeLuminance,
  saturationScore,
} from "@/src/lib/analyzer/utils";

type BucketName = "text" | "background" | "border";

export function clusterColors(elements: ElementSnapshot[]): ColorExtraction {
  const bucketEntries: Record<BucketName, Array<{ color: string; count: number }>> = {
    text: [],
    background: [],
    border: [],
  };
  const allCounts = new Map<string, number>();

  for (const element of elements) {
    addColor(bucketEntries.text, allCounts, element.color);
    addColor(bucketEntries.background, allCounts, element.backgroundColor);
    addColor(bucketEntries.border, allCounts, element.borderColor);
  }

  const textClusters = clusterBucket(bucketEntries.text);
  const backgroundClusters = clusterBucket(bucketEntries.background);
  const fullPalette = clusterBucket(
    Array.from(allCounts.entries()).map(([color, count]) => ({ color, count })),
  );

  const accentCandidates = fullPalette
    .filter(
      (entry) =>
        !backgroundClusters.some((background) => background.value === entry.value) &&
        !textClusters.some((text) => text.value === entry.value) &&
        saturationScore(entry.value) >= 0.18,
    )
    .slice(0, 4)
    .map((entry) => entry.value);

  const primaryCandidates = fullPalette
    .filter((entry) => saturationScore(entry.value) >= 0.12)
    .slice(0, 4)
    .map((entry) => entry.value);

  return {
    primaryCandidates:
      primaryCandidates.length > 0 ? primaryCandidates : fullPalette.slice(0, 4).map((entry) => entry.value),
    backgroundCandidates: clampList(
      backgroundClusters
        .sort((a, b) => b.count - a.count || relativeLuminance(b.value) - relativeLuminance(a.value))
        .map((entry) => entry.value),
      6,
    ),
    textCandidates: clampList(
      textClusters
        .sort((a, b) => b.count - a.count || relativeLuminance(a.value) - relativeLuminance(b.value))
        .map((entry) => entry.value),
      6,
    ),
    accentCandidates: accentCandidates.length > 0 ? accentCandidates : primaryCandidates.slice(0, 2),
    fullPalette: clampList(fullPalette.map((entry) => entry.value), 16),
    notes: [
      `Detected ${fullPalette.length} clustered colors from text, background, and border styles.`,
      backgroundClusters.length > 0
        ? `Dominant surfaces lean on ${backgroundClusters
            .slice(0, 3)
            .map((entry) => entry.value)
            .join(", ")}.`
        : "Surface colors were sparse in the visible viewport.",
    ],
  };
}

function addColor(
  bucket: Array<{ color: string; count: number }>,
  allCounts: Map<string, number>,
  input: string,
) {
  const color = normalizeCssColorToHex(input);
  if (!color) {
    return;
  }

  bucket.push({ color, count: 1 });
  allCounts.set(color, (allCounts.get(color) ?? 0) + 1);
}

function clusterBucket(
  values: Array<{ color: string; count: number }>,
  threshold = 24,
): FrequencyValue[] {
  const clusters: Array<{ base: string; count: number }> = [];

  for (const entry of values) {
    const cluster = clusters.find((candidate) => colorDistance(candidate.base, entry.color) <= threshold);
    if (cluster) {
      cluster.count += entry.count;
      continue;
    }

    clusters.push({ base: entry.color, count: entry.count });
  }

  return clusters
    .map(({ base, count }) => ({ value: base, count }))
    .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value));
}
