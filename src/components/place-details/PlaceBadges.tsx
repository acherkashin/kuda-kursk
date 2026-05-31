import type { Badge } from "../../domain/places";

type PlaceBadgesProps = {
  badges: Badge[];
};

export function PlaceBadges({ badges }: PlaceBadgesProps) {
  if (badges.length === 0) {
    return null;
  }

  return (
    <ul className="place-badges" aria-label="Бейджи места">
      {badges.map((badge) => (
        <li className="place-badge" data-tone={badge.tone ?? "neutral"} key={badge.id}>
          {badge.label}
        </li>
      ))}
    </ul>
  );
}
