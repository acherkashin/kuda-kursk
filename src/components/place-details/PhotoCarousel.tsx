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
    <div className="photo-carousel" aria-label={`Фотографии: ${title}`}>
      {photos.map((photo) => (
        <figure className="photo-carousel__item" key={`${photo.src}-${photo.caption ?? ""}`}>
          <img src={photo.src} alt={photo.caption ?? title} loading="lazy" />
          {photo.caption ? <figcaption>{photo.caption}</figcaption> : null}
        </figure>
      ))}
    </div>
  );
}
