import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(__dirname, "../..");

function readProjectFile(path: string): string {
  return readFileSync(resolve(root, path), "utf8");
}

describe("design system tokens", () => {
  it("uses the monochrome palette from DESIGN_SYSTEM.md", () => {
    const css = readProjectFile("src/styles/index.css");

    expect(css).toContain("--color-page: #f2f2f2;");
    expect(css).toContain("--color-surface: #ffffff;");
    expect(css).toContain("--color-surface-lower: #f6f6f6;");
    expect(css).toContain("--color-text: #0a0a0a;");
    expect(css).toContain("--color-text-secondary: #444444;");
    expect(css).toContain("--color-muted: #888888;");
    expect(css).toContain("--color-line: #e4e4e4;");
    expect(css).toContain("--color-line-strong: #cfcfcf;");
    expect(css).toContain("--color-accent: #111111;");
    expect(css).toContain("--color-accent-soft: #eaeaea;");
  });

  it("does not keep green-tinted UI or map colors in source styling", () => {
    const styledFiles = [
      "src/styles/index.css",
      "src/app/App.tsx",
      "src/components/analytics-consent/AnalyticsConsent.tsx",
      "src/components/filters/ResultsSummary.tsx",
      "src/components/filters/SearchBox.tsx",
      "src/components/map/KurskMap.tsx",
      "src/components/map/MapLogo.tsx",
      "src/components/map/MarkerTooltip.tsx",
      "src/components/map/PublicMapFallback.tsx",
      "src/components/map/markerImages.ts",
      "src/components/map/placeLayers.ts",
      "src/components/place-details/PhotoCarousel.tsx",
      "src/components/place-details/PlaceDetailsPanel.tsx",
      "src/components/place-details/PlaceTip.tsx",
      "src/components/place-details/RouteActions.tsx",
      "public/map-styles/kursk-positron.json"
    ];

    const combined = styledFiles.map((path) => readProjectFile(path)).join("\n");

    expect(combined).not.toMatch(/#(?:2f7d5b|eef5ed|243b2f|33483c|8a3d2c|e3ebe0|dfe8dd|edf3ea|b9d4d9|6d7a70|46564d|17211b|5b6a61)/i);
  });
});
