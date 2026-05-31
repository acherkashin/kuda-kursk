export type RouteProvider = "yandex" | "2gis" | "google";

export type RouteCoordinates = {
  longitude: number;
  latitude: number;
};

export type RouteLink = {
  provider: RouteProvider;
  label: string;
  url: string;
};

export function buildRouteLinks({ longitude, latitude }: RouteCoordinates): RouteLink[] {
  const latLon = `${latitude},${longitude}`;
  const lonLat = `${longitude},${latitude}`;

  return [
    {
      provider: "yandex",
      label: "Яндекс.Карты",
      url: `https://yandex.ru/maps/?rtext=~${encodeURIComponent(latLon)}&rtt=auto`
    },
    {
      provider: "2gis",
      label: "2ГИС",
      url: `https://2gis.ru/kursk/routeSearch/rsType/car/to/${lonLat}`
    },
    {
      provider: "google",
      label: "Google Maps",
      url: `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(latLon)}`
    }
  ];
}
