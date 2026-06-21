/// <reference types="node" />

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { validateGeoJsonPlace } from "../../src/data/validateGeoJsonPlace";
import { mapCatalog } from "../../src/domain/mapCatalog";
import { filterVisiblePlaces } from "../../src/domain/places";

const projectRoot = process.cwd();
describe("map data files", () => {
  it("contain valid canonical places and existing local thumbnails", () => {
    for (const map of mapCatalog) {
      const dataPath = join(projectRoot, "public", map.dataPath);
      const raw = JSON.parse(readFileSync(dataPath, "utf8")) as unknown;

      expect(raw).toMatchObject({ type: "FeatureCollection" });
      const features = (raw as { features?: unknown }).features;
      expect(Array.isArray(features)).toBe(true);

      const places = (features as unknown[]).map(validateGeoJsonPlace);
      expect(places.length).toBeGreaterThan(0);

      for (const place of places) {
        const thumbnail = place.properties.balloonContent.thumbnail;
        const image = place.properties.balloonContent.image;
        const legacyUrl = place.properties.balloonContent.url;
        const legacyExternalUrl = place.properties.balloonContent.externalUrl;
        const links = [
          ...(place.properties.links ?? []),
          ...(place.properties.balloonContent.socials ?? [])
        ];

        expect(image).toMatch(/^\/place-images\//);
        expect(thumbnail).toMatch(/^\/place-thumbnails\//);
        if (typeof legacyUrl === "string") {
          expect(legacyUrl).not.toMatch(/gokursk\.ru/i);
        }

        if (typeof legacyExternalUrl === "string") {
          expect(legacyExternalUrl).not.toMatch(/gokursk\.ru/i);
        }

        for (const link of links) {
          expect(link.url).not.toMatch(/gokursk\.ru/i);
        }

        for (const src of [thumbnail, image]) {
          expect(src).not.toMatch(/^https?:\/\//);
          expect(src).not.toMatch(/^\/upload\//);

          if (src?.startsWith("/")) {
            expect(existsSync(join(projectRoot, "public", src))).toBe(true);
          }
        }
      }
    }
  });

  it("keeps temporarily hidden main-map places in raw data but excludes them from visible places", () => {
    const dataPath = join(projectRoot, "public", "data", "main-map.json");
    const raw = JSON.parse(readFileSync(dataPath, "utf8")) as unknown;

    expect(raw).toMatchObject({ type: "FeatureCollection" });
    const features = (raw as { features?: unknown }).features;
    expect(Array.isArray(features)).toBe(true);

    const places = (features as unknown[]).map(validateGeoJsonPlace);
    const hiddenPlaceIds = [2001, 2002, 2005, 2007];
    const hiddenPlaces = places.filter((place) => hiddenPlaceIds.includes(Number(place.id)));

    expect(hiddenPlaces.map((place) => place.id).sort()).toEqual(hiddenPlaceIds);
    expect(hiddenPlaces.every((place) => place.properties.visibility?.public === false)).toBe(true);
    expect(filterVisiblePlaces(places).some((place) => hiddenPlaceIds.includes(Number(place.id)))).toBe(false);
  });
});
