import type { CommunityMap } from "../../domain/communityMaps";

type CommunityMapHeaderProps = {
  map: CommunityMap;
  placeCount: number;
  linkOnlyCount: number;
};

export function CommunityMapHeader({ map, placeCount, linkOnlyCount }: CommunityMapHeaderProps) {
  return (
    <section className="community-header" aria-label="Карта сообщества">
      <h1>{map.title}</h1>
      {map.description ? <p>{map.description}</p> : null}
      <span>
        {placeCount} мест, из них {linkOnlyCount} по ссылке. Карта не является закрытым пространством.
      </span>
    </section>
  );
}
