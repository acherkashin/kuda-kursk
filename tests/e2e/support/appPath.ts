export const appBase = normalizeBasePath(process.env.PLAYWRIGHT_APP_BASE ?? "/");

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function normalizeBasePath(value: string) {
  const withLeadingSlash = value.startsWith("/") ? value : `/${value}`;
  const withoutTrailingSlash = withLeadingSlash.length > 1 ? withLeadingSlash.replace(/\/+$/, "") : withLeadingSlash;

  return withoutTrailingSlash;
}

export function appPath(path: string) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  return appBase === "/" ? normalizedPath : `${appBase}${normalizedPath}`;
}

export function appUrlPattern(path: string) {
  return new RegExp(`${escapeRegExp(appPath(path))}$`);
}
