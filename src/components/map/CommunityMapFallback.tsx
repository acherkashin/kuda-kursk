import { Link } from "react-router";

type CommunityMapFallbackProps = {
  slug: string;
};

export function CommunityMapFallback({ slug }: CommunityMapFallbackProps) {
  return (
    <section className="community-fallback" data-testid="community-fallback" aria-label="Карта сообщества не найдена">
      <h1>Карта не найдена</h1>
      <p>Ссылка `/community/{slug}` не совпала с подготовленными картами.</p>
      <Link className="text-button" to="/">
        На основную карту
      </Link>
    </section>
  );
}
