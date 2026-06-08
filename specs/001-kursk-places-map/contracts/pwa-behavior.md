# Контракт PWA

## Manifest

Минимальные поля для GitHub Pages project pages (`/kuda-kursk/`):

```json
{
  "name": "Куда в Курске",
  "short_name": "Курск",
  "description": "Карта мест Курска для жителей и туристов",
  "start_url": "/kuda-kursk/",
  "scope": "/kuda-kursk/",
  "display": "standalone",
  "theme_color": "#f8faf7",
  "background_color": "#f8faf7",
  "icons": [
    { "src": "pwa/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "pwa/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

Все локальные public-пути приложения (`/data/...`, `/map-styles/...`, `/place-images/...`, `/place-thumbnails/...`, `/pwa/...`, `/sw.js`) должны резолвиться через Vite `BASE_URL`. Для локальной разработки `BASE_URL` остаётся `/`, для GitHub Pages production — `/kuda-kursk/`.

## Service worker

**Кешировать**
- app shell;
- versioned JS/CSS build assets;
- локальные JSON-файлы данных под `/kuda-kursk/data/`;
- локальные изображения мест и PWA icons, если размер и стратегия кеша не вредят первому экрану.

**Не кешировать агрессивно**
- внешние map tiles/style responses OpenFreeMap;
- script Яндекс.Метрики;
- внешние изображения или ссылки, которые не контролирует проект.

## Update UX

- При доступном обновлении показывать неблокирующее уведомление.
- Пользователь может обновить приложение явным действием.
- Offline-ready состояние не должно закрывать карту или карточку места.

## Offline fallback

- Если app shell уже установлен, приложение открывает базовый интерфейс offline.
- Если tiles недоступны, UI показывает резервное состояние карты и сохраняет доступ к уже загруженному текстовому контенту, когда он есть в кеше.
- SPA fallback для GitHub Pages использует `/kuda-kursk/index.html`, чтобы прямые URL вида `/kuda-kursk/maps/main` открывались после установки app shell.
