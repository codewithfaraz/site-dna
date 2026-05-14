import "server-only";

import { createPartFromBase64, createPartFromText, GoogleGenAI } from "@google/genai";

import type { RawWebsiteExtraction, ViewportName } from "@/src/lib/analyzer/types";
import {
  buildFallbackDesignReport,
  DesignReportSchema,
  type DesignReport,
} from "@/src/lib/schemas/designReport";

type GenerateDesignReportInput = {
  url: string;
  domain: string;
  extraction: RawWebsiteExtraction;
  screenshots?: Partial<Record<ViewportName, string>>;
};

const VERTEX_AI_API = process.env.VERTEX_AI_API;
const PRIMARY_MODEL = process.env.GEMINI_MODEL ?? "gemini-3.1-pro-preview";
const FALLBACK_MODEL = process.env.GEMINI_FALLBACK_MODEL ?? "gemini-2.5-flash";

let aiClient: GoogleGenAI | null = null;

export async function generateDesignReportWithGemini(
  input: GenerateDesignReportInput,
): Promise<DesignReport> {
  const client = getAiClient();
  const models = Array.from(new Set([PRIMARY_MODEL, FALLBACK_MODEL].filter(Boolean)));
  const fallbackReport = buildFallbackDesignReport(input.extraction);
  const promptPayload = {
    url: input.url,
    domain: input.domain,
    metadata: input.extraction.metadata,
    typography: input.extraction.typography,
    colors: input.extraction.colors,
    spacing: input.extraction.spacing,
    radius: input.extraction.radius,
    shadows: input.extraction.shadows,
    layout: input.extraction.layout,
    breakpoints: input.extraction.breakpoints,
    motion: input.extraction.motion,
    components: input.extraction.components,
  };
  const parts = [
    createPartFromText(
      `Analyze the following extracted design-system JSON and the attached responsive screenshots. Return only valid JSON.\n\n${JSON.stringify(promptPayload)}`,
    ),
    ...buildScreenshotParts(input.screenshots),
  ];

  let lastError: unknown = null;
  for (const model of models) {
    try {
      const response = await client.models.generateContent({
        model,
        contents: [
          {
            role: "user",
            parts,
          },
        ],
        config: {
          responseMimeType: "application/json",
          temperature: 0.25,
          systemInstruction: DESIGN_REPORT_SYSTEM_INSTRUCTION,
        },
      });

      const text = response.text;
      if (!text) {
        throw new Error(`Model ${model} returned an empty response.`);
      }

      const parsed = parseGeminiJson(text);
      const validated = DesignReportSchema.safeParse(parsed);
      if (validated.success) {
        return validated.data;
      }

      const repaired = repairObject(parsed, fallbackReport);
      const repairedValidation = DesignReportSchema.safeParse(repaired);
      if (repairedValidation.success) {
        return repairedValidation.data;
      }

      throw new Error(
        `Model ${model} returned JSON that did not match the SiteDNA report schema.`,
      );
    } catch (error) {
      lastError = error;
    }
  }

  console.error("Gemini fallback report engaged", lastError);
  return fallbackReport;
}

function getAiClient() {
  if (aiClient) {
    return aiClient;
  }

  const project = process.env.GOOGLE_CLOUD_PROJECT;
  const location = process.env.GOOGLE_CLOUD_LOCATION ?? "global";
  const useVertex = (process.env.GOOGLE_GENAI_USE_VERTEXAI ?? "true") === "true";

  if (!useVertex) {
    throw new Error("SiteDNA requires GOOGLE_GENAI_USE_VERTEXAI=true for server-side Gemini calls.");
  }

  if (VERTEX_AI_API) {
    aiClient = new GoogleGenAI({
      vertexai: true,
      apiKey: VERTEX_AI_API,
    });

    return aiClient;
  }

  if (!project) {
    throw new Error(
      "Missing Vertex AI credentials. Set VERTEX_AI_API or configure GOOGLE_CLOUD_PROJECT with Google Cloud ADC.",
    );
  }

  aiClient = new GoogleGenAI({
    vertexai: true,
    project,
    location,
  });

  return aiClient;
}

function parseGeminiJson(rawText: string): unknown {
  const stripped = rawText
    .trim()
    .replace(/^```json/i, "")
    .replace(/^```/i, "")
    .replace(/```$/i, "")
    .trim();

  try {
    return JSON.parse(stripped);
  } catch {
    const firstBrace = stripped.indexOf("{");
    const lastBrace = stripped.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      return JSON.parse(stripped.slice(firstBrace, lastBrace + 1));
    }
    throw new Error("Gemini did not return parseable JSON.");
  }
}

function repairObject(value: unknown, fallback: DesignReport): DesignReport {
  if (!isPlainObject(value)) {
    return fallback;
  }

  return deepMergeWithFallback(fallback, value) as DesignReport;
}

function deepMergeWithFallback(fallback: unknown, value: unknown): unknown {
  if (Array.isArray(fallback)) {
    return Array.isArray(value) ? value : fallback;
  }

  if (!isPlainObject(fallback)) {
    return value ?? fallback;
  }

  const source = isPlainObject(value) ? value : {};
  const merged: Record<string, unknown> = {};

  for (const [key, fallbackValue] of Object.entries(fallback)) {
    merged[key] = deepMergeWithFallback(fallbackValue, source[key]);
  }

  return merged;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function buildScreenshotParts(screenshots?: Partial<Record<ViewportName, string>>) {
  if (!screenshots) {
    return [];
  }

  const orderedViewports: ViewportName[] = ["desktop", "tablet", "mobile"];

  return orderedViewports.flatMap((viewport) => {
    const screenshot = screenshots[viewport];
    if (!screenshot) {
      return [];
    }

    const match = screenshot.match(/^data:(.+);base64,(.+)$/);
    if (!match) {
      return [];
    }

    const mimeType = match[1] ?? "image/jpeg";
    const base64 = match[2] ?? "";

    return [
      createPartFromText(`${viewport} responsive screenshot`),
      createPartFromBase64(base64, mimeType),
    ];
  });
}

const DESIGN_REPORT_SYSTEM_INSTRUCTION = `
You are a senior product designer, frontend architect, and design system analyst.
Analyze the extracted website design data provided by SiteDNA.
Rules:
- Do not invent exact values that are not present.
- Prefer concrete observations grounded in the extracted data.
- Return only valid JSON.
- The output must match the requested schema exactly.
- If data is missing, include warnings instead of hallucinating.
- Generate practical AI prompts for recreating the interface style.
- Make the report useful for designers and frontend engineers.
- The schema fields are: summary, visualStyle, typographyInsights, colorSystem, spacingSystem, layoutInsights, componentInsights, responsiveInsights, motionInsights, tailwindThemeSuggestion, aiRecreationPrompt, prompts, warnings.
`.trim();
