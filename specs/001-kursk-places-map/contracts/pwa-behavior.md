# Контракт PWA

## Manifest

Минимальные поля для GitHub Pages custom domain (`https://kudakursk.ru/`):

```json
{
  "name": "Куда в Курске",
  "short_name": "Курск",
  "description": "Карта мест Курска для жителей и туристов",
  "start_url": "/",
  "scope": "/",
  "display": "standalone",
  "theme_color": "#f8faf7",
  "background_color": "#f8faf7",
  "icons": [
    { "src": "pwa/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "pwa/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

Все локальные public-пути приложения (`/data/...`, `/map-styles/...`, `/place-images/...`, `/place-thumbnails/...`, `/pwa/...`, `/sw.js`) должны резолвиться через Vite `BASE_URL`. Для локальной разработки и GitHub Pages production на custom domain `BASE_URL` остаётся `/`.

## Service worker

**Кешировать**
- app shell;
- versioned JS/CSS build assets;
- локальные JSON-файлы данных под `/data/` через `NetworkFirst`: свежий сетевой ответ имеет приоритет, кеш используется при сетевой ошибке;
- локальные изображения мест и PWA icons, если размер и стратегия кеша не вредят первому экрану.

**Не кешировать агрессивно**
- внешние raster map tiles CARTO Positron;
- script Яндекс.Метрики;
- внешние изображения или ссылки, которые не контролирует проект.

## Update UX

- Service worker регистрируется автоматически одной точкой входа приложения; дополнительный `registerSW.js` не публикуется и не подключается.
- Новая версия app shell устанавливается и активируется в фоне через `skipWaiting`, но не вызывает `clientsClaim` и не перезагружает открытую страницу.
- Update prompt не показывается; новый app shell применяется при следующем запуске после завершения установки worker.
- Если приложение было полностью закрыто во время deploy, первый запуск может установить worker в фоне, а новый app shell будет использован при следующем запуске.

## Offline fallback

- Если app shell уже установлен, приложение открывает базовый интерфейс offline.
- Если tiles недоступны, UI показывает резервное состояние карты и сохраняет доступ к уже загруженному текстовому контенту, когда он есть в кеше.
- SPA fallback для GitHub Pages использует `/index.html` в service worker и опубликованный `404.html`, совпадающий с `index.html`, чтобы прямые URL вида `/maps/main` открывались до и после установки app shell.
