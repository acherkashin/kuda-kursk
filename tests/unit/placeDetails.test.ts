import { describe, expect, it } from "vitest";
import { buildPlaceDetails } from "../../src/domain/placeDetails";
import type { PlaceFeature } from "../../src/domain/places";

describe("buildPlaceDetails", () => {
  it("uses image as the fallback photo and keeps thumbnail for previews", () => {
    const place = {
      type: "Feature",
      id: "hotel",
      geometry: { type: "Point", coordinates: [35.392868, 52.231969] },
      properties: {
        id: "hotel",
        balloonContent: {
          name: "Парк-отель",
          description: "Описание",
          address: "Адрес",
          coordinates: "52.231969, 35.392868",
          image: "/place-images/320-image-photo.jpg",
          thumbnail: "/place-thumbnails/320-f29160ce22.webp"
        }
      }
    } satisfies PlaceFeature;

    expect(buildPlaceDetails(place).photos[0]).toMatchObject({
      src: "/place-images/320-image-photo.jpg",
      thumbnail: "/place-thumbnails/320-f29160ce22.webp"
    });
    expect(buildPlaceDetails(place).photos[0]?.caption).toBeUndefined();
  });

  it("falls back to thumbnail when image is absent", () => {
    const place = {
      type: "Feature",
      id: "sketch",
      geometry: { type: "Point", coordinates: [36.191748, 51.735498] },
      properties: {
        id: "sketch",
        balloonContent: {
          name: "КГУ",
          description: "Описание",
          address: "Адрес",
          coordinates: "51.735498, 36.191748",
          thumbnail: "/place-thumbnails/sketches/1.jpg"
        }
      }
    } satisfies PlaceFeature;

    expect(buildPlaceDetails(place).photos[0]).toMatchObject({
      src: "/place-thumbnails/sketches/1.jpg",
      thumbnail: "/place-thumbnails/sketches/1.jpg"
    });
  });

  it("builds a details link from relative balloon content url", () => {
    const place = {
      type: "Feature",
      id: "hotel",
      geometry: { type: "Point", coordinates: [35.392868, 52.231969] },
      properties: {
        id: "hotel",
        balloonContent: {
          name: "Парк-отель",
          description: "Описание",
          address: "Адрес",
          coordinates: "52.231969, 35.392868",
          url: "/objects/park-otel-peschanyy/"
        }
      }
    } satisfies PlaceFeature;

    expect(buildPlaceDetails(place).detailsLink).toEqual({
      id: "details",
      label: "Узнать подробнее",
      url: "https://gokursk.ru/objects/park-otel-peschanyy/",
      kind: "site"
    });
    expect(buildPlaceDetails(place).links).toEqual([]);
  });

  it("prefers externalUrl over balloon content url for details link", () => {
    const place = {
      type: "Feature",
      id: "hotel",
      geometry: { type: "Point", coordinates: [35.392868, 52.231969] },
      properties: {
        id: "hotel",
        balloonContent: {
          name: "Парк-отель",
          description: "Описание",
          address: "Адрес",
          coordinates: "52.231969, 35.392868",
          url: "/objects/park-otel-peschanyy/",
          externalUrl: "https://example.com/place"
        }
      }
    } satisfies PlaceFeature;

    expect(buildPlaceDetails(place).detailsLink?.url).toBe("https://example.com/place");
  });
});
