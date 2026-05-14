# SiteDNA

AI-powered design intelligence for live websites.

SiteDNA opens a public website in Playwright, captures responsive screenshots, extracts design-system data from the live DOM/CSS, and sends both the structured extraction data and inline screenshots to Gemini on Vertex AI. The current MVP is stateless: reports are returned immediately and kept in the active browser session instead of being saved to a database.

## Install

```bash
npm install
npx playwright install chromium
```

Dependencies used by the MVP:

- `@google/genai`
- `playwright`
- `zod`
- `lucide-react`

## Environment

Copy `.env.example` to `.env` and fill in:

```bash
VERTEX_AI_API=
GOOGLE_CLOUD_PROJECT=
GOOGLE_CLOUD_LOCATION=global
GOOGLE_GENAI_USE_VERTEXAI=true
GEMINI_MODEL=gemini-3.1-pro-preview
GEMINI_FALLBACK_MODEL=gemini-2.5-flash
SITE_ANALYSIS_TIMEOUT_MS=45000
```

You can use either:

- `VERTEX_AI_API` for API-key based Vertex access
- `GOOGLE_CLOUD_PROJECT` plus Application Default Credentials

For local ADC access:

```bash
gcloud auth application-default login
```

## Run

```bash
npm run dev
```

Open `http://localhost:3000`.

## Notes

- All Gemini calls run server-side only.
- Playwright screenshots stay in memory and are sent to Gemini as inline image parts.
- Reports are stored only in the current browser session for now.
- `POST /api/scans` currently runs synchronously; move it to a queue for production workloads.
