# Контракт PWA

## Manifest

Минимальные поля для GitHub Pages custom domain (`https://kudakursk.ru/`):

```json
{
  "name": "Куда в Курске",
  "short_name": "Куда в Курске",
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

`index.html` должен содержать iOS standalone metadata: `apple-mobile-web-app-capable=yes`, `apple-mobile-web-app-title` и `apple-mobile-web-app-status-bar-style`.

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
- Новая версия app shell устанавливается и активируется в фоне через `skipWaiting`, получает контроль над открытой вкладкой через `clientsClaim` и вызывает одну автоматическую перезагрузку только для update-события.
- Update prompt не показывается; первичная установка service worker не перезагружает страницу.
- Если приложение было полностью закрыто во время deploy, первый запуск может установить worker в фоне, а последующий update-сценарий применит свежий app shell автоматически.

## Install UX

- На мобильных экранах приложение показывает мягкую dismissible-подсказку установки только если оно не открыто в standalone-режиме и нет более важного overlay: карточки места, диалога «О проекте» или нижнего consent/notice.
- Подсказка установки не скрывает настоящее состояние результатов поиска: счётчик и пустое состояние остаются видимыми выше нижней install-плашки.
- Android и другие браузеры, которые отправили `beforeinstallprompt`, запускают native prompt только по явному нажатию пользователя.
- iOS показывает ручную инструкцию Safari: «Поделиться» → «На экран “Домой”» → «Добавить»; программный prompt на iOS не вызывается.
- Диалог «О проекте» сохраняет повторный доступ к установке только пока приложение не открыто standalone; в установленной PWA install-секция полностью скрыта.
- События install UX отправляются только через typed analytics adapter для пользовательских действий и только с безопасными labels `platform`, `source` и `outcome`.

## Offline fallback

- Если app shell уже установлен, приложение открывает базовый интерфейс offline.
- Если tiles недоступны, UI показывает резервное состояние карты и сохраняет доступ к уже загруженному текстовому контенту, когда он есть в кеше.
- SPA fallback для GitHub Pages использует `/index.html` в service worker и опубликованный `404.html`, совпадающий с `index.html`, чтобы прямые URL вида `/maps/main` открывались до и после установки app shell.
