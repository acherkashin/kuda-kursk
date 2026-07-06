import { describe, expect, it } from "vitest";
import { validateGeoJsonPlace } from "../../src/data/validateGeoJsonPlace";

const validPlace = {
  type: "Feature",
  id: "boevka",
  geometry: {
    type: "Point",
    coordinates: [36.2114, 51.7421]
  },
  properties: {
    id: "boevka",
    balloonContent: {
      name: "Площадка на Боевке",
      description: "Спортивная площадка рядом с прогулочными маршрутами.",
      address: "г. Курск, парк Боева дача",
    }
  }
};

describe("validateGeoJsonPlace", () => {
  it("accepts a Kursk point with canonical longitude-latitude coordinates", () => {
    expect(validateGeoJsonPlace(validPlace)).toMatchObject({
      id: "boevka",
      geometry: { coordinates: [36.2114, 51.7421] }
    });
  });

  it("accepts known unique place categories", () => {
    expect(
      validateGeoJsonPlace({
        ...validPlace,
        properties: {
          ...validPlace.properties,
          categories: ["chalet"]
        }
      })
    ).toMatchObject({ properties: { categories: ["chalet"] } });
  });

  it("rejects unknown or duplicate place categories", () => {
    expect(() =>
      validateGeoJsonPlace({
        ...validPlace,
        properties: {
          ...validPlace.properties,
          categories: ["unknown"]
        }
      })
    ).toThrow(/categor/i);

    expect(() =>
      validateGeoJsonPlace({
        ...validPlace,
        properties: {
          ...validPlace.properties,
          categories: ["chalet", "chalet"]
        }
      })
    ).toThrow(/categor/i);
  });

  it("rejects latitude-longitude coordinates that look swapped for Kursk", () => {
    expect(() =>
      validateGeoJsonPlace({
        ...validPlace,
        geometry: { type: "Point", coordinates: [51.7421, 36.2114] }
      })
    ).toThrow(/longitude, latitude/i);
  });

  it("rejects missing required balloon content fields", () => {
    expect(() =>
      validateGeoJsonPlace({
        ...validPlace,
        properties: {
          id: "boevka",
          balloonContent: {
            name: "Площадка на Боевке",
            description: "Спортивная площадка"
          }
        }
      })
    ).toThrow(/address/i);
  });
});
