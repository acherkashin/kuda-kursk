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
    <div
      className="absolute right-[max(16px,env(safe-area-inset-right))] bottom-[max(16px,env(safe-area-inset-bottom))] z-2 max-w-[min(320px,calc(100vw-32px))] rounded-lg border border-[var(--color-line)] bg-[var(--color-surface)] px-3 py-2.5 text-sm text-[var(--color-muted)] shadow-[var(--shadow-panel)]"
      role="status"
    >
      {messages[state]}
    </div>
  );
}
