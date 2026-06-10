import { useState } from "react";
import { MapIcon, MessageCircleWarningIcon, XIcon } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { buildPlaceDetails } from "../../domain/placeDetails";
import type { PlaceFeature } from "../../domain/places";
import { projectInfo } from "../../domain/projectInfo";
import { buildRouteLinks, type RouteLink } from "../../domain/routeLinks";
import { resolvePublicPath } from "../../services/publicPath";
import { Button } from "../ui/Button";
import { IconButton } from "../ui/IconButton";
import { ExternalLinks } from "./ExternalLinks";
import { PlaceTip } from "./PlaceTip";
import { RouteActions } from "./RouteActions";

type PlaceDetailsPanelProps = {
  place: PlaceFeature | null;
  onClose: () => void;
  onRouteOpen: (provider: RouteLink["provider"]) => void;
  onExternalLinkOpen: (kind: string) => void;
  onOpenMap: (slug: string) => void;
};

function usePanelLayout() {
  if (typeof window === "undefined") {
    return "side-panel";
  }

  return window.matchMedia("(max-width: 700px)").matches ? "drawer" : "side-panel";
}

function PlaceFeedbackLink({ placeName }: { placeName: string }) {
  return (
    <footer className="mt-1 flex justify-end border-t border-[var(--color-line)] pt-3">
      <a
        className="inline-flex min-h-9 items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-medium text-[var(--color-muted)] no-underline transition-[background-color,color,transform] duration-150 hover:bg-[var(--color-surface-lower)] hover:text-[var(--color-text-secondary)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)] active:scale-[0.98]"
        href={projectInfo.feedbackUrl}
        target="_blank"
        rel="noreferrer"
        aria-label={`Сообщить о проблеме с местом «${placeName}»`}
      >
        <MessageCircleWarningIcon aria-hidden="true" size={15} strokeWidth={1.9} />
        <span>Нашли ошибку?</span>
      </a>
    </footer>
  );
}

export function PlaceDetailsPanel({ place, onClose, onRouteOpen, onExternalLinkOpen, onOpenMap }: PlaceDetailsPanelProps) {
  const reduceMotion = useReducedMotion();
  const layout = usePanelLayout();
  const [loadedHeroPhotoSrc, setLoadedHeroPhotoSrc] = useState<string | null>(null);

  if (!place) {
    return null;
  }

  const viewModel = buildPlaceDetails(place);
  const [longitude, latitude] = place.geometry.coordinates;
  const routeLinks = buildRouteLinks({ longitude, latitude });
  const hasPhotos = viewModel.photos.length > 0;
  const heroPhoto = hasPhotos ? viewModel.photos[0] : null;
  const extraPhotos = viewModel.photos.slice(1);
  const isHeroPhotoLoaded = heroPhoto ? loadedHeroPhotoSrc === heroPhoto.src : false;

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
      {heroPhoto ? (
        <div className="relative [container-type:inline-size]">
          <div
            className={
              isHeroPhotoLoaded
                ? "relative grid max-h-[150cqw] place-items-center overflow-hidden bg-[var(--color-surface-lower)]"
                : "relative grid h-[300px] place-items-center overflow-hidden bg-[var(--color-surface-lower)] max-[700px]:h-[40dvh]"
            }
          >
            <img
              className={isHeroPhotoLoaded ? "block h-auto w-full" : "block h-full w-full object-cover"}
              src={resolvePublicPath(heroPhoto.src)}
              alt={heroPhoto.caption ?? viewModel.name}
              fetchPriority="high"
              onLoad={() => setLoadedHeroPhotoSrc(heroPhoto.src)}
            />
            <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(20,14,8,0.80)_0%,rgba(20,14,8,0.40)_28%,rgba(20,14,8,0.06)_52%,transparent_65%)]" />
            <IconButton
              variant="overlay"
              type="button"
              aria-label="Закрыть карточку"
              className="absolute top-4 right-4 z-2 max-[700px]:top-[max(16px,env(safe-area-inset-top))]"
              onClick={onClose}
            >
              <XIcon aria-hidden="true" size={20} strokeWidth={2.2} />
            </IconButton>
            <div className="absolute bottom-0 left-0 right-0 px-5 pb-5 pt-14">
              <h1
                className="m-0 text-[28px] font-bold leading-[1.1] tracking-[-0.01em] text-white [font-family:var(--font-editorial)] [text-wrap:balance] [text-shadow:0_1px_10px_rgba(20,14,8,0.55)]"
              >
                {viewModel.name}
              </h1>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative min-h-16 px-5 pb-4 pt-5 max-[700px]:pt-[max(20px,env(safe-area-inset-top))]">
          <IconButton
            type="button"
            aria-label="Закрыть карточку"
            className="absolute top-4 right-4 z-2 max-[700px]:top-[max(16px,env(safe-area-inset-top))]"
            onClick={onClose}
          >
            <XIcon aria-hidden="true" size={20} strokeWidth={2.2} />
          </IconButton>
          <h1
            className="m-0 pr-12 text-[28px] font-bold leading-[1.05] tracking-[-0.02em] [font-family:var(--font-editorial)] [text-wrap:balance]"
          >
            {viewModel.name}
          </h1>
        </div>
      )}

      <div className="grid gap-4 p-5 max-[700px]:px-5 max-[700px]:pb-[calc(24px+env(safe-area-inset-bottom))]">
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
        {viewModel.routable ? <RouteActions links={routeLinks} onOpen={onRouteOpen} /> : null}
        {viewModel.mapLink ? (
          <Button
            variant="accent-soft"
            type="button"
            data-testid="open-submap"
            onClick={() => onOpenMap(viewModel.mapLink!.slug)}
          >
            <MapIcon aria-hidden="true" size={18} />
            <span>{`Открыть карту «${viewModel.mapLink.title}»`}</span>
          </Button>
        ) : null}
        <ExternalLinks links={viewModel.links} onOpen={onExternalLinkOpen} />
        {extraPhotos.length > 0 && (
          <div
            className="-mx-5 grid auto-cols-[160px] grid-flow-col gap-2 overflow-x-auto px-5 [scroll-snap-type:x_mandatory]"
            aria-label="Ещё фотографии"
          >
            {extraPhotos.map((photo) => (
              <img
                key={`${photo.src}-${photo.caption ?? ""}`}
                className="h-[110px] w-full rounded-lg object-cover [scroll-snap-align:start]"
                src={resolvePublicPath(photo.thumbnail ?? photo.src)}
                alt={photo.caption ?? viewModel.name}
                loading="lazy"
              />
            ))}
          </div>
        )}
        <PlaceFeedbackLink placeName={viewModel.name} />
      </div>
    </motion.aside>
  );
}
