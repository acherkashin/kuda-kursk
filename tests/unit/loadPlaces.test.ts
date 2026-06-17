import { afterEach, describe, expect, it, vi } from "vitest";
import { loadPlaces } from "../../src/data/loadPlaces";

describe("loadPlaces", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("loads places from a GeoJSON FeatureCollection", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: true,
        json: async () => ({
          type: "FeatureCollection",
          features: [
            {
              type: "Feature",
              id: "place-1",
              geometry: { type: "Point", coordinates: [36.191748, 51.735498] },
              properties: {
                id: "place-1",
                balloonContent: {
                  name: "КГУ",
                  description: "Учебный корпус",
                  address: "г. Курск",
                  coordinates: "51.735498, 36.191748",
                  thumbnail: "/place-thumbnails/sketches/1.jpg"
                }
              }
            }
          ]
        })
      }))
    );

    const places = await loadPlaces("/data/illustrator-liza-silakova-objects.json");

    expect(fetch).toHaveBeenCalledWith("/data/illustrator-liza-silakova-objects.json");
    expect(places).toHaveLength(1);
    expect(places[0]?.properties.balloonContent.thumbnail).toBe("/place-thumbnails/sketches/1.jpg");
  });

  it("rejects JSON that is not a GeoJSON FeatureCollection", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: true,
        json: async () => []
      }))
    );

    await expect(loadPlaces("/data/places.json")).rejects.toThrow(/FeatureCollection/i);
  });
});
