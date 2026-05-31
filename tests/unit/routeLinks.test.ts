import { describe, expect, it } from "vitest";
import { buildRouteLinks } from "../../src/domain/routeLinks";

describe("buildRouteLinks", () => {
  it("builds Yandex, 2GIS and Google route URLs from longitude-latitude coordinates", () => {
    const links = buildRouteLinks({ longitude: 36.2114, latitude: 51.7421 });

    expect(links).toEqual([
      expect.objectContaining({ provider: "yandex", label: "Яндекс.Карты" }),
      expect.objectContaining({ provider: "2gis", label: "2ГИС" }),
      expect.objectContaining({ provider: "google", label: "Google Maps" })
    ]);
    expect(links[0]?.url).toContain("rtext=~51.7421%2C36.2114");
    expect(links[1]?.url).toContain("routeSearch/rsType/car/to/36.2114,51.7421");
    expect(links[2]?.url).toContain("api=1");
    expect(links[2]?.url).toContain("destination=51.7421%2C36.2114");
  });
});
