import type { SVGProps } from "react";
import { ExternalLinkIcon, GlobeIcon } from "lucide-react";
import type { ExternalLink } from "../../domain/places";
import { ButtonLink } from "../ui/ButtonLink";

type ExternalLinksProps = {
  links: ExternalLink[];
  onOpen: (kind: string) => void;
};

type SocialKind = "vk" | "telegram" | "instagram";

type SocialLink = ExternalLink & {
  kind: SocialKind;
};

function VkLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        fill="currentColor"
        d="M3.3 7.1c.1 5.5 2.9 8.8 7.8 8.8h.3v-3.1c1.8.2 3.1 1.5 3.6 3.1h2.6c-.7-2.4-2.5-3.8-3.6-4.4 1.1-.7 2.7-2.3 3.1-4.4h-2.4c-.5 1.7-2 3.3-3.3 3.4V7.1H9v6c-1.4-.4-3.1-2.1-3.2-6H3.3Z"
      />
    </svg>
  );
}

function TelegramLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        fill="currentColor"
        d="M19.8 5.1c.3-.1.6.2.5.5l-2.4 12.8c-.1.5-.7.7-1.1.4l-3.7-2.8-1.9 1.8c-.3.3-.8.1-.8-.3v-3.1l6.7-6.1c.3-.3-.1-.7-.4-.5l-8.3 5.2-3.6-1.1c-.6-.2-.6-1.1 0-1.3l14.5-5.5Z"
      />
    </svg>
  );
}

function InstagramLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M8.5 4h7A4.5 4.5 0 0 1 20 8.5v7a4.5 4.5 0 0 1-4.5 4.5h-7A4.5 4.5 0 0 1 4 15.5v-7A4.5 4.5 0 0 1 8.5 4Zm0 2A2.5 2.5 0 0 0 6 8.5v7A2.5 2.5 0 0 0 8.5 18h7a2.5 2.5 0 0 0 2.5-2.5v-7A2.5 2.5 0 0 0 15.5 6h-7ZM12 8.2a3.8 3.8 0 1 0 0 7.6 3.8 3.8 0 0 0 0-7.6Zm0 2a1.8 1.8 0 1 1 0 3.6 1.8 1.8 0 0 1 0-3.6Zm4-1.1a1.1 1.1 0 1 0 0-2.2 1.1 1.1 0 0 0 0 2.2Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

const socialIcons = {
  vk: VkLogo,
  telegram: TelegramLogo,
  instagram: InstagramLogo
} satisfies Record<SocialKind, typeof VkLogo>;

function isSocialLink(link: ExternalLink): link is SocialLink {
  return link.kind === "vk" || link.kind === "telegram" || link.kind === "instagram";
}

function isDetailsLink(link: ExternalLink) {
  return link.kind === "site" || link.kind === "details";
}

export function hasRenderableExternalLinks(links: ExternalLink[]) {
  return links.some((link) => isDetailsLink(link) || isSocialLink(link));
}

export function ExternalLinks({ links, onOpen }: ExternalLinksProps) {
  if (links.length === 0) {
    return null;
  }

  const detailsLinks = links.filter(isDetailsLink);
  const socialLinks = links.filter(isSocialLink);

  if (!hasRenderableExternalLinks(links)) {
    return null;
  }

  return (
    <div className="grid gap-3" data-testid="external-links" aria-label="Официальные ссылки">
      {detailsLinks.map((link) => {
        const Icon = link.kind === "site" ? GlobeIcon : ExternalLinkIcon;

        return (
          <ButtonLink
            href={link.url}
            key={`${link.kind}-${link.id ?? link.url}`}
            target="_blank"
            rel="noreferrer"
            onClick={() => onOpen(link.kind ?? "details")}
          >
            <Icon aria-hidden="true" size={16} />
            <span>{link.label}</span>
          </ButtonLink>
        );
      })}
      {socialLinks.length > 0 ? (
        <div className="flex flex-wrap gap-2" aria-label="Социальные сети">
          {socialLinks.map((link) => {
            const Logo = socialIcons[link.kind];

            return (
              <a
                className="grid h-11 w-11 place-items-center rounded-full border border-[var(--color-line)] bg-white text-[var(--color-text)] no-underline shadow-none transition-[border-color,box-shadow,transform,color] duration-150 hover:border-[var(--color-line-strong)] hover:text-[var(--color-accent)] hover:shadow-[var(--shadow-rest)] active:scale-[0.96] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
                href={link.url}
                key={`${link.kind}-${link.id ?? link.url}`}
                target="_blank"
                rel="noreferrer"
                aria-label={link.label}
                title={link.label}
                onClick={() => onOpen(link.kind)}
              >
                <Logo className="h-5 w-5" />
              </a>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
