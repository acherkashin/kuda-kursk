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
      className="fixed top-4 right-4 bottom-4 z-4 w-[min(390px,calc(100vw-32px))] overflow-x-hidden overflow-y-auto rounded-lg border border-[var(--color-line)] bg-[var(--color-surface)] shadow-[var(--shadow-panel)] max-[700px]:top-auto max-[700px]:right-2 max-[700px]:bottom-2 max-[700px]:left-2 max-[700px]:max-h-[min(82dvh,720px)] max-[700px]:w-auto"
      data-testid="place-details-panel"
      data-layout={layout}
      aria-label={`Подробности: ${viewModel.name}`}
      initial={reduceMotion ? false : { opacity: 0, x: layout === "drawer" ? 0 : 24, y: layout === "drawer" ? 24 : 0 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration: reduceMotion ? 0 : 0.18, ease: "easeOut" }}
    >
      <button
        className="sticky top-2.5 left-[calc(100%-50px)] z-2 ml-auto grid h-9 w-9 place-items-center rounded-lg border border-[var(--color-line)] bg-white/90 text-[var(--color-text)]"
        type="button"
        aria-label="Закрыть карточку"
        onClick={onClose}
      >
        <XIcon aria-hidden="true" size={20} />
      </button>
      <PhotoCarousel photos={viewModel.photos} title={viewModel.name} />
      <div className="grid gap-3.5 p-4.5">
        <h1 className="m-0 text-2xl leading-tight tracking-normal max-[700px]:text-[22px]">{viewModel.name}</h1>
        <p className="m-0 text-[15px] leading-normal text-[var(--color-muted)]">{viewModel.description}</p>
        <dl className="m-0 grid gap-2.5">
          <div className="grid gap-1">
            <dt className="text-xs font-bold text-[var(--color-muted)] uppercase">Адрес</dt>
            <dd className="m-0 text-sm">{viewModel.address}</dd>
          </div>
          <div className="grid gap-1">
            <dt className="text-xs font-bold text-[var(--color-muted)] uppercase">Координаты</dt>
            <dd className="m-0 text-sm">{viewModel.coordinates}</dd>
          </div>
        </dl>
        {viewModel.tip ? <PlaceTip tip={viewModel.tip} /> : null}
        <RouteActions links={routeLinks} onOpen={onRouteOpen} />
        <ExternalLinks links={viewModel.links} onOpen={onExternalLinkOpen} />
      </div>
    </motion.aside>
  );
}
