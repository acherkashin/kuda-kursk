import { describe, expect, it } from "vitest";
import { createMarkerLayout } from "../../src/components/map/markerLayout";

describe("createMarkerLayout", () => {
  it("keeps isolated markers on their source coordinates", () => {
    const layout = createMarkerLayout([
      { id: "first", point: { x: 100, y: 100 } },
      { id: "second", point: { x: 260, y: 100 } }
    ]);

    expect(layout.get("first")?.markerOffset).toEqual([0, 0]);
    expect(layout.get("second")?.markerOffset).toEqual([0, 0]);
  });

  it("moves close markers apart without dropping either marker", () => {
    const layout = createMarkerLayout(
      [
        { id: "first", point: { x: 100, y: 100 } },
        { id: "second", point: { x: 104, y: 102 } }
      ],
      { markerGap: 8, markerSize: 60 }
    );

    const first = layout.get("first");
    const second = layout.get("second");

    expect(first).toBeDefined();
    expect(second).toBeDefined();
    expect(second?.markerOffset).not.toEqual(first?.markerOffset);
  });

  it("keeps the active marker anchored when several places share one point", () => {
    const layout = createMarkerLayout(
      [
        { id: "inactive-a", point: { x: 120, y: 120 } },
        { id: "active", isActive: true, point: { x: 120, y: 120 } },
        { id: "inactive-b", point: { x: 120, y: 120 } }
      ],
      { markerGap: 8, markerSize: 60 }
    );

    expect(layout.get("active")?.markerOffset).toEqual([0, 0]);
    expect(new Set([...layout.values()].map((item) => item.markerOffset.join(","))).size).toBe(3);
  });

  it("derives the label offset from the marker offset", () => {
    const layout = createMarkerLayout(
      [
        { id: "first", point: { x: 100, y: 100 } },
        { id: "second", point: { x: 100, y: 100 } }
      ],
      { labelBaseOffset: 2.65, labelEmSize: 12, markerGap: 8, markerSize: 60 }
    );

    const second = layout.get("second");

    expect(second).toBeDefined();
    expect(second?.labelOffset[0]).toBeCloseTo((second?.markerOffset[0] ?? 0) / 12);
    expect(second?.labelOffset[1]).toBeCloseTo(2.65 + (second?.markerOffset[1] ?? 0) / 12);
  });
});
