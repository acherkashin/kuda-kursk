# Контракт аналитики

## Consent

До явного согласия пользователя:
- script Яндекс.Метрики не загружается;
- `window.ym` не создаётся приложением;
- события не отправляются;
- analytics cookies/localStorage Метрики не появляются из-за приложения.

Техническая запись согласия:

```ts
type AnalyticsConsent = {
  status: "accepted" | "rejected";
  policyVersion: string;
  updatedAt: string;
};
```

Ключ хранения: `kursk-map:analytics-consent:v1`.

## Adapter

```ts
type AnalyticsEvent =
  | { name: "app_open"; params: { route: string; communitySlug?: string } }
  | { name: "search_used"; params: { queryLength: number; hasResults: boolean; resultCount: number } }
  | { name: "marker_selected"; params: { placeId: string | number; source: "map" | "list" } }
  | { name: "route_opened"; params: { placeId: string | number; provider: "yandex" | "2gis" | "google" } }
  | { name: "external_link_clicked"; params: { placeId: string | number; kind: string } }
  | { name: "community_map_opened"; params: { slug: string; placeCount: number; linkOnlyCount: number } }
  | { name: "analytics_consent_changed"; params: { status: "accepted" | "rejected" } };
```

## Запрещённые данные

- Сырые поисковые запросы.
- Имена, телефоны, email и другие персональные данные.
- Произвольные URL внешних ссылок, если они могут содержать пользовательские параметры.
- Идентификаторы аккаунтов, потому что аккаунтов нет в v1.

## Mapping в Яндекс.Метрику

После consent adapter вызывает `ym(counterId, "reachGoal", event.name, event.params)` для событий взаимодействия и `ym(counterId, "hit", route)` для значимых route changes SPA.

Если `VITE_YANDEX_METRIKA_ID` отсутствует, adapter работает как no-op и не создаёт ошибок UI.
