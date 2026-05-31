import { ExternalLinkIcon } from "lucide-react";
import type { ExternalLink } from "../../domain/places";

type ExternalLinksProps = {
  links: ExternalLink[];
  onOpen: (kind: string) => void;
};

export function ExternalLinks({ links, onOpen }: ExternalLinksProps) {
  if (links.length === 0) {
    return null;
  }

  return (
    <div className="external-links" data-testid="external-links" aria-label="Внешние ссылки">
      {links.map((link) => (
        <a
          className="external-link"
          href={link.url}
          key={`${link.kind ?? "other"}-${link.label}-${link.id ?? link.url}`}
          target={link.kind === "phone" ? undefined : "_blank"}
          rel={link.kind === "phone" ? undefined : "noreferrer"}
          onClick={() => onOpen(link.kind ?? "other")}
        >
          <ExternalLinkIcon aria-hidden="true" size={16} />
          <span>{link.label}</span>
        </a>
      ))}
    </div>
  );
}
