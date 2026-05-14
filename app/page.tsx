import { BarChart3, Layers3, MonitorSmartphone, Sparkles } from "lucide-react";

import { SiteUrlForm } from "@/src/components/site-url-form";

const FEATURES = [
  {
    icon: MonitorSmartphone,
    title: "Responsive live capture",
    description: "Desktop, tablet, and mobile renders captured from a real browser session with Playwright.",
  },
  {
    icon: Layers3,
    title: "Design token extraction",
    description: "Typography, color systems, spacing, radius, shadows, layout patterns, and responsive deltas.",
  },
  {
    icon: Sparkles,
    title: "Inline Gemini vision",
    description: "Responsive screenshots are sent directly to Gemini as inline image parts, alongside structured extraction data.",
  },
  {
    icon: BarChart3,
    title: "Stateless report flow",
    description: "No database required right now. Reports stay in the current browser session for fast demos and iteration.",
  },
];

export default function Home() {
  return (
    <main className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.18),transparent_28%),radial-gradient(circle_at_left,rgba(56,189,248,0.14),transparent_32%),linear-gradient(180deg,#f8fbff_0%,#eef4fb_48%,#e2e8f0_100%)]" />
      <section className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-5 pb-16 pt-4 sm:px-8 lg:px-10">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.34em] text-cyan-600">
              SiteDNA
            </div>
            <div className="mt-2 text-sm text-slate-500">
              AI-powered design intelligence for live websites.
            </div>
          </div>
          <div className="rounded-full border border-slate-200/80 bg-white/75 px-4 py-2 text-sm text-slate-500 shadow-[0_12px_30px_-24px_rgba(15,23,42,0.45)] backdrop-blur">
            Playwright + Gemini on Vertex AI
          </div>
        </header>

        <div className="grid flex-1 items-start gap-10 pt-6 lg:grid-cols-[1.12fr_0.88fr] lg:pt-8">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-cyan-50 px-3 py-2 text-sm text-cyan-700 shadow-[0_12px_24px_-18px_rgba(14,165,233,0.45)]">
              <Sparkles className="h-4 w-4" />
              Live UI analysis, not speculative URL prompting
            </div>

            <div className="space-y-4">
              <h1 className="max-w-4xl text-5xl font-semibold tracking-[-0.05em] text-slate-950 sm:text-6xl lg:text-7xl lg:leading-[0.96]">
                Paste any public URL and extract the interface DNA behind it.
              </h1>
              <SiteUrlForm />
              <p className="max-w-3xl text-lg leading-8 text-slate-600">
                Paste any URL and instantly extract typography, colors, spacing, layout patterns,
                breakpoints, motion clues, and AI-ready prompts.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {FEATURES.map((feature) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={feature.title}
                    className="rounded-[28px] border border-slate-200/80 bg-white/72 p-5 text-slate-950 shadow-[0_24px_60px_-38px_rgba(15,23,42,0.24)] backdrop-blur"
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-100 text-cyan-700">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h2 className="mt-4 text-lg font-semibold">{feature.title}</h2>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{feature.description}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-5">
            <div className="rounded-[32px] border border-white/10 bg-slate-950/72 p-6 text-slate-100 shadow-[0_32px_90px_-45px_rgba(8,47,73,0.95)] backdrop-blur">
              <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-300">
                Example Output
              </div>
              <div className="mt-4 space-y-4">
                <div className="rounded-[24px] border border-white/10 bg-white/6 p-4">
                  <div className="text-sm text-slate-400">Detected palette</div>
                  <div className="mt-3 flex gap-3">
                    {["#0F172A", "#14B8A6", "#E2E8F0", "#F8FAFC", "#334155"].map((color) => (
                      <div
                        key={color}
                        className="h-14 flex-1 rounded-2xl border border-white/10"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-[24px] border border-white/10 bg-white/6 p-4">
                    <div className="text-sm text-slate-400">Responsive insights</div>
                    <p className="mt-2 text-sm leading-6 text-slate-200">
                      Hero layout stacks on mobile, grid drops from three columns to one, spacing tightens,
                      navigation becomes more compact.
                    </p>
                  </div>
                  <div className="rounded-[24px] border border-white/10 bg-white/6 p-4">
                    <div className="text-sm text-slate-400">Prompt export</div>
                    <p className="mt-2 text-sm leading-6 text-slate-200">
                      Generate recreation prompts for Cursor, v0, Lovable, Bolt, and Figma in one scan.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[32px] border border-slate-200/70 bg-white/88 p-6 shadow-[0_24px_60px_-36px_rgba(15,23,42,0.4)] backdrop-blur">
              <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-700">
                Stateless Mode
              </div>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                Reports are session-based for now
              </h2>
              <div className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
                <p>
                  SiteDNA currently skips persistent storage to avoid MongoDB setup friction during demos.
                </p>
                <p>
                  After a scan completes, the report is kept in the current browser session and opened directly on the report route.
                </p>
                <p>
                  If you refresh in a new browser or clear the session, rerun the scan to regenerate the report.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
