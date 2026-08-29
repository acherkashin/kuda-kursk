/// <reference types="vite/client" />

declare module "*.css";

interface ImportMetaEnv {
  readonly VITE_ANALYTICS_CONSENT_UI_ENABLED?: string;
  readonly VITE_CARTO_BASEMAP_API_KEY?: string;
}
