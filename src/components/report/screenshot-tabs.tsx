"use client";
/* eslint-disable @next/next/no-img-element */

import { Monitor, Smartphone, Tablet } from "lucide-react";
import { useState } from "react";

type ScreenshotTabsProps = {
  screenshots: {
    desktop?: string;
    tablet?: string;
    mobile?: string;
  };
};

const TABS = [
  { key: "desktop", label: "Desktop", icon: Monitor },
  { key: "tablet", label: "Tablet", icon: Tablet },
  { key: "mobile", label: "Mobile", icon: Smartphone },
] as const;

const VIEWPORT_FRAME_STYLES = {
  desktop: "w-full max-w-none",
  tablet: "mx-auto w-full max-w-[820px]",
  mobile: "mx-auto w-full max-w-[440px]",
} as const;

const VIEWPORT_SURFACE_STYLES = {
  desktop: "p-3 sm:p-4",
  tablet: "p-4 sm:p-5",
  mobile: "p-4 sm:p-6",
} as const;

export function ScreenshotTabs({ screenshots }: ScreenshotTabsProps) {
  const availableTabs = TABS.filter((tab) => screenshots[tab.key]);
  const [active, setActive] = useState<(typeof TABS)[number]["key"]>(
    availableTabs[0]?.key ?? "desktop",
  );

  const activeScreenshot = screenshots[active];

  return (
    <div className="rounded-[32px] border border-slate-200/80 bg-white/90 p-4 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.35)] backdrop-blur">
      <div className="flex flex-wrap gap-2">
        {availableTabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActive(tab.key)}
              className={[
                "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition",
                active === tab.key
                  ? "bg-slate-950 text-white"
                  : "border border-slate-200 bg-slate-50 text-slate-700 hover:bg-white",
              ].join(" ")}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeScreenshot ? (
        <div
          className={[
            "mt-4 rounded-[28px] border border-slate-200 bg-[linear-gradient(180deg,#f8fafc_0%,#eef2f7_100%)]",
            VIEWPORT_SURFACE_STYLES[active],
          ].join(" ")}
        >
          <div className={VIEWPORT_FRAME_STYLES[active]}>
            <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_24px_50px_-36px_rgba(15,23,42,0.3)]">
              <img
                src={activeScreenshot}
                alt={`${active} screenshot`}
                className="block h-auto max-h-[72vh] w-full object-contain object-top"
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-4 rounded-[28px] border border-dashed border-slate-300 bg-slate-50 p-10 text-center text-sm text-slate-500">
          Screenshot unavailable for this viewport.
        </div>
      )}
    </div>
  );
}
