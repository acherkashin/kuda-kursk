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
    <div className="grid gap-2" aria-label="Маршруты">
      {links.map((link, index) => {
        const Icon = icons[link.provider];

        return (
          <a
            className={`inline-flex min-h-[42px] items-center justify-center gap-2 rounded-lg border border-[var(--color-line)] px-2.5 py-2 text-sm font-bold no-underline ${
              index === 0 ? "bg-[var(--color-text)] text-white" : "bg-white text-[var(--color-text)]"
            } transition-[border-color,box-shadow] duration-150 hover:border-[var(--color-line-strong)] hover:shadow-[var(--shadow-rest)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]`}
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
