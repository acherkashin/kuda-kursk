export type PublicMapConfig = {
  slug: string;
  title: string;
  description: string;
  logo: string;
  dataPath: string;
};

export const mapCatalog = [
  {
    slug: "main",
    title: "Куда в Курске",
    description: "Путеводитель для местных",
    logo: "/brand/kuda-v-kurske-logo-128.webp",
    dataPath: "/data/main-map.json"
  },
  {
    slug: "dozapravka",
    title: "Дозаправка",
    description: "Где выдохнуть и перезагрузиться",
    logo: "/place-thumbnails/9001-dozapravka.jpg",
    dataPath: "/data/dozapravka-objects.json"
  },
  {
    slug: "zapishu-zarisuyu",
    title: "Запишу, зарисую",
    description: "Места для вдохновения",
    logo: "/brand/zapishu-zarisuyu-logo.webp",
    dataPath: "/data/zapishu-zarisuyu-objects.json"
  }
] as const satisfies readonly PublicMapConfig[];

export function findMapBySlug(slug: string | undefined): PublicMapConfig | undefined {
  const normalizedSlug = slug?.trim();

  if (!normalizedSlug) {
    return undefined;
  }

  return mapCatalog.find((map) => map.slug === normalizedSlug);
}
