export type PublicMapConfig = {
  slug: string;
  title: string;
  dataPath: string;
};

export const mapCatalog = [
  { slug: "main", title: "Куда в Курске", dataPath: "/data/main-map.json" },
  { slug: "dozapravka", title: "Дозаправка", dataPath: "/data/dozapravka-objects.json" },
  { slug: "zapishu-zarisuyu", title: "Запишу, зарисую", dataPath: "/data/zapishu-zarisuyu-objects.json" }
] as const satisfies readonly PublicMapConfig[];

export function findMapBySlug(slug: string | undefined): PublicMapConfig | undefined {
  const normalizedSlug = slug?.trim();

  if (!normalizedSlug) {
    return undefined;
  }

  return mapCatalog.find((map) => map.slug === normalizedSlug);
}
