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
                  image: "/place-images/sketches/1.jpg",
                  mapThumbnail: "/place-map-thumbnails/sketches/1.webp"
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
    expect(places[0]?.properties.balloonContent.mapThumbnail).toBe("/place-map-thumbnails/sketches/1.webp");
  });

  it("returns only visible places from a GeoJSON FeatureCollection", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: true,
        json: async () => ({
          type: "FeatureCollection",
          features: [
            {
              type: "Feature",
              id: "visible",
              geometry: { type: "Point", coordinates: [36.191748, 51.735498] },
              properties: {
                id: "visible",
                balloonContent: {
                  name: "Видимое место",
                  description: "Публичная точка",
                  address: "г. Курск",
                  image: "/place-images/visible.jpg",
                  mapThumbnail: "/place-map-thumbnails/visible.webp"
                }
              }
            },
            {
              type: "Feature",
              id: "hidden",
              geometry: { type: "Point", coordinates: [36.201748, 51.745498] },
              properties: {
                id: "hidden",
                visibility: { public: false },
                balloonContent: {
                  name: "Скрытое место",
                  description: "Временно не показывается",
                  address: "г. Курск",
                  image: "/place-images/hidden.jpg",
                  mapThumbnail: "/place-map-thumbnails/hidden.webp"
                }
              }
            },
            {
              type: "Feature",
              id: "link-only",
              geometry: { type: "Point", coordinates: [36.211748, 51.755498] },
              properties: {
                id: "link-only",
                visibility: { linkOnly: true },
                balloonContent: {
                  name: "Место по ссылке",
                  description: "Не участвует в общем наборе",
                  address: "г. Курск",
                  image: "/place-images/link-only.jpg",
                  mapThumbnail: "/place-map-thumbnails/link-only.webp"
                }
              }
            }
          ]
        })
      }))
    );

    const places = await loadPlaces("/data/any-map.json");

    expect(places.map((place) => place.id)).toEqual(["visible"]);
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
