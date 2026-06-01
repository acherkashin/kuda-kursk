import type { CommunityMap } from "../../domain/communityMaps";

type CommunityMapHeaderProps = {
  map: CommunityMap;
  placeCount: number;
  linkOnlyCount: number;
};

export function CommunityMapHeader({ map, placeCount, linkOnlyCount }: CommunityMapHeaderProps) {
  return (
    <section
      className="fixed bottom-[max(16px,env(safe-area-inset-bottom))] left-[max(16px,env(safe-area-inset-left))] z-3 w-[min(420px,calc(100vw-32px))] rounded-lg border border-[var(--color-line)] bg-[var(--color-surface)] p-3.5 shadow-[var(--shadow-panel)] max-[700px]:right-2 max-[700px]:bottom-2 max-[700px]:left-2 max-[700px]:w-auto"
      aria-label="Карта сообщества"
    >
      <h1 className="m-0 mb-1.5 text-xl tracking-normal">{map.title}</h1>
      {map.description ? <p className="m-0 text-sm leading-snug text-[var(--color-muted)]">{map.description}</p> : null}
      <span className="mt-2 block text-sm leading-snug font-bold text-[#33483c]">
        {placeCount} мест, из них {linkOnlyCount} по ссылке. Карта не является закрытым пространством.
      </span>
    </section>
  );
}
