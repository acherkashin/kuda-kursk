import { ExternalLinkIcon, XIcon } from "lucide-react";
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
  const hasPhotos = viewModel.photos.length > 0;

  return (
    <motion.aside
      className="fixed top-4 right-4 bottom-4 z-4 w-[min(410px,calc(100vw-32px))] overflow-x-hidden overflow-y-auto rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] shadow-[var(--shadow-panel)] max-[700px]:inset-0 max-[700px]:h-dvh max-[700px]:w-full max-[700px]:rounded-none max-[700px]:border-0"
      data-testid="place-details-panel"
      data-layout={layout}
      aria-label={`Подробности: ${viewModel.name}`}
      initial={reduceMotion ? false : { opacity: 0, x: layout === "drawer" ? 0 : 24, y: layout === "drawer" ? 24 : 0 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration: reduceMotion ? 0 : 0.32, ease: [0.22, 1, 0.36, 1] }}
    >
      <div
        className={`relative p-3 pb-0 max-[700px]:px-4 max-[700px]:pt-[max(16px,env(safe-area-inset-top))] ${hasPhotos ? "" : "min-h-16"}`}
      >
        <button
          className="absolute top-5 right-5 z-2 grid h-10 w-10 place-items-center rounded-full border border-[var(--color-line)] bg-white/95 text-[var(--color-text)] shadow-[var(--shadow-rest)] backdrop-blur transition-[border-color,box-shadow,transform] duration-150 hover:border-[var(--color-line-strong)] hover:shadow-[var(--shadow-raised)] active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)] max-[700px]:top-[calc(max(16px,env(safe-area-inset-top))+8px)] max-[700px]:right-6"
          type="button"
          aria-label="Закрыть карточку"
          onClick={onClose}
        >
          <XIcon aria-hidden="true" size={20} strokeWidth={2.2} />
        </button>
        <PhotoCarousel photos={viewModel.photos} title={viewModel.name} />
      </div>
      <div className="grid gap-4 p-5 max-[700px]:px-5 max-[700px]:pb-[calc(24px+env(safe-area-inset-bottom))]">
        <h1 className="m-0 text-[28px] leading-[1.05] font-bold tracking-[-0.02em] [text-wrap:balance]">{viewModel.name}</h1>
        <p className="m-0 text-[14px] leading-[1.55] text-[var(--color-text-secondary)]">{viewModel.description}</p>
        <dl className="m-0 grid gap-0 border-y border-[var(--color-line)]">
          <div className="grid gap-1 py-3">
            <dt className="text-[10.5px] font-semibold text-[var(--color-muted)] uppercase tracking-[0.08em]">Адрес</dt>
            <dd className="m-0 text-[14px]">{viewModel.address}</dd>
          </div>
          <div className="grid gap-1 border-t border-[var(--color-line)] py-3">
            <dt className="text-[10.5px] font-semibold text-[var(--color-muted)] uppercase tracking-[0.08em]">Координаты</dt>
            <dd className="m-0 text-[14px] tabular-nums">{viewModel.coordinates}</dd>
          </div>
        </dl>
        {viewModel.tip ? <PlaceTip tip={viewModel.tip} /> : null}
        <RouteActions links={routeLinks} onOpen={onRouteOpen} />
        {viewModel.detailsLink ? (
          <a
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[var(--color-line)] bg-white px-3 py-2 text-sm font-semibold tracking-[-0.01em] text-[var(--color-text)] no-underline transition-[border-color,box-shadow] duration-150 hover:border-[var(--color-line-strong)] hover:shadow-[var(--shadow-rest)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
            href={viewModel.detailsLink.url}
            target="_blank"
            rel="noreferrer"
            onClick={() => onExternalLinkOpen(viewModel.detailsLink?.kind ?? "site")}
          >
            <ExternalLinkIcon aria-hidden="true" size={16} />
            <span>{viewModel.detailsLink.label}</span>
          </a>
        ) : null}
        <ExternalLinks links={viewModel.links} onOpen={onExternalLinkOpen} />
      </div>
    </motion.aside>
  );
}
