import type { Page } from "playwright";

import type { ViewportDomSnapshot, ViewportName } from "@/src/lib/analyzer/types";

export async function extractDomDesignData(
  page: Page,
  viewport: ViewportName,
  width: number,
  height: number,
): Promise<ViewportDomSnapshot> {
  return page.evaluate(
    ({ viewportName, viewportWidth, viewportHeight }) => {
      const selector = [
        "body",
        "header",
        "nav",
        "main",
        "section",
        "article",
        "footer",
        "h1",
        "h2",
        "h3",
        "h4",
        "h5",
        "h6",
        "p",
        "a",
        "button",
        "input",
        "textarea",
        "select",
        "img",
        "ul",
        "ol",
        "li",
        "[role='button']",
        "[class*='card']",
        "[class*='hero']",
        "[class*='btn']",
        "[class*='button']",
        "[class*='pricing']",
        "[class*='testimonial']",
        "[class*='feature']",
        "[class*='faq']",
        "[class*='gallery']",
      ].join(",");

      const nodeList = Array.from(document.querySelectorAll<HTMLElement>(selector));
      if (document.body && !nodeList.includes(document.body)) {
        nodeList.unshift(document.body);
      }

      const unique = Array.from(new Set(nodeList));

      const visibleElements = unique
        .filter((element) => {
          const style = window.getComputedStyle(element);
          const rect = element.getBoundingClientRect();
          return (
            style.display !== "none" &&
            style.visibility !== "hidden" &&
            Number.parseFloat(style.opacity || "1") > 0.02 &&
            rect.width >= 12 &&
            rect.height >= 12 &&
            rect.bottom >= 0 &&
            rect.top <= window.innerHeight + 200
          );
        })
        .filter((element) => {
          const tagName = element.tagName.toLowerCase();
          if (["script", "style", "meta", "link", "noscript"].includes(tagName)) {
            return false;
          }

          if (tagName === "div") {
            const className = `${element.className}`.toLowerCase();
            const hasSemanticClass =
              className.includes("card") ||
              className.includes("hero") ||
              className.includes("pricing") ||
              className.includes("feature") ||
              className.includes("cta") ||
              className.includes("container") ||
              className.includes("grid");
            const style = window.getComputedStyle(element);
            const hasVisualDesign =
              style.backgroundColor !== "rgba(0, 0, 0, 0)" ||
              style.boxShadow !== "none" ||
              style.borderRadius !== "0px";
            return hasSemanticClass || hasVisualDesign || element.children.length >= 3;
          }

          return true;
        })
        .slice(0, 220);

      const componentHints = new Set<string>();
      const nav = document.querySelector("nav, header");
      const heroCandidate = document.querySelector("section h1, main h1, article h1");
      const pricing = document.querySelector("[class*='pricing'], [id*='pricing']");
      const testimonial = document.querySelector("[class*='testimonial'], [id*='testimonial']");
      const faq = document.querySelector("[class*='faq'], [id*='faq']");
      const form = document.querySelector("form");
      const gallery = document.querySelector("[class*='gallery'], [id*='gallery']");
      const footer = document.querySelector("footer");

      if (nav) componentHints.add("navbar");
      if (heroCandidate) componentHints.add("hero");
      if (pricing) componentHints.add("pricing card");
      if (testimonial) componentHints.add("testimonial");
      if (faq) componentHints.add("faq");
      if (form) componentHints.add("form");
      if (gallery) componentHints.add("image gallery");
      if (footer) componentHints.add("footer");

      const elements = visibleElements.map((element) => {
        const style = window.getComputedStyle(element);
        const rect = element.getBoundingClientRect();
        const textSample =
          element.tagName.toLowerCase() === "img"
            ? (element.getAttribute("alt") || "").trim()
            : (element.innerText || element.textContent || "").replace(/\s+/g, " ").trim().slice(0, 140);

        if (element.tagName.toLowerCase() === "button") {
          componentHints.add("CTA button");
        }
        if (element.tagName.toLowerCase() === "img") {
          componentHints.add("logo area");
        }

        const className = `${element.className ?? ""}`;
        const lowered = className.toLowerCase();
        if (lowered.includes("card")) componentHints.add("feature card");
        if (lowered.includes("feature")) componentHints.add("feature card");
        if (lowered.includes("logo")) componentHints.add("logo area");

        return {
          tagName: element.tagName.toLowerCase(),
          className,
          id: element.id ?? "",
          textSample,
          boundingBox: {
            x: rect.x,
            y: rect.y,
            width: rect.width,
            height: rect.height,
          },
          fontFamily: style.fontFamily,
          fontSize: style.fontSize,
          fontWeight: style.fontWeight,
          lineHeight: style.lineHeight,
          letterSpacing: style.letterSpacing,
          color: style.color,
          backgroundColor: style.backgroundColor,
          borderColor: style.borderColor,
          borderRadius: style.borderRadius,
          boxShadow: style.boxShadow,
          margin: style.margin,
          padding: style.padding,
          display: style.display,
          position: style.position,
          flexDirection: style.flexDirection,
          flexWrap: style.flexWrap,
          justifyContent: style.justifyContent,
          alignItems: style.alignItems,
          gridTemplateColumns: style.gridTemplateColumns,
          gridTemplateRows: style.gridTemplateRows,
          gap: style.gap,
          width: style.width,
          height: style.height,
          maxWidth: style.maxWidth,
          transform: style.transform,
          transitionProperty: style.transitionProperty,
          transitionDuration: style.transitionDuration,
          transitionTimingFunction: style.transitionTimingFunction,
          animationName: style.animationName,
          animationDuration: style.animationDuration,
          animationTimingFunction: style.animationTimingFunction,
        };
      });

      const gridColumnCounts = elements
        .map((element) => {
          if (element.display !== "grid") {
            return 0;
          }
          const template = element.gridTemplateColumns;
          if (!template || template === "none") {
            return 0;
          }
          return template
            .split(" ")
            .map((value) => value.trim())
            .filter(Boolean).length;
        })
        .filter((count) => count > 0);

      const heroContainer = heroCandidate?.closest("section, main, article, div");
      const heroStyle = heroContainer ? window.getComputedStyle(heroContainer) : null;

      const bodyFontSamples = elements
        .filter((element) => ["p", "a", "button", "li", "input"].includes(element.tagName))
        .map((element) => Number.parseFloat(element.fontSize))
        .filter((value) => Number.isFinite(value));

      const gapSamples = elements
        .map((element) => Number.parseFloat(element.gap))
        .filter((value) => Number.isFinite(value) && value > 0);

      const containerWidths = elements
        .map((element) => Number.parseFloat(element.maxWidth || element.width))
        .filter((value) => Number.isFinite(value) && value >= 280 && value <= 1600);

      return {
        viewport: viewportName,
        width: viewportWidth,
        height: viewportHeight,
        metadata: {
          title: document.title || "",
          description:
            document.querySelector("meta[name='description']")?.getAttribute("content")?.trim() || "",
          language: document.documentElement.lang || "",
          scrollHeight: document.documentElement.scrollHeight,
        },
        componentHints: Array.from(componentHints),
        elements,
        signals: {
          navLinkCount: Array.from((nav || document).querySelectorAll?.("a") ?? []).length,
          heroLayout:
            heroStyle?.display === "flex"
              ? heroStyle.flexDirection === "column"
                ? "column"
                : "row"
              : "unknown",
          averageBodyFontSize:
            bodyFontSamples.length > 0
              ? bodyFontSamples.reduce((sum, value) => sum + value, 0) / bodyFontSamples.length
              : null,
          averageGap:
            gapSamples.length > 0
              ? gapSamples.reduce((sum, value) => sum + value, 0) / gapSamples.length
              : null,
          gridColumnCounts,
          containerWidths,
          sectionCount: document.querySelectorAll("main section, section, article").length,
        },
      };
    },
    { viewportName: viewport, viewportWidth: width, viewportHeight: height },
  );
}
