import type { Badge, Category, Collection } from "./places";

export const badges: Badge[] = [
  { id: "verified-personally", label: "Проверено лично", tone: "verified" },
  { id: "dozapravka-recommended", label: "Рекомендовано Дозаправкой", tone: "recommended" }
];

export const categories: Category[] = [
  { id: "restaurants", label: "Рестораны", description: "Кафе, бары и места для ужина" },
  { id: "by-car", label: "На машине", description: "Места, куда удобно ехать на автомобиле" },
  { id: "victory-day", label: "День Победы", description: "Маршруты и точки памяти к 9 мая" },
  { id: "sport", label: "Спорт", description: "Площадки для активного отдыха" }
];

export const collections: Collection[] = [
  { id: "tourist", label: "Туристу" },
  { id: "excursions", label: "Экскурсии" },
  { id: "may-9", label: "К 9 мая" },
  { id: "easter", label: "На Пасху" },
  { id: "new-year", label: "К Новому году" },
  { id: "nastoyki", label: "Настойки" },
  { id: "historical-monuments", label: "Исторические памятники" },
  { id: "standup-clubs", label: "Стендап-клубы" },
  { id: "lost-kursk", label: "Исчезнувший Курск" },
  { id: "wwii-memorials", label: "Памятные места ВОВ" },
  { id: "movie-places", label: "Места из фильмов" },
  { id: "mansions", label: "Особняки" },
  { id: "summer-beaches", label: "Летние пляжи" }
];

export const categoryLabelById = new Map(categories.map((category) => [category.id, category.label]));
export const collectionLabelById = new Map(collections.map((collection) => [collection.id, collection.label]));
