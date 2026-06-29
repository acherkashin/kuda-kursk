import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { ChevronLeftIcon, ChevronRightIcon, ImageOffIcon, XIcon } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import type { Photo } from "../../domain/places";
import { resolvePublicPath } from "../../services/publicPath";
import { IconButton } from "../ui/IconButton";

type PlacePhotoGalleryProps = {
  photos: Photo[];
  placeId: string | number;
  title: string;
  onClose: () => void;
};

type ImageStatus = "loading" | "loaded" | "error";

type PointerStart = {
  pointerId: number;
  x: number;
  y: number;
};

const SWIPE_THRESHOLD_PX = 48;

export function PlacePhotoGallery({ photos, placeId, title, onClose }: PlacePhotoGalleryProps) {
  const reduceMotion = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);
  const [imageStatus, setImageStatus] = useState<ImageStatus>("loading");
  const pointerStart = useRef<PointerStart | null>(null);
  const hasMultiplePhotos = photos.length > 1;
  const activePhoto = photos[activeIndex] ?? photos[0];

  useEffect(() => {
    setActiveIndex(0);
    pointerStart.current = null;
  }, [placeId]);

  useEffect(() => {
    setImageStatus("loading");
  }, [activePhoto?.src]);

  if (!activePhoto) {
    return null;
  }

  const activePhotoSrc = resolvePublicPath(activePhoto.src);

  function showPhoto(offset: number) {
    if (!hasMultiplePhotos) {
      return;
    }

    setActiveIndex((currentIndex) => (currentIndex + offset + photos.length) % photos.length);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      showPhoto(-1);
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      showPhoto(1);
    }
  }

  function handlePointerDown(event: PointerEvent<HTMLElement>) {
    if (!hasMultiplePhotos || event.pointerType === "mouse") {
      return;
    }

    pointerStart.current = {
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY
    };
  }

  function handlePointerUp(event: PointerEvent<HTMLElement>) {
    const start = pointerStart.current;
    pointerStart.current = null;

    if (!start || start.pointerId !== event.pointerId) {
      return;
    }

    const deltaX = event.clientX - start.x;
    const deltaY = event.clientY - start.y;

    if (Math.abs(deltaX) < SWIPE_THRESHOLD_PX || Math.abs(deltaX) <= Math.abs(deltaY)) {
      return;
    }

    showPhoto(deltaX > 0 ? -1 : 1);
  }

  return (
    <section
      className="relative h-[min(65dvh,520px)] overflow-hidden bg-[var(--color-text-secondary)] outline-none [touch-action:pan-y] focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-[var(--color-accent)]"
      role="region"
      aria-label={`Фотографии: ${title}`}
      tabIndex={hasMultiplePhotos ? 0 : undefined}
      onKeyDown={handleKeyDown}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={() => {
        pointerStart.current = null;
      }}
    >
      <img
        className="pointer-events-none absolute inset-0 block h-full w-full scale-110 object-cover saturate-[0.72] blur-2xl"
        src={activePhotoSrc}
        alt=""
        aria-hidden="true"
        draggable={false}
      />
      <div className="pointer-events-none absolute inset-0 bg-[rgba(50,34,22,0.32)]" />

      <motion.img
        key={activePhoto.src}
        className={
          imageStatus === "error"
            ? "relative z-1 block h-full w-full object-contain opacity-0"
            : "relative z-1 block h-full w-full object-contain"
        }
        src={activePhotoSrc}
        alt={activePhoto.caption ?? title}
        draggable={false}
        fetchPriority={activeIndex === 0 ? "high" : "auto"}
        initial={reduceMotion ? false : { opacity: 0 }}
        animate={{ opacity: imageStatus === "error" ? 0 : 1 }}
        transition={{ duration: reduceMotion ? 0 : 0.18, ease: "easeOut" }}
        onLoad={() => setImageStatus("loaded")}
        onError={() => setImageStatus("error")}
      />

      {imageStatus === "error" ? (
        <div
          className="absolute inset-0 z-3 grid place-content-center gap-2 px-6 text-center text-[13px] text-white/80"
          role="status"
        >
          <ImageOffIcon className="mx-auto" aria-hidden="true" size={24} strokeWidth={1.8} />
          <span>Не удалось загрузить фотографию</span>
        </div>
      ) : null}

      <div className="pointer-events-none absolute inset-0 z-2 bg-[linear-gradient(to_top,rgba(20,14,8,0.82)_0%,rgba(20,14,8,0.42)_28%,rgba(20,14,8,0.08)_50%,transparent_66%)]" />

      {hasMultiplePhotos ? (
        <>
          <span
            className="absolute top-4 left-4 z-3 rounded-full border border-white/20 bg-black/45 px-2.5 py-1 text-[12px] font-semibold text-white tabular-nums backdrop-blur-sm max-[700px]:top-[max(16px,env(safe-area-inset-top))]"
            aria-live="polite"
            aria-atomic="true"
          >
            {activeIndex + 1} / {photos.length}
          </span>
          <IconButton
            size="lg"
            variant="overlay"
            type="button"
            aria-label="Предыдущее фото"
            className="absolute top-1/2 left-3 z-3 -translate-y-1/2"
            onClick={() => showPhoto(-1)}
          >
            <ChevronLeftIcon aria-hidden="true" size={24} strokeWidth={2} />
          </IconButton>
          <IconButton
            size="lg"
            variant="overlay"
            type="button"
            aria-label="Следующее фото"
            className="absolute top-1/2 right-3 z-3 -translate-y-1/2"
            onClick={() => showPhoto(1)}
          >
            <ChevronRightIcon aria-hidden="true" size={24} strokeWidth={2} />
          </IconButton>
        </>
      ) : null}

      <IconButton
        size="lg"
        variant="overlay"
        type="button"
        aria-label="Закрыть карточку"
        className="absolute top-4 right-4 z-3 max-[700px]:top-[max(16px,env(safe-area-inset-top))]"
        onClick={onClose}
      >
        <XIcon aria-hidden="true" size={20} strokeWidth={2.2} />
      </IconButton>

      <div className="pointer-events-none absolute right-0 bottom-0 left-0 z-3 px-5 pt-14 pb-5">
        <h1 className="m-0 text-[28px] leading-[1.1] font-bold tracking-[-0.01em] text-white [font-family:var(--font-editorial)] [text-shadow:0_1px_10px_rgba(20,14,8,0.55)] [text-wrap:balance]">
          {title}
        </h1>
      </div>
    </section>
  );
}
