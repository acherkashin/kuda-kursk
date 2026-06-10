import { useId, useState } from "react";
import { ChevronDownIcon, ExternalLinkIcon, MapIcon, NavigationIcon } from "lucide-react";
import { buildRouteUrl, type RouteLink } from "../../domain/routeLinks";
import { Button } from "../ui/Button";
import { ButtonLink } from "../ui/ButtonLink";

type RouteActionsProps = {
  links: RouteLink[];
  onOpen: (provider: RouteLink["provider"]) => void;
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

export function RouteActions({ links, onOpen }: RouteActionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const routesId = useId();

  return (
    <div className="grid gap-2" aria-label="Маршруты">
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
      {isOpen ? (
        <div id={routesId} className="grid gap-2">
          {links.map((link) => {
            const Icon = icons[link.provider];

            return (
              <ButtonLink
                href={link.url}
                key={link.provider}
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
