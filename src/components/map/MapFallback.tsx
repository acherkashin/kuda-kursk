type MapFallbackProps = {
  state: "loading" | "error" | "offline";
};

const messages: Record<MapFallbackProps["state"], string> = {
  loading: "Загружаем карту",
  error: "Карта временно недоступна",
  offline: "Нет подключения к карте"
};

export function MapFallback({ state }: MapFallbackProps) {
  return (
    <div className="map-fallback" role="status">
      {messages[state]}
    </div>
  );
}
