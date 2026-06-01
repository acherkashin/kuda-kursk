import type { PublicMapConfig } from "../../domain/mapCatalog";

type PublicMapHeaderProps = {
  map: PublicMapConfig;
  placeCount: number;
};

export function PublicMapHeader({ map, placeCount }: PublicMapHeaderProps) {
  return (
    <section
      className="fixed bottom-[max(16px,env(safe-area-inset-bottom))] left-[max(16px,env(safe-area-inset-left))] z-3 w-[min(420px,calc(100vw-32px))] rounded-lg border border-[var(--color-line)] bg-[var(--color-surface)] p-3.5 shadow-[var(--shadow-panel)] max-[700px]:right-2 max-[700px]:bottom-2 max-[700px]:left-2 max-[700px]:w-auto"
      aria-label="Открытая карта"
    >
      <h1 className="m-0 mb-1.5 text-xl tracking-normal">{map.title}</h1>
      <span className="block text-sm leading-snug font-bold text-[var(--color-text-secondary)] tabular-nums">{placeCount} мест</span>
    </section>
  );
}
