import { XIcon } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { buildPlaceDetails } from "../../domain/placeDetails";
import type { PlaceFeature } from "../../domain/places";
import { buildRouteLinks, type RouteLink } from "../../domain/routeLinks";
import { ExternalLinks } from "./ExternalLinks";
import { PhotoCarousel } from "./PhotoCarousel";
import { PlaceTip } from "./PlaceTip";
import { RouteActions } from "./RouteActions";

type PlaceDetailsPanelProps = {
  place: PlaceFeature | null;
  onClose: () => void;
  onRouteOpen: (provider: RouteLink["provider"]) => void;
  onExternalLinkOpen: (kind: string) => void;
};

function usePanelLayout() {
  if (typeof window === "undefined") {
    return "side-panel";
  }

  return window.matchMedia("(max-width: 700px)").matches ? "drawer" : "side-panel";
}

export function PlaceDetailsPanel({ place, onClose, onRouteOpen, onExternalLinkOpen }: PlaceDetailsPanelProps) {
  const reduceMotion = useReducedMotion();
  const layout = usePanelLayout();

  if (!place) {
    return null;
  }

  const viewModel = buildPlaceDetails(place);
  const [longitude, latitude] = place.geometry.coordinates;
  const routeLinks = buildRouteLinks({ longitude, latitude });

  return (
    <motion.aside
      className="place-details-panel"
      data-testid="place-details-panel"
      data-layout={layout}
      aria-label={`Подробности: ${viewModel.name}`}
      initial={reduceMotion ? false : { opacity: 0, x: layout === "drawer" ? 0 : 24, y: layout === "drawer" ? 24 : 0 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration: reduceMotion ? 0 : 0.18, ease: "easeOut" }}
    >
      <button className="panel-close" type="button" aria-label="Закрыть карточку" onClick={onClose}>
        <XIcon aria-hidden="true" size={20} />
      </button>
      <PhotoCarousel photos={viewModel.photos} title={viewModel.name} />
      <div className="place-details-content">
        <h1>{viewModel.name}</h1>
        <p className="place-description">{viewModel.description}</p>
        <dl className="place-meta">
          <div>
            <dt>Адрес</dt>
            <dd>{viewModel.address}</dd>
          </div>
          <div>
            <dt>Координаты</dt>
            <dd>{viewModel.coordinates}</dd>
          </div>
        </dl>
        {viewModel.tip ? <PlaceTip tip={viewModel.tip} /> : null}
        <RouteActions links={routeLinks} onOpen={onRouteOpen} />
        <ExternalLinks links={viewModel.links} onOpen={onExternalLinkOpen} />
      </div>
    </motion.aside>
  );
}
