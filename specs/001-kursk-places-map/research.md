# Исследование: Куда в Курске

## Решение: React/Vite/TypeScript как основа frontend-only PWA

**Rationale**: Vite даёт быстрый dev/build цикл для SPA, TypeScript фиксирует контракты статических JSON-данных, а React подходит для сложной композиции карты, панелей и consent UI без backend в первой версии.

**Alternatives considered**: Next.js отклонён из-за лишней серверной модели для v1; Vue/Svelte отклонены, потому что пользователь явно выбрал React/Vite.

## Решение: Tailwind CSS v4 для стилизации

**Rationale**: интерфейс карты состоит из плотных overlay, панелей, toolbar и responsive states. Tailwind v4 через `@tailwindcss/vite` даёт zero-runtime стили, быстрый Vite integration и достаточно гибкости для design tokens через CSS variables.

**Alternatives considered**: CSS Modules проще, но хуже масштабируются для множества мелких responsive states; готовые UI kits вроде MUI/Ant Design слишком визуально тяжёлые для тихого картографического интерфейса.

## Решение: Motion для анимаций

**Rationale**: `motion/react` закрывает enter/exit анимации панели места, мобильного drawer и небольших переходов состояния без тяжёлой анимационной системы. Все анимации должны уважать `prefers-reduced-motion`.

**Alternatives considered**: CSS transitions достаточно для простых hover states, но хуже покрывают presence transitions; GSAP избыточен для v1.

## Решение: MapLibre GL JS + OpenFreeMap

**Rationale**: MapLibre GL JS работает с векторными style JSON, GeoJSON sources, слоями, clustering и кастомными marker interactions. OpenFreeMap предоставляет бесплатные OpenStreetMap-based styles без регистрации, API-ключей и cookies, что соответствует требованию v1. URL style/tiles нужно держать в конфиге, потому что public instance не обещает SLA.

**Alternatives considered**: Leaflet проще, но raster tiles хуже подходят для точной настройки подписей и muted map style; Google Maps, Яндекс.Карты и 2ГИС SDK требуют API policy/keys или коммерческих условий и не подходят как базовая карта без ключей.

## Решение: vite-plugin-pwa и workbox-window

**Rationale**: `vite-plugin-pwa` интегрируется с Vite, генерирует manifest/service worker и поддерживает React update prompt через `workbox-window`. Для v1 кешируется app shell и локальные данные/ассеты, но внешние map tiles не кешируются агрессивно.

**Alternatives considered**: Самописный service worker повышает риск ошибок обновления; отказ от PWA нарушает новое требование.

## Решение: React Router Declarative Mode

**Rationale**: нужны `/`, `/community/:slug` и fallback неизвестной карты. Declarative Mode достаточно для SPA без backend loaders и не тянет framework-mode архитектуру.

**Alternatives considered**: Собственный router через `window.location` хуже для тестов и будущих entry points; framework mode React Router избыточен для v1.

## Решение: без Zod, собственные TypeScript validators

**Rationale**: пользователь явно исключил Zod. Контент импортируется из контролируемых статических JSON-файлов, поэтому достаточно type guards/dev assertions: проверка `Feature`, `Point`, `[longitude, latitude]`, обязательных полей `balloonContent` и optional metadata без молчаливой коррекции.

**Alternatives considered**: Zod отклонён по пользовательскому решению; JSON Schema валидаторы пока избыточны для v1 и могут быть добавлены позже при появлении backend/CMS.

## Решение: Яндекс.Метрика только после явного согласия

**Rationale**: Метрика использует cookies/localStorage и идентификаторы браузера, поэтому v1 не должна загружать script или вызывать `ym` до согласия. Consent хранится локально как технический статус выбора, а события отправляются через typed adapter без raw search query.

**Alternatives considered**: Немедленная загрузка Метрики упрощает аналитику, но конфликтует с приватностью и согласованным opt-in; полный отказ от Метрики не соответствует пользовательскому требованию использовать Метрику.
