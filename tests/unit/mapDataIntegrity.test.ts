/// <reference types="node" />

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { validateGeoJsonPlace } from "../../src/data/validateGeoJsonPlace";
import { mapCatalog } from "../../src/domain/mapCatalog";

const projectRoot = process.cwd();

describe("map data files", () => {
  it("contain valid canonical places and existing local thumbnails", () => {
    const counts = new Map<string, number>();

    for (const map of mapCatalog) {
      const dataPath = join(projectRoot, "public", map.dataPath);
      const raw = JSON.parse(readFileSync(dataPath, "utf8")) as unknown;

      expect(raw).toMatchObject({ type: "FeatureCollection" });
      const features = (raw as { features?: unknown }).features;
      expect(Array.isArray(features)).toBe(true);

      const places = (features as unknown[]).map(validateGeoJsonPlace);
      counts.set(map.slug, places.length);

      for (const place of places) {
        const thumbnail = place.properties.balloonContent.thumbnail;
        const image = place.properties.balloonContent.image;

        expect(image).toMatch(/^\/place-images\//);
        expect(thumbnail).toMatch(/^\/place-thumbnails\//);

        for (const src of [thumbnail, image]) {
          expect(src).not.toMatch(/^https?:\/\//);
          expect(src).not.toMatch(/^\/upload\//);

          if (src?.startsWith("/")) {
            expect(existsSync(join(projectRoot, "public", src))).toBe(true);
          }
        }
      }
    }

    expect(Object.fromEntries(counts)).toEqual({
      main: 39,
      dozapravka: 19,
      "zapishu-zarisuyu": 21
    });
  });
});
