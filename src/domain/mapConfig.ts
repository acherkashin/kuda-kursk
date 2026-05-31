export const KURSK_CENTER = {
  longitude: 36.1926,
  latitude: 51.7304
} as const;

export const mapConfig = {
  center: [KURSK_CENTER.longitude, KURSK_CENTER.latitude] as [number, number],
  zoom: 12.2,
  minZoom: 10,
  maxZoom: 18,
  styleUrl: "/map-styles/kursk-positron.json"
} as const;
