import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { Plugin, ResolvedConfig } from "vite";
import { mapCatalog, type PublicMapConfig } from "../src/domain/mapCatalog";

const SITE_ORIGIN = "https://kudakursk.ru";
const SEO_BLOCK_PATTERN = /<!-- SEO:START -->[\s\S]*?<!-- SEO:END -->/;
const VALID_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

type SeoMetadata = {
  title: string;
  description: string;
  canonicalUrl: string;
  imageUrl: string;
};

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function escapeXml(value: string): string {
  return escapeHtml(value).replaceAll("'", "&apos;");
}

function appendSentence(text: string, sentence: string): string {
  const normalizedText = text.trim();
  const separator = /[.!?…]$/u.test(normalizedText) ? " " : ". ";

  return `${normalizedText}${separator}${sentence}`;
}

function createSeoMetadata(map: PublicMapConfig): SeoMetadata {
  const isMainMap = map.slug === "main";

  return {
    title: isMainMap ? "Куда в Курске — карта интересных мест" : `${map.title} — карта мест в Курске`,
    description: isMainMap
      ? "Интерактивная карта интересных мест Курска для жителей и туристов: идеи для прогулок, отдыха, еды и новых впечатлений."
      : appendSentence(map.description, `Авторская подборка мест Курска на интерактивной карте «${map.title}».`),
    canonicalUrl: new URL(`/maps/${map.slug}/`, SITE_ORIGIN).href,
    imageUrl: new URL(map.logo, SITE_ORIGIN).href
  };
}

function renderSeoBlock(metadata: SeoMetadata): string {
  const title = escapeHtml(metadata.title);
  const description = escapeHtml(metadata.description);
  const canonicalUrl = escapeHtml(metadata.canonicalUrl);
  const imageUrl = escapeHtml(metadata.imageUrl);

  return `<!-- SEO:START -->
    <title>${title}</title>
    <meta name="description" content="${description}" />
    <meta name="robots" content="index, follow" />
    <link rel="canonical" href="${canonicalUrl}" />
    <meta property="og:site_name" content="Куда в Курске" />
    <meta property="og:type" content="website" />
    <meta property="og:locale" content="ru_RU" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:url" content="${canonicalUrl}" />
    <meta property="og:image" content="${imageUrl}" />
    <meta property="og:image:alt" content="${title}" />
    <meta name="twitter:card" content="summary" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${description}" />
    <meta name="twitter:image" content="${imageUrl}" />
    <!-- SEO:END -->`;
}

function replaceSeoBlock(html: string, metadata: SeoMetadata): string {
  if (!SEO_BLOCK_PATTERN.test(html)) {
    throw new Error("Built index.html does not contain the expected SEO block markers");
  }

  return html.replace(SEO_BLOCK_PATTERN, renderSeoBlock(metadata));
}

function renderSitemap(): string {
  const urls = mapCatalog
    .map((map) => `  <url>\n    <loc>${escapeXml(createSeoMetadata(map).canonicalUrl)}</loc>\n  </url>`)
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
}

export function generateSeoArtifacts(): Plugin {
  let resolvedConfig: ResolvedConfig;

  return {
    name: "generate-seo-artifacts",
    apply: "build",
    configResolved(config) {
      resolvedConfig = config;
    },
    async closeBundle() {
      const outputDirectory = path.resolve(resolvedConfig.root, resolvedConfig.build.outDir);
      const indexPath = path.join(outputDirectory, "index.html");
      const indexHtml = await readFile(indexPath, "utf8");

      for (const map of mapCatalog) {
        if (!VALID_SLUG_PATTERN.test(map.slug)) {
          throw new Error(`Map slug is not safe for a static route: ${map.slug}`);
        }

        const routeDirectory = path.join(outputDirectory, "maps", map.slug);
        await mkdir(routeDirectory, { recursive: true });
        await writeFile(path.join(routeDirectory, "index.html"), replaceSeoBlock(indexHtml, createSeoMetadata(map)));
      }

      const robots = `User-agent: *\nAllow: /\n\nSitemap: ${SITE_ORIGIN}/sitemap.xml\n`;
      await writeFile(path.join(outputDirectory, "robots.txt"), robots);
      await writeFile(path.join(outputDirectory, "sitemap.xml"), renderSitemap());
    }
  };
}
