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
    <div className="grid gap-2" data-testid="external-links" aria-label="Внешние ссылки">
      {links.map((link) => (
        <a
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[var(--color-line)] bg-white px-3 py-2 text-sm font-semibold tracking-[-0.01em] text-[var(--color-text)] no-underline transition-[border-color,box-shadow] duration-150 hover:border-[var(--color-line-strong)] hover:shadow-[var(--shadow-rest)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
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
