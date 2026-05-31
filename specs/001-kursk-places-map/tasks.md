# Задачи: Куда в Курске

**Ввод**: проектные документы из `specs/001-kursk-places-map/`

**Предварительные условия**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/`, `quickstart.md`

**Тесты**: тесты обязательны для этой функции, потому что план требует unit-проверки чистой логики и Playwright-проверки критичных e2e, responsive, PWA и analytics сценариев.

**Организация**: задачи сгруппированы по пользовательским историям, чтобы каждую историю можно было реализовать и проверить независимо после общей основы.

## Формат: `[ID] [P?] [Story] Описание`

- **[P]**: задача может выполняться параллельно, если не зависит от незавершённых задач и меняет отдельные файлы
- **[Story]**: метка пользовательской истории (`US1`, `US2`, `US3`, `US4`) для задач фаз историй
- Каждая задача содержит конкретный путь к файлу или директории

## Phase 1: Setup (общая инфраструктура)

**Цель**: создать frontend-only React/Vite/TypeScript PWA проект с тестовой инфраструктурой и базовой структурой файлов.

- [X] T001 Создать `package.json` с `"packageManager": "pnpm@10.6.2"`, scripts `dev`, `build`, `preview`, `typecheck`, `test:unit`, `test:e2e` и зависимостями из `specs/001-kursk-places-map/plan.md`
- [X] T002 Сгенерировать `pnpm-lock.yaml` установкой зависимостей из `package.json`
- [X] T003 Настроить Vite, React, Tailwind v4 и vite-plugin-pwa в `vite.config.ts`
- [X] T004 [P] Создать строгие TypeScript настройки в `tsconfig.json`, `tsconfig.app.json` и `tsconfig.node.json`
- [X] T005 [P] Настроить Vitest для unit-тестов TypeScript в `vitest.config.ts`
- [X] T006 [P] Настроить Playwright browsers, webServer и проекты desktop/mobile в `playwright.config.ts`
- [X] T007 [P] Создать entrypoint React приложения в `index.html`, `src/main.tsx` и `src/app/App.tsx`
- [X] T008 [P] Создать базовые стили и design tokens для спокойного картографического интерфейса в `src/styles/index.css`
- [X] T009 [P] Создать директории исходного кода по плану в `src/app/`, `src/components/`, `src/data/`, `src/domain/`, `src/services/`, `tests/e2e/` и `tests/unit/`
- [X] T010 [P] Создать публичные директории данных, стилей карты и PWA ассетов в `public/data/`, `public/map-styles/` и `public/pwa/`

---

## Phase 2: Foundational (блокирующая основа)

**Цель**: подготовить контракты данных, загрузчики, роутинг и общие сервисы, без которых нельзя надёжно реализовывать истории.

**Критично**: работу над пользовательскими историями начинать только после завершения этой фазы.

- [X] T011 [P] Описать типы `PlaceFeature`, `BalloonContent`, `Photo`, `Badge`, `Category`, `Collection` и `ExternalLink` в `src/domain/places.ts`
- [X] T012 [P] Описать типы и правила `CommunityMap` в `src/domain/communityMaps.ts`
- [X] T013 [P] Описать типы analytics consent и событий из контракта в `src/domain/analyticsEvents.ts`
- [X] T014 [P] Завести начальные категории, подборки и бейджи из спецификации в `src/domain/taxonomy.ts`
- [X] T015 [P] Написать unit-тесты валидации GeoJSON-like мест и порядка координат `[longitude, latitude]` в `tests/unit/validateGeoJsonPlace.test.ts`
- [X] T016 Реализовать валидатор GeoJSON-like мест без Zod в `src/data/validateGeoJsonPlace.ts`
- [X] T017 [P] Написать unit-тесты построения ссылок Яндекс.Карт, 2ГИС и Google Maps в `tests/unit/routeLinks.test.ts`
- [X] T018 Реализовать построение route links для координат места в `src/domain/routeLinks.ts`
- [X] T019 [P] Создать стартовый набор публичных мест, включая спортивные места из требований, в `public/data/places.json`
- [X] T020 [P] Создать стартовый набор карт сообществ с public и link-only местами в `public/data/community-maps.json`
- [X] T021 Реализовать загрузку и валидацию мест из статического JSON в `src/data/loadPlaces.ts`
- [X] T022 Реализовать загрузку и валидацию карт сообществ из статического JSON в `src/data/loadCommunityMaps.ts`
- [X] T023 Создать declarative routes `/` и `/community/:slug` в `src/app/router.tsx`
- [X] T024 Настроить общий layout приложения с полноэкранной картой как первым экраном в `src/app/App.tsx`
- [X] T025 [P] Создать заменяемый конфиг OpenFreeMap/MapLibre и центра Курска в `src/domain/mapConfig.ts`
- [X] T026 [P] Подготовить приглушённый style JSON карты с русскими подписями и нужным географическим контекстом в `public/map-styles/kursk-positron.json`
- [X] T027 [P] Создать no-op analytics adapter, который не создаёт `window.ym` без consent и env counter id, в `src/services/analytics/analyticsAdapter.ts`
- [X] T028 [P] Создать PWA registration helper с update prompt API в `src/services/pwa/registerServiceWorker.ts`

**Checkpoint**: после этой фазы проект запускается, читает статические данные, знает маршруты, типы, координаты и внешние route links.

---

## Phase 3: User Story 1 - Найти места на карте (Priority: P1)

**Цель**: пользователь открывает приложение и сразу видит полноэкранную карту Курска с заметными маркерами мест, логотипом и спокойной базовой картой.

**Независимая проверка**: открыть приложение на desktop и mobile, убедиться, что карта центрирована на Курске, маркеры видны без регистрации, hover показывает название, pan/zoom не ломает интерфейс.

### Тесты для User Story 1

- [X] T029 [P] [US1] Написать Playwright-тест первого экрана desktop/mobile с картой, логотипом и маркерами в `tests/e2e/map-first-screen.spec.ts`
- [X] T030 [P] [US1] Написать Playwright-тест hover названия маркера и pan/zoom устойчивости карты в `tests/e2e/map-interactions.spec.ts`

### Реализация для User Story 1

- [X] T031 [P] [US1] Реализовать MapLibre контейнер, lifecycle и cleanup карты в `src/components/map/KurskMap.tsx`
- [X] T032 [P] [US1] Реализовать подготовку GeoJSON source для публичных мест и clustering-ready данных в `src/components/map/placeSource.ts`
- [X] T033 [US1] Добавить слои маркеров мест с изображениями и заметным visual priority в `src/components/map/placeLayers.ts`
- [X] T034 [US1] Реализовать hover tooltip с названием места для устройств с hover в `src/components/map/MarkerTooltip.tsx`
- [X] T035 [P] [US1] Реализовать маленький ненавязчивый логотип поверх карты в `src/components/map/MapLogo.tsx`
- [X] T036 [P] [US1] Реализовать loading/error/offline fallback карты без перекрытия основного UI в `src/components/map/MapFallback.tsx`
- [X] T037 [US1] Интегрировать загрузку публичных мест, MapLibre карту и выбор активного места в `src/app/App.tsx`
- [X] T038 [US1] Добавить responsive CSS для полноэкранной карты и overlay без наложений в `src/styles/index.css`
- [X] T039 [US1] Добавить событие `app_open` через analytics adapter без загрузки Метрики до consent в `src/app/App.tsx`
- [X] T040 [US1] Прогнать и зафиксировать исправления e2e сценариев US1 в `tests/e2e/map-first-screen.spec.ts` и `tests/e2e/map-interactions.spec.ts`

**Checkpoint**: US1 работает самостоятельно как MVP: карта открывается, места видны, интерфейс можно панорамировать и масштабировать.

---

## Phase 4: User Story 2 - Посмотреть подробности места (Priority: P1)

**Цель**: пользователь выбирает маркер и видит аккуратную карточку/панель места с фотографиями, описанием, бейджами, адресом, ссылками, советом и маршрутами.

**Независимая проверка**: выбрать место с полными данными и место без optional полей; убедиться, что панель показывает доступные блоки, скрывает отсутствующие и на mobile открывается удобной touch-панелью.

### Тесты для User Story 2

- [X] T041 [P] [US2] Написать Playwright-тест открытия карточки полного места и route actions в `tests/e2e/place-details.spec.ts`
- [X] T042 [P] [US2] Написать Playwright-тест скрытия optional блоков для неполного места в `tests/e2e/place-details-optional.spec.ts`
- [X] T043 [P] [US2] Написать Playwright-тест mobile drawer анимации и touch-friendly layout в `tests/e2e/place-details-mobile.spec.ts`

### Реализация для User Story 2

- [X] T044 [P] [US2] Создать модель представления карточки места из `BalloonContent` в `src/domain/placeDetails.ts`
- [X] T045 [P] [US2] Реализовать фотокарусель для одной или нескольких фотографий в `src/components/place-details/PhotoCarousel.tsx`
- [X] T046 [P] [US2] Реализовать бейджи и редакционный совет без пустых заглушек в `src/components/place-details/PlaceBadges.tsx` и `src/components/place-details/PlaceTip.tsx`
- [X] T047 [US2] Реализовать desktop side panel и mobile drawer с `prefers-reduced-motion` в `src/components/place-details/PlaceDetailsPanel.tsx`
- [X] T048 [P] [US2] Реализовать кнопки маршрутов Яндекс.Карты, 2ГИС и Google Maps с lucide icons в `src/components/place-details/RouteActions.tsx`
- [X] T049 [P] [US2] Реализовать список внешних ссылок и соцсетей без отправки произвольных URL в аналитику в `src/components/place-details/ExternalLinks.tsx`
- [X] T050 [US2] Подключить открытие/закрытие карточки к выбору маркера в `src/app/App.tsx`
- [X] T051 [US2] Отправлять `marker_selected`, `route_opened` и `external_link_clicked` через typed analytics adapter в `src/components/place-details/PlaceDetailsPanel.tsx`
- [X] T052 [US2] Добавить responsive стили панели, карусели и кнопок без наложений в `src/styles/index.css`
- [X] T053 [US2] Прогнать и зафиксировать исправления e2e сценариев US2 в `tests/e2e/place-details.spec.ts`, `tests/e2e/place-details-optional.spec.ts` и `tests/e2e/place-details-mobile.spec.ts`

**Checkpoint**: US2 работает независимо поверх карты: выбранное место можно оценить и открыть маршрут, optional поля не портят интерфейс.

---

## Phase 5: User Story 3 - Быстро найти подходящие места (Priority: P2)

**Цель**: пользователь ищет места и сужает карту категориями или подборками, при этом поиск работает поверх выбранных фильтров, а значения внутри типа фильтра объединяются через OR.

**Независимая проверка**: найти места по названию, адресу, описанию, категории, подборке и подписи ссылки; применить категории/подборки; проверить пустое состояние и сброс фильтров.

### Тесты для User Story 3

- [X] T054 [P] [US3] Написать unit-тесты нормализации запроса и поиска по значимым полям места в `tests/unit/search.test.ts`
- [X] T055 [P] [US3] Написать unit-тесты OR-фильтров категорий/подборок и сужения поиском в `tests/unit/filterPlaces.test.ts`
- [X] T056 [P] [US3] Написать Playwright-тест поиска, фильтров, пустого состояния и сброса в `tests/e2e/search-and-filters.spec.ts`

### Реализация для User Story 3

- [X] T057 [P] [US3] Реализовать нормализацию русского текста, индексацию полей и поиск без внешнего fuzzy engine в `src/domain/search.ts`
- [X] T058 [P] [US3] Реализовать фильтрацию по категориям и подборкам с OR внутри типа и AND между типами в `src/domain/filterPlaces.ts`
- [X] T059 [P] [US3] Реализовать search input с понятным reset action в `src/components/filters/SearchBox.tsx`
- [X] T060 [P] [US3] Реализовать category/collection controls на Radix Toggle Group в `src/components/filters/FilterControls.tsx`
- [X] T061 [P] [US3] Реализовать компактную панель результатов и пустое состояние в `src/components/filters/ResultsSummary.tsx`
- [X] T062 [US3] Подключить search/filter state к видимым маркерам и результатам в `src/app/App.tsx`
- [X] T063 [US3] Обновить MapLibre source при изменении видимого набора мест без пересоздания карты в `src/components/map/KurskMap.tsx`
- [X] T064 [US3] Отправлять `search_used` без сырого текста запроса и `filters_changed` с public ids в `src/components/filters/SearchBox.tsx` и `src/components/filters/FilterControls.tsx`
- [X] T065 [US3] Добавить responsive стили toolbar, chips, summary и empty state без перекрытия карты в `src/styles/index.css`
- [X] T066 [US3] Прогнать и зафиксировать исправления unit/e2e сценариев US3 в `tests/unit/search.test.ts`, `tests/unit/filterPlaces.test.ts` и `tests/e2e/search-and-filters.spec.ts`

**Checkpoint**: US3 работает самостоятельно: видимый набор мест управляется поиском и фильтрами, пустое состояние понятно, карта остаётся главным интерфейсом.

---

## Phase 6: User Story 4 - Открыть карту сообщества по ссылке (Priority: P3)

**Цель**: пользователь открывает `/community/:slug` и видит отдельную карту сообщества с нужной идентичностью, public и link-only местами, а неизвестный slug получает полезный путь назад.

**Независимая проверка**: открыть известный community slug, проверить заголовок, контекст и набор мест; открыть неизвестный slug и вернуться на основную карту; выбрать место внутри community карты.

### Тесты для User Story 4

- [X] T067 [P] [US4] Написать unit-тесты выборки public и link-only мест для карты сообщества в `tests/unit/communityMaps.test.ts`
- [X] T068 [P] [US4] Написать Playwright-тест известной community route с отдельной идентичностью и набором мест в `tests/e2e/community-map.spec.ts`
- [X] T069 [P] [US4] Написать Playwright-тест неизвестной community route и возврата на `/` в `tests/e2e/community-map-fallback.spec.ts`

### Реализация для User Story 4

- [X] T070 [P] [US4] Реализовать резолвинг карты сообщества, link-only мест и fallback состояния в `src/domain/communityMaps.ts`
- [X] T071 [P] [US4] Реализовать визуальную идентичность community карты без обещания приватности в `src/components/map/CommunityMapHeader.tsx`
- [X] T072 [P] [US4] Реализовать fallback неизвестной карты сообщества с действием возврата на `/` в `src/components/map/CommunityMapFallback.tsx`
- [X] T073 [US4] Подключить route `/community/:slug` к загрузке community maps и набору видимых мест в `src/app/router.tsx`
- [X] T074 [US4] Интегрировать community context с картой, поиском, фильтрами и карточкой места в `src/app/App.tsx`
- [X] T075 [US4] Отправлять `community_map_opened` после consent с `slug`, `placeCount` и `linkOnlyCount` в `src/app/App.tsx`
- [X] T076 [US4] Добавить стили заголовка community карты и fallback без наложения на карту в `src/styles/index.css`
- [X] T077 [US4] Прогнать и зафиксировать исправления unit/e2e сценариев US4 в `tests/unit/communityMaps.test.ts`, `tests/e2e/community-map.spec.ts` и `tests/e2e/community-map-fallback.spec.ts`

**Checkpoint**: US4 работает независимо: прямые ссылки карт сообществ открывают нужный набор мест или корректный fallback.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Цель**: закрыть PWA, consent analytics, производительность, доступность и финальную проверку quickstart.

- [X] T078 [P] Реализовать consent banner/settings с хранением `kursk-map:analytics-consent:v1` в `src/components/analytics-consent/AnalyticsConsent.tsx`
- [X] T079 Интегрировать загрузку script Яндекс.Метрики только после accepted consent и `VITE_YANDEX_METRIKA_ID` в `src/services/analytics/yandexMetrika.ts`
- [X] T080 [P] Написать Playwright-тест privacy analytics до/после consent и без сырого поискового запроса в `tests/e2e/analytics-consent.spec.ts`
- [X] T081 Настроить manifest, icons, service worker cache rules и update notification в `vite.config.ts` и `src/services/pwa/registerServiceWorker.ts`
- [X] T082 [P] Написать Playwright-тест manifest, service worker, offline app shell и update UX в `tests/e2e/pwa.spec.ts`
- [X] T083 Проверить и оптимизировать сценарий 500 мест, обновление MapLibre source и поиск в `src/domain/search.ts` и `src/components/map/KurskMap.tsx`
- [X] T084 [P] Проверить keyboard/focus/ARIA для filters, details panel, consent и route actions в `src/components/filters/`, `src/components/place-details/` и `src/components/analytics-consent/`
- [X] T085 [P] Проверить отсутствие наложений UI на mobile/desktop и исправить responsive стили в `src/styles/index.css`
- [X] T086 Выполнить команды `pnpm typecheck`, `pnpm test:unit`, `pnpm test:e2e` и `pnpm build`, сверяя результат с `specs/001-kursk-places-map/quickstart.md`

---

## Зависимости и порядок выполнения

### Зависимости фаз

- **Setup (Phase 1)**: без зависимостей, можно начинать сразу.
- **Foundational (Phase 2)**: зависит от завершения Setup и блокирует все пользовательские истории.
- **User Stories (Phase 3+)**: зависят от Foundational; после этого могут выполняться параллельно разными исполнителями.
- **Polish (Phase 7)**: зависит от завершения выбранного набора пользовательских историй; analytics/PWA проверки лучше закрывать перед релизом.

### Зависимости пользовательских историй

- **US1 (P1)**: стартует после Foundational; не зависит от других историй.
- **US2 (P1)**: стартует после Foundational; использует выбор места из US1, но панель и route actions проверяются независимо на mock/seed данных.
- **US3 (P2)**: стартует после Foundational; может разрабатываться параллельно с US1/US2, если интеграция в `src/app/App.tsx` координируется отдельно.
- **US4 (P3)**: стартует после Foundational; переиспользует карту и карточку, но резолвинг данных community карты проверяется отдельно.

### Внутри каждой истории

- Тесты истории пишутся до реализации, чтобы зафиксировать ожидаемое поведение.
- Типы и чистая доменная логика выполняются до UI.
- UI компоненты выполняются до интеграции в `src/app/App.tsx`.
- История считается готовой только после прохождения её unit/e2e проверок и ручной проверки независимого критерия.

---

## Параллельные примеры

### User Story 1

```bash
Task: "T029 [P] [US1] Написать Playwright-тест первого экрана desktop/mobile с картой, логотипом и маркерами в tests/e2e/map-first-screen.spec.ts"
Task: "T030 [P] [US1] Написать Playwright-тест hover названия маркера и pan/zoom устойчивости карты в tests/e2e/map-interactions.spec.ts"
Task: "T031 [P] [US1] Реализовать MapLibre контейнер, lifecycle и cleanup карты в src/components/map/KurskMap.tsx"
Task: "T032 [P] [US1] Реализовать подготовку GeoJSON source для публичных мест и clustering-ready данных в src/components/map/placeSource.ts"
Task: "T035 [P] [US1] Реализовать маленький ненавязчивый логотип поверх карты в src/components/map/MapLogo.tsx"
```

### User Story 2

```bash
Task: "T041 [P] [US2] Написать Playwright-тест открытия карточки полного места и route actions в tests/e2e/place-details.spec.ts"
Task: "T042 [P] [US2] Написать Playwright-тест скрытия optional блоков для неполного места в tests/e2e/place-details-optional.spec.ts"
Task: "T045 [P] [US2] Реализовать фотокарусель для одной или нескольких фотографий в src/components/place-details/PhotoCarousel.tsx"
Task: "T048 [P] [US2] Реализовать кнопки маршрутов Яндекс.Карты, 2ГИС и Google Maps с lucide icons в src/components/place-details/RouteActions.tsx"
Task: "T049 [P] [US2] Реализовать список внешних ссылок и соцсетей без отправки произвольных URL в аналитику в src/components/place-details/ExternalLinks.tsx"
```

### User Story 3

```bash
Task: "T054 [P] [US3] Написать unit-тесты нормализации запроса и поиска по значимым полям места в tests/unit/search.test.ts"
Task: "T055 [P] [US3] Написать unit-тесты OR-фильтров категорий/подборок и сужения поиском в tests/unit/filterPlaces.test.ts"
Task: "T057 [P] [US3] Реализовать нормализацию русского текста, индексацию полей и поиск без внешнего fuzzy engine в src/domain/search.ts"
Task: "T058 [P] [US3] Реализовать фильтрацию по категориям и подборкам с OR внутри типа и AND между типами в src/domain/filterPlaces.ts"
Task: "T060 [P] [US3] Реализовать category/collection controls на Radix Toggle Group в src/components/filters/FilterControls.tsx"
```

### User Story 4

```bash
Task: "T067 [P] [US4] Написать unit-тесты выборки public и link-only мест для карты сообщества в tests/unit/communityMaps.test.ts"
Task: "T068 [P] [US4] Написать Playwright-тест известной community route с отдельной идентичностью и набором мест в tests/e2e/community-map.spec.ts"
Task: "T070 [P] [US4] Реализовать резолвинг карты сообщества, link-only мест и fallback состояния в src/domain/communityMaps.ts"
Task: "T071 [P] [US4] Реализовать визуальную идентичность community карты без обещания приватности в src/components/map/CommunityMapHeader.tsx"
Task: "T072 [P] [US4] Реализовать fallback неизвестной карты сообщества с действием возврата на / в src/components/map/CommunityMapFallback.tsx"
```

---

## Стратегия реализации

### MVP First (только User Story 1)

1. Завершить Phase 1: Setup.
2. Завершить Phase 2: Foundational.
3. Завершить Phase 3: User Story 1.
4. Остановиться и проверить US1 независимо по desktop/mobile сценарию.
5. Использовать US1 как технический MVP, затем сразу добавить US2 для продуктовой ценности выбора места.

### Инкрементальная поставка

1. Setup + Foundational → проект запускается и умеет читать валидные данные.
2. US1 → карта и маркеры как технический MVP.
3. US2 → карточка места и маршруты как практичный городской гид.
4. US3 → поиск и фильтры для масштабирования до большого набора мест.
5. US4 → карты сообществ по прямым ссылкам.
6. Polish → PWA, consent analytics, производительность, доступность и финальный build.

### Параллельная работа

1. Команда вместе закрывает Setup и Foundational.
2. После Foundational можно разделить работу: один исполнитель US1/MapLibre, второй US2/place-details, третий US3/search/filter, четвёртый US4/community routes.
3. Интеграционные изменения в `src/app/App.tsx` выполнять последовательно или с короткой синхронизацией, потому что несколько историй меняют этот файл.

---

## Примечания

- Все Markdown-файлы проекта вне `.specify/` и `.agents/skills/` ведутся на русском языке.
- [P] задачи размечены только там, где файлы различаются и нет прямой зависимости от незавершённой задачи.
- Link-only места в community карте не являются приватными и не должны описываться как закрытый доступ.
- Сырые поисковые запросы, персональные данные и произвольные URL не передаются в аналитику.
- Координаты импортированных мест всегда трактуются как `[longitude, latitude]`.
