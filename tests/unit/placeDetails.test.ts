import { describe, expect, it } from "vitest";
import { buildPlaceDetails } from "../../src/domain/placeDetails";
import type { PlaceFeature } from "../../src/domain/places";

describe("buildPlaceDetails", () => {
  it("uses image as the fallback photo without exposing mapThumbnail", () => {
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
          image: "/place-images/320-image-photo.jpg",
          mapThumbnail: "/place-map-thumbnails/320.webp"
        }
      }
    } satisfies PlaceFeature;

    expect(buildPlaceDetails(place).photos[0]).toMatchObject({
      src: "/place-images/320-image-photo.jpg"
    });
    expect(buildPlaceDetails(place).photos[0]?.caption).toBeUndefined();
  });

  it("ignores legacy balloon content urls instead of building GoKursk details links", () => {
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
          image: "/place-images/hotel.jpg",
          mapThumbnail: "/place-map-thumbnails/hotel.webp",
          url: "/objects/park-otel-peschanyy/"
        }
      }
    } satisfies PlaceFeature;

    expect(buildPlaceDetails(place)).not.toHaveProperty("detailsLink");
    expect(buildPlaceDetails(place).links).toEqual([]);
  });

  it("keeps explicit details, site and social links from place data", () => {
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
          image: "/place-images/hotel.jpg",
          mapThumbnail: "/place-map-thumbnails/hotel.webp",
          url: "/objects/park-otel-peschanyy/",
          externalUrl: "https://example.com/place"
        },
        links: [
          { label: "Узнать подробнее", url: "https://t.me/zapishu_zarisuyu/761", kind: "details" },
          { label: "Сайт", url: "https://example.com/place", kind: "site" },
          { label: "ВКонтакте", url: "https://vk.com/example", kind: "vk" }
        ]
      }
    } satisfies PlaceFeature;

    expect(buildPlaceDetails(place)).not.toHaveProperty("detailsLink");
    expect(buildPlaceDetails(place).links).toEqual([
      { label: "Узнать подробнее", url: "https://t.me/zapishu_zarisuyu/761", kind: "details" },
      { label: "Сайт", url: "https://example.com/place", kind: "site" },
      { label: "ВКонтакте", url: "https://vk.com/example", kind: "vk" }
    ]);
  });
});
