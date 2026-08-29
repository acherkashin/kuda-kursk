const CARTO_BASEMAP_URL_PATTERN = /^https:\/\/(?:[a-d]\.)?basemaps\.cartocdn\.com\//;

const cartoBasemapApiKey = import.meta.env.VITE_CARTO_BASEMAP_API_KEY?.trim();

export function addCartoBasemapApiKey(url: string) {
  if (!cartoBasemapApiKey || !CARTO_BASEMAP_URL_PATTERN.test(url)) {
    return { url };
  }

  const tileUrl = new URL(url);
  tileUrl.searchParams.set("key", cartoBasemapApiKey);

  return { url: tileUrl.toString() };
}
