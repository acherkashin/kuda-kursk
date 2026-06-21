import { useId, useState } from "react";
import { ChevronDownIcon, ExternalLinkIcon, MapIcon, NavigationIcon } from "lucide-react";
import { buildRouteUrl, type RouteLink } from "../../domain/routeLinks";
import { Button } from "../ui/Button";
import { ButtonLink } from "../ui/ButtonLink";
import { IconButton } from "../ui/IconButton";

type RouteActionsProps = {
  links: RouteLink[];
  onOpen: (provider: RouteLink["provider"]) => void;
  variant?: "stacked" | "compact";
};

const icons = {
  yandex: NavigationIcon,
  "2gis": MapIcon,
  google: ExternalLinkIcon
} satisfies Record<RouteLink["provider"], typeof MapIcon>;

function openRouteUrl(url: string) {
  const routeWindow = window.open(url, "_blank", "noopener,noreferrer");

  if (routeWindow) {
    routeWindow.opener = null;
  }
}

function openRouteAfterGeolocation(link: RouteLink) {
  if (!("geolocation" in navigator)) {
    openRouteUrl(link.url);
    return;
  }

  navigator.geolocation.getCurrentPosition(
    ({ coords }) => {
      const url = buildRouteUrl({
        provider: link.provider,
        origin: { longitude: coords.longitude, latitude: coords.latitude },
        destination: link.destination
      });

      openRouteUrl(url);
    },
    () => openRouteUrl(link.url),
    { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
  );
}

export function RouteActions({ links, onOpen, variant = "stacked" }: RouteActionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const routesId = useId();
  const isCompact = variant === "compact";

  return (
    <div className={isCompact ? "relative" : "grid gap-2"} aria-label="Маршруты">
      {isCompact ? (
        <IconButton
          variant="primary"
          size="md"
          type="button"
          aria-label="Построить маршрут"
          title="Построить маршрут"
          aria-haspopup="menu"
          aria-controls={routesId}
          aria-expanded={isOpen}
          className="rounded-lg"
          onClick={() => setIsOpen((current) => !current)}
        >
          <NavigationIcon aria-hidden="true" size={16} strokeWidth={2.1} />
        </IconButton>
      ) : (
        <Button
          variant="primary"
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
        </Button>
      )}
      {isOpen ? (
        <div
          id={routesId}
          role={isCompact ? "menu" : undefined}
          className={isCompact ? "absolute right-0 top-[calc(100%+6px)] z-10 grid min-w-[190px] gap-1.5 rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] p-1.5 shadow-[var(--shadow-raised)]" : "grid gap-2"}
        >
          {links.map((link) => {
            const Icon = icons[link.provider];

            return (
              <ButtonLink
                href={link.url}
                key={link.provider}
                size={isCompact ? "sm" : "md"}
                role={isCompact ? "menuitem" : undefined}
                className={isCompact ? "min-h-10 px-2.5 py-1.5" : ""}
                target="_blank"
                rel="noreferrer"
                onClick={(event) => {
                  event.preventDefault();
                  onOpen(link.provider);
                  openRouteAfterGeolocation(link);
                }}
              >
                <Icon aria-hidden="true" size={18} />
                <span>{link.label}</span>
              </ButtonLink>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
