import { useId, useState } from "react";
import { ChevronDownIcon, ExternalLinkIcon, MapIcon, NavigationIcon } from "lucide-react";
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
  const [isOpen, setIsOpen] = useState(false);
  const routesId = useId();

  return (
    <div className="grid gap-2" aria-label="Маршруты">
      <button
        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[var(--color-text)] bg-[var(--color-text)] px-3 py-2 text-sm font-semibold tracking-[-0.01em] text-white transition-[border-color,box-shadow,transform] duration-150 hover:border-[var(--color-line-strong)] hover:shadow-[var(--shadow-rest)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)] active:scale-[0.98]"
        type="button"
        aria-controls={routesId}
        aria-expanded={isOpen}
        onClick={() => setIsOpen((current) => !current)}
      >
        <NavigationIcon aria-hidden="true" size={18} />
        <span>Построить маршрут</span>
        <ChevronDownIcon
          className={`transition-transform duration-150 ${isOpen ? "rotate-180" : ""}`}
          aria-hidden="true"
          size={16}
        />
      </button>
      {isOpen ? (
        <div id={routesId} className="grid gap-2">
          {links.map((link) => {
            const Icon = icons[link.provider];

            return (
              <a
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[var(--color-line)] bg-white px-3 py-2 text-sm font-semibold tracking-[-0.01em] text-[var(--color-text)] no-underline transition-[border-color,box-shadow] duration-150 hover:border-[var(--color-line-strong)] hover:shadow-[var(--shadow-rest)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
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
      ) : null}
    </div>
  );
}
