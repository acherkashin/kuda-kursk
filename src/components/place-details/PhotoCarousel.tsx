import type { Photo } from "../../domain/places";

type PhotoCarouselProps = {
  photos: Photo[];
  title: string;
};

export function PhotoCarousel({ photos, title }: PhotoCarouselProps) {
  if (photos.length === 0) {
    return null;
  }

  return (
    <div
      className="grid auto-cols-full grid-flow-col overflow-x-auto bg-[var(--color-surface-lower)] [scroll-snap-type:x_mandatory]"
      aria-label={`Фотографии: ${title}`}
    >
      {photos.map((photo) => (
        <figure className="m-0 min-h-[210px] [scroll-snap-align:start]" key={`${photo.src}-${photo.caption ?? ""}`}>
          <img className="block h-[230px] w-full object-cover max-[700px]:h-[190px]" src={photo.src} alt={photo.caption ?? title} loading="lazy" />
          {photo.caption ? <figcaption className="px-3.5 py-2 text-[13px] text-[var(--color-muted)]">{photo.caption}</figcaption> : null}
        </figure>
      ))}
    </div>
  );
}
