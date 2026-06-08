const EXTERNAL_URL_PATTERN = /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i;

export function resolvePublicPath(path: string): string {
  if (!path || EXTERNAL_URL_PATTERN.test(path)) {
    return path;
  }

  const basePath = import.meta.env.BASE_URL || "/";

  if (basePath === "/") {
    return path;
  }

  const normalizedBasePath = basePath.endsWith("/") ? basePath : `${basePath}/`;
  const normalizedPath = path.startsWith("/") ? path.slice(1) : path;

  return `${normalizedBasePath}${normalizedPath}`;
}
