import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

const githubPagesBase = "/kuda-kursk/";

export default defineConfig({
  base: githubPagesBase,
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "prompt",
      includeAssets: [
        "data/*.json",
        "map-styles/*.json",
        "brand/kuda-v-kurske-logo-128.webp",
        "pwa/icon-192.png",
        "pwa/icon-512.png",
        "pwa/apple-touch-icon.png",
        "pwa/favicon-32.png"
      ],
      manifest: {
        name: "Куда в Курске",
        short_name: "Курск",
        description: "Карта мест Курска для жителей и туристов",
        start_url: githubPagesBase,
        scope: githubPagesBase,
        display: "standalone",
        theme_color: "#f8faf7",
        background_color: "#f8faf7",
        icons: [
          { src: "pwa/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "pwa/icon-512.png", sizes: "512x512", type: "image/png" }
        ]
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,json,webp}"],
        navigateFallback: `${githubPagesBase}index.html`,
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.startsWith(`${githubPagesBase}data/`),
            handler: "StaleWhileRevalidate",
            options: { cacheName: "kursk-map-data" }
          }
        ]
      },
      devOptions: { enabled: true }
    })
  ],
  server: {
    host: "127.0.0.1",
    port: 5173
  },
  test: {
    globals: true,
    environment: "jsdom"
  }
});
