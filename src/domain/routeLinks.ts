export type RouteProvider = "yandex" | "2gis" | "google";

export type RouteCoordinates = {
  longitude: number;
  latitude: number;
};

export type RouteLink = {
  provider: RouteProvider;
  label: string;
  url: string;
  destination: RouteCoordinates;
};

type RouteUrlParams = {
  provider: RouteProvider;
  origin?: RouteCoordinates;
  destination: RouteCoordinates;
};

function formatLatLon({ longitude, latitude }: RouteCoordinates): string {
  return `${latitude},${longitude}`;
}

function formatLonLat({ longitude, latitude }: RouteCoordinates): string {
  return `${longitude},${latitude}`;
}

export function buildRouteUrl({ provider, origin, destination }: RouteUrlParams): string {
  if (provider === "yandex") {
    const points = origin ? `${formatLatLon(origin)}~${formatLatLon(destination)}` : `~${formatLatLon(destination)}`;

    return `https://yandex.ru/maps/?rtext=${encodeURIComponent(points)}&rtt=auto`;
  }

  if (provider === "2gis") {
    const points = origin ? `${formatLonLat(origin)}|${formatLonLat(destination)}` : `|${formatLonLat(destination)}`;

    return `https://2gis.ru/kursk/directions/points/${points}`;
  }

  const destinationParam = `destination=${encodeURIComponent(formatLatLon(destination))}`;
  const originParam = origin ? `&origin=${encodeURIComponent(formatLatLon(origin))}` : "";

  return `https://www.google.com/maps/dir/?api=1${originParam}&${destinationParam}`;
}

export function buildRouteLinks({ longitude, latitude }: RouteCoordinates): RouteLink[] {
  const destination = { longitude, latitude };

  return [
    {
      provider: "yandex",
      label: "Яндекс.Карты",
      url: buildRouteUrl({ provider: "yandex", destination }),
      destination
    },
    {
      provider: "2gis",
      label: "2ГИС",
      url: buildRouteUrl({ provider: "2gis", destination }),
      destination
    },
    {
      provider: "google",
      label: "Google Maps",
      url: buildRouteUrl({ provider: "google", destination }),
      destination
    }
  ];
}
