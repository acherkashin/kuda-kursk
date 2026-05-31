import { ExternalLinkIcon, MapIcon, NavigationIcon } from "lucide-react";
import type { RouteLink } from "../../domain/routeLinks";

type RouteActionsProps = {
  links: RouteLink[];
  onOpen: (provider: RouteLink["provider"]) => void;
};

const icons = {
  yandex: NavigationIcon,
  "2gis": MapIcon,
  google: ExternalLinkIcon
} satisfies Record<RouteLink["provider"], typeof MapIcon>;

export function RouteActions({ links, onOpen }: RouteActionsProps) {
  return (
    <div className="route-actions" aria-label="Маршруты">
      {links.map((link) => {
        const Icon = icons[link.provider];

        return (
          <a
            className="route-action"
            href={link.url}
            key={link.provider}
            target="_blank"
            rel="noreferrer"
            onClick={() => onOpen(link.provider)}
          >
            <Icon aria-hidden="true" size={18} />
            <span>{link.label}</span>
          </a>
        );
      })}
    </div>
  );
}
