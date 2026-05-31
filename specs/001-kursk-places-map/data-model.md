# Модель данных: Куда в Курске

## PlaceFeature

GeoJSON-like объект места.

**Поля**
- `type`: строго `"Feature"`.
- `id`: стабильный строковый или числовой идентификатор.
- `geometry.type`: строго `"Point"`.
- `geometry.coordinates`: tuple `[longitude, latitude]`.
- `properties.id`: должен совпадать с `id` после нормализации типа.
- `properties.balloonContent`: основные поля карточки места.
- `properties.links`: optional массив внешних ссылок.
- `properties.visibility`: optional правило видимости для основной карты и карт сообществ.
- `properties.extra`: optional дополнительные редакционные поля, включая соцсети.

**Правила валидации**
- Координаты всегда `[longitude, latitude]`; для Курска ожидаемые диапазоны примерно `35..38` longitude и `50..53` latitude. Значение, похожее на `[latitude, longitude]`, является ошибкой импорта.
- Обязательные поля карточки: `name`, `description`, `address`, `coordinates`; `image` и `thumbnail` optional, но хотя бы одно пригодное изображение желательно для карточки.
- Optional поля не рендерятся пустыми блоками.

## BalloonContent

Редакционный контент карточки места.

**Поля**
- `image`: optional путь к основному изображению.
- `thumbnail`: optional путь к миниатюре.
- `images`: optional массив фотографий для карусели.
- `name`: название места.
- `description`: описание.
- `address`: адрес.
- `coordinates`: строковое представление координат для пользователя.
- `tip`: optional личный совет.
- `socials`: optional ссылки на соцсети.
- `externalUrl`: optional основной внешний URL.

## Photo

**Поля**
- `src`: путь к изображению.
- `thumbnail`: optional путь к миниатюре.
- `caption`: optional подпись.
- `order`: optional порядок отображения.

## CommunityMap

Кураторский вариант карты по прямой ссылке.

**Поля**
- `slug`: URL-safe идентификатор.
- `title`: название карты.
- `description`: optional контекст аудитории.
- `placeIds`: публичные места основной карты.
- `linkOnlyPlaceIds`: места, видимые только внутри этой карты сообщества.
- `theme`: optional визуальные настройки логотипа/акцента.

**Правила**
- Карта сообщества не является приватным пространством.
- Неизвестный `slug` показывает fallback и ссылку на основную карту.

## AnalyticsConsent

Техническая запись выбора пользователя.

**Поля**
- `status`: `accepted` или `rejected`.
- `policyVersion`: версия текста consent.
- `updatedAt`: ISO timestamp.

**Правила**
- До `accepted` нельзя загружать script Метрики или вызывать `ym`.
- Отзыв согласия переводит состояние в `rejected` и останавливает будущие analytics calls.

## AnalyticsEvent

Типизированное событие для analytics adapter.

**События**
- `app_open`
- `search_used`
- `marker_selected`
- `route_opened`
- `external_link_clicked`
- `community_map_opened`
- `analytics_consent_changed`

**Правила**
- Сырые поисковые запросы не отправляются.
- Идентификаторы мест можно отправлять как редакционные public ids.
