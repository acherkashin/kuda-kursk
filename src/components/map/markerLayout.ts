export type MarkerLayoutPoint = {
  id: string | number;
  isActive?: boolean;
  isHovered?: boolean;
  point: {
    x: number;
    y: number;
  };
};

export type MarkerLayout = {
  labelOffset: [number, number];
  markerOffset: [number, number];
  sortKey: number;
};

export type MarkerLayoutOptions = {
  anchorStrength?: number;
  iterations?: number;
  labelBaseOffset?: number;
  labelEmSize?: number;
  markerGap?: number;
  markerSize?: number;
  maxOffset?: number;
  previousLayout?: Map<string, MarkerLayout>;
};

type MarkerNode = MarkerLayoutPoint & {
  anchorX: number;
  anchorY: number;
  layoutPriority: number;
  sortPriority: number;
  x: number;
  y: number;
};

const DEFAULT_ANCHOR_STRENGTH = 0.24;
const DEFAULT_ITERATIONS = 10;
const DEFAULT_LABEL_BASE_OFFSET = 2.65;
const DEFAULT_LABEL_EM_SIZE = 12;
const DEFAULT_MARKER_GAP = 2;
const DEFAULT_MARKER_SIZE = 60;
const DEFAULT_MAX_OFFSET = 204;
const MAX_OVERLAP_RATIO = 0.5;

export function createMarkerLayout(
  markers: MarkerLayoutPoint[],
  options: MarkerLayoutOptions = {}
): Map<string, MarkerLayout> {
  const anchorStrength = options.anchorStrength ?? DEFAULT_ANCHOR_STRENGTH;
  const iterations = options.iterations ?? DEFAULT_ITERATIONS;
  const labelBaseOffset = options.labelBaseOffset ?? DEFAULT_LABEL_BASE_OFFSET;
  const labelEmSize = options.labelEmSize ?? DEFAULT_LABEL_EM_SIZE;
  const markerGap = options.markerGap ?? DEFAULT_MARKER_GAP;
  const markerSize = options.markerSize ?? DEFAULT_MARKER_SIZE;
  const maxOffset = options.maxOffset ?? DEFAULT_MAX_OFFSET;
  const previousLayout = options.previousLayout ?? new Map<string, MarkerLayout>();

  const nodes = markers.map((marker) => createMarkerNode(marker, previousLayout, maxOffset));

  for (let index = 0; index < iterations; index += 1) {
    pullNodesTowardAnchors(nodes, anchorStrength, maxOffset);
    relaxMarkerCollisions(nodes, markerSize, markerGap, maxOffset);
  }

  const sortedForZOrder = [...nodes].sort(compareMarkerZOrder);
  const sortKeyById = new Map(sortedForZOrder.map((node, index) => [String(node.id), index + 1]));
  const layout = new Map<string, MarkerLayout>();

  nodes.forEach((node) => {
    const offset = clampOffset([node.x - node.anchorX, node.y - node.anchorY], maxOffset);

    layout.set(String(node.id), {
      labelOffset: [offset[0] / labelEmSize, labelBaseOffset + offset[1] / labelEmSize],
      markerOffset: offset,
      sortKey: sortKeyById.get(String(node.id)) ?? 0
    });
  });

  return layout;
}

export function updateMarkerLayoutSortKeys(
  markerLayoutById: Map<string, MarkerLayout>,
  markers: MarkerLayoutPoint[],
  options: Pick<MarkerLayoutOptions, "labelBaseOffset"> = {}
): Map<string, MarkerLayout> {
  const labelBaseOffset = options.labelBaseOffset ?? DEFAULT_LABEL_BASE_OFFSET;
  const rankedMarkers = markers
    .map((marker) => {
      const markerId = String(marker.id);
      const layout = markerLayoutById.get(markerId) ?? createDefaultMarkerLayout(labelBaseOffset);

      return {
        id: markerId,
        layout,
        sortPriority: getSortPriority(marker),
        y: marker.point.y + layout.markerOffset[1]
      };
    })
    .sort((first, second) => {
      if (first.sortPriority !== second.sortPriority) {
        return first.sortPriority - second.sortPriority;
      }

      if (first.y !== second.y) {
        return first.y - second.y;
      }

      return first.id.localeCompare(second.id);
    });
  const sortKeyById = new Map(rankedMarkers.map((marker, index) => [marker.id, index + 1]));
  const layout = new Map<string, MarkerLayout>();

  markers.forEach((marker) => {
    const markerId = String(marker.id);
    const currentLayout = markerLayoutById.get(markerId) ?? createDefaultMarkerLayout(labelBaseOffset);

    layout.set(markerId, {
      ...currentLayout,
      sortKey: sortKeyById.get(markerId) ?? currentLayout.sortKey
    });
  });

  return layout;
}

function createMarkerNode(
  marker: MarkerLayoutPoint,
  previousLayout: Map<string, MarkerLayout>,
  maxOffset: number
): MarkerNode {
  const previousOffset = previousLayout.get(String(marker.id))?.markerOffset ?? [0, 0];
  const offset = clampOffset(previousOffset, maxOffset);

  return {
    ...marker,
    anchorX: marker.point.x,
    anchorY: marker.point.y,
    layoutPriority: getLayoutPriority(marker),
    sortPriority: getSortPriority(marker),
    x: marker.point.x + offset[0],
    y: marker.point.y + offset[1]
  };
}

function pullNodesTowardAnchors(nodes: MarkerNode[], anchorStrength: number, maxOffset: number) {
  nodes.forEach((node) => {
    const priorityStrength = anchorStrength * (node.layoutPriority > 1 ? 1.2 : 1);

    node.x += (node.anchorX - node.x) * priorityStrength;
    node.y += (node.anchorY - node.y) * priorityStrength;
    clampNodeToMaxOffset(node, maxOffset);
  });
}

function relaxMarkerCollisions(nodes: MarkerNode[], markerSize: number, markerGap: number, maxOffset: number) {
  const grid = createSpatialHash(nodes, markerSize + markerGap);

  nodes.forEach((node) => {
    forEachNearbyNode(node, grid, markerSize + markerGap, (otherNode) => {
      if (String(node.id) >= String(otherNode.id)) {
        return;
      }

      relaxMarkerPair(node, otherNode, markerSize, markerGap, maxOffset);
    });
  });
}

function relaxMarkerPair(first: MarkerNode, second: MarkerNode, markerSize: number, markerGap: number, maxOffset: number) {
  const overlap = getMarkerOverlap(first, second, markerSize);
  const maxOverlapArea = markerSize * markerSize * MAX_OVERLAP_RATIO;

  if (!overlap || overlap.area <= maxOverlapArea) {
    return;
  }

  const extraGap = markerGap;
  const targetOverlapX = Math.max(0, maxOverlapArea / overlap.y - extraGap);
  const targetOverlapY = Math.max(0, maxOverlapArea / overlap.x - extraGap);
  const pushX = Math.max(0, overlap.x - targetOverlapX);
  const pushY = Math.max(0, overlap.y - targetOverlapY);
  const moveOnX = pushX <= pushY;
  const direction = getPairDirection(first, second, moveOnX ? "x" : "y");
  const push = moveOnX ? pushX : pushY;
  const firstShare = getMovementShare(first, second);
  const secondShare = 1 - firstShare;

  if (moveOnX) {
    first.x += direction * push * firstShare;
    second.x -= direction * push * secondShare;
  } else {
    first.y += direction * push * firstShare;
    second.y -= direction * push * secondShare;
  }

  clampNodeToMaxOffset(first, maxOffset);
  clampNodeToMaxOffset(second, maxOffset);
}

function createSpatialHash(nodes: MarkerNode[], cellSize: number) {
  const grid = new Map<string, MarkerNode[]>();

  nodes.forEach((node) => {
    const key = getSpatialKey(node.x, node.y, cellSize);
    const bucket = grid.get(key) ?? [];

    bucket.push(node);
    grid.set(key, bucket);
  });

  return grid;
}

function forEachNearbyNode(
  node: MarkerNode,
  grid: Map<string, MarkerNode[]>,
  cellSize: number,
  callback: (nearbyNode: MarkerNode) => void
) {
  const cellX = Math.floor(node.x / cellSize);
  const cellY = Math.floor(node.y / cellSize);

  for (let x = cellX - 1; x <= cellX + 1; x += 1) {
    for (let y = cellY - 1; y <= cellY + 1; y += 1) {
      const bucket = grid.get(`${x}:${y}`);

      bucket?.forEach((nearbyNode) => {
        if (nearbyNode !== node) {
          callback(nearbyNode);
        }
      });
    }
  }
}

function getSpatialKey(x: number, y: number, cellSize: number) {
  return `${Math.floor(x / cellSize)}:${Math.floor(y / cellSize)}`;
}

function getMarkerOverlap(first: MarkerNode, second: MarkerNode, markerSize: number) {
  const overlapX = markerSize - Math.abs(first.x - second.x);
  const overlapY = markerSize - Math.abs(first.y - second.y);

  if (overlapX <= 0 || overlapY <= 0) {
    return null;
  }

  return {
    area: overlapX * overlapY,
    x: overlapX,
    y: overlapY
  };
}

function getMovementShare(first: MarkerNode, second: MarkerNode) {
  const firstWeight = getAnchorWeight(first);
  const secondWeight = getAnchorWeight(second);

  return secondWeight / (firstWeight + secondWeight);
}

function getAnchorWeight(node: MarkerNode) {
  return node.layoutPriority === 2 ? 5 : 1;
}

function getLayoutPriority(marker: MarkerLayoutPoint) {
  if (marker.isActive) {
    return 2;
  }

  return 1;
}

function getSortPriority(marker: MarkerLayoutPoint) {
  if (marker.isActive) {
    return 3;
  }

  if (marker.isHovered) {
    return 2;
  }

  return 1;
}

function compareMarkerZOrder(first: MarkerNode, second: MarkerNode) {
  if (first.sortPriority !== second.sortPriority) {
    return first.sortPriority - second.sortPriority;
  }

  if (first.y !== second.y) {
    return first.y - second.y;
  }

  return String(first.id).localeCompare(String(second.id));
}

function getPairDirection(first: MarkerNode, second: MarkerNode, axis: "x" | "y") {
  const delta = axis === "x" ? first.x - second.x : first.y - second.y;

  if (delta !== 0) {
    return delta > 0 ? 1 : -1;
  }

  return String(first.id).localeCompare(String(second.id)) >= 0 ? 1 : -1;
}

function clampNodeToMaxOffset(node: MarkerNode, maxOffset: number) {
  const offset = clampOffset([node.x - node.anchorX, node.y - node.anchorY], maxOffset);

  node.x = node.anchorX + offset[0];
  node.y = node.anchorY + offset[1];
}

function clampOffset(offset: [number, number], maxOffset: number): [number, number] {
  const distance = Math.hypot(offset[0], offset[1]);

  if (distance <= maxOffset || distance === 0) {
    return offset;
  }

  const scale = maxOffset / distance;

  return [offset[0] * scale, offset[1] * scale];
}

function createDefaultMarkerLayout(labelBaseOffset: number): MarkerLayout {
  return {
    labelOffset: [0, labelBaseOffset],
    markerOffset: [0, 0],
    sortKey: 0
  };
}
