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
    description: "Не шефы и не гурманы. Наш вкус, наше мнение.",
    logo: "/place-thumbnails/9001-dozapravka.jpg",
    dataPath: "/data/dozapravka-objects.json"
  },
  {
    slug: "illustrator-liza-silakova",
    title: "Иллюстратор Лиза Силакова",
    description: "Места для вдохновения",
    logo: "/brand/illustrator-liza-silakova-logo.webp",
    dataPath: "/data/illustrator-liza-silakova-objects.json"
  },
  {
    slug: "elena-koltysheva",
    title: "Елена Колтышева",
    description: "Подборка мест для впечатлений",
    logo: "/place-thumbnails/elena-koltysheva/portal.webp",
    dataPath: "/data/elena-koltysheva-objects.json"
  }
] as const satisfies readonly PublicMapConfig[];

export function findMapBySlug(slug: string | undefined): PublicMapConfig | undefined {
  const normalizedSlug = slug?.trim();

  if (!normalizedSlug) {
    return undefined;
  }

  return mapCatalog.find((map) => map.slug === normalizedSlug);
}
