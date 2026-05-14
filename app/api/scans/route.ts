import { NextResponse } from "next/server";

import { generateDesignReportWithGemini } from "@/src/lib/ai/gemini";
import { analyzeWebsite, WebsiteAnalysisError } from "@/src/lib/analyzer/analyzeWebsite";
import { validateAndNormalizePublicUrl, UrlSafetyError } from "@/src/lib/analyzer/urlSafety";
import { CreateScanRequestSchema } from "@/src/lib/schemas/scanRequest";
import type { SiteScanResult } from "@/src/lib/scans/types";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = CreateScanRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: parsed.error.issues[0]?.message ?? "Enter a valid website URL.",
        },
        { status: 400 },
      );
    }

    const safeUrl = await validateAndNormalizePublicUrl(parsed.data.url);
    const extraction = await analyzeWebsite(safeUrl.inputUrl, safeUrl.normalizedUrl);
    const report = await generateDesignReportWithGemini({
      url: extraction.normalizedUrl,
      domain: extraction.domain,
      extraction: extraction.rawExtraction,
      screenshots: extraction.screenshots,
    });

    const now = new Date().toISOString();
    const scan: SiteScanResult = {
      id: crypto.randomUUID(),
      url: safeUrl.inputUrl,
      normalizedUrl: extraction.normalizedUrl,
      domain: extraction.domain,
      status: "completed",
      screenshots: extraction.screenshots,
      rawExtraction: extraction.rawExtraction,
      report,
      createdAt: now,
      updatedAt: now,
    };

    return NextResponse.json({
      success: true,
      scan,
    });
  } catch (error) {
    console.error("POST /api/scans failed", error);

    const statusCode =
      error instanceof UrlSafetyError
        ? 400
        : error instanceof WebsiteAnalysisError
          ? 422
          : 500;

    return NextResponse.json(
      {
        success: false,
        message: getPublicErrorMessage(error),
      },
      { status: statusCode },
    );
  }
}

function getPublicErrorMessage(error: unknown) {
  if (error instanceof UrlSafetyError) {
    return error.message;
  }
  if (error instanceof WebsiteAnalysisError) {
    return error.message;
  }
  if (
    error instanceof Error &&
    (error.message.includes("GOOGLE_CLOUD_PROJECT") ||
      error.message.includes("VERTEX_AI_API") ||
      error.message.includes("Vertex AI credentials"))
  ) {
    return "Gemini Vertex AI is not configured yet. Add VERTEX_AI_API or configure GOOGLE_CLOUD_PROJECT with ADC.";
  }
  if (error instanceof Error) {
    return error.message || "SiteDNA could not complete that scan.";
  }
  return "SiteDNA could not complete that scan.";
}
