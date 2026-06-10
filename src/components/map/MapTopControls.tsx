import { useCallback, useEffect, useState } from "react";
import { InfoIcon, SearchIcon } from "lucide-react";
import { SearchBox } from "../filters/SearchBox";
import { MapLogo } from "./MapLogo";

type SearchMode = "brand" | "search";

type MapTopControlsProps = {
  query: string;
  logo: string;
  subtitle: string;
  title: string;
  onQueryChange: (value: string) => void;
  onQueryReset: () => void;
  onBackToMain?: (() => void) | undefined;
  onAboutOpen: () => void;
  isAboutOpen?: boolean;
};

function getIsMobileViewport() {
  if (typeof window === "undefined") {
    return false;
  }

  return window.matchMedia("(max-width: 700px)").matches;
}

function useIsMobileViewport() {
  const [isMobile, setIsMobile] = useState(getIsMobileViewport);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 700px)");
    const handleChange = () => setIsMobile(mediaQuery.matches);

    handleChange();
    mediaQuery.addEventListener("change", handleChange);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

  return isMobile;
}

function SearchButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      className="grid h-9 w-9 flex-none cursor-pointer place-items-center rounded-full border border-[var(--color-line)] bg-[var(--color-surface-lower)] text-[var(--color-text)] transition-[border-color,box-shadow,transform] duration-150 hover:border-[var(--color-line-strong)] hover:shadow-[var(--shadow-rest)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)] active:scale-[0.95]"
      type="button"
      aria-label="Открыть поиск"
      onClick={onClick}
    >
      <SearchIcon aria-hidden="true" size={18} />
    </button>
  );
}

function AboutButton({ isActive, onClick }: { isActive: boolean; onClick: () => void }) {
  return (
    <button
      className="grid h-9 w-9 flex-none cursor-pointer place-items-center rounded-full border border-[var(--color-line)] bg-[var(--color-surface-lower)] text-[var(--color-text)] transition-[border-color,box-shadow,transform] duration-150 hover:border-[var(--color-line-strong)] hover:shadow-[var(--shadow-rest)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)] active:scale-[0.95] data-[active=true]:border-[var(--color-accent)] data-[active=true]:shadow-[0_0_0_3px_var(--color-accent-soft)]"
      type="button"
      aria-label="О проекте"
      aria-pressed={isActive}
      data-active={isActive ? "true" : "false"}
      onClick={onClick}
    >
      <InfoIcon aria-hidden="true" size={18} />
    </button>
  );
}

function BrandActions({ isAboutOpen, onAboutOpen, onSearchOpen }: { isAboutOpen: boolean; onAboutOpen: () => void; onSearchOpen?: () => void }) {
  return (
    <span className="flex flex-none items-center gap-2">
      <AboutButton isActive={isAboutOpen} onClick={onAboutOpen} />
      {onSearchOpen ? <SearchButton onClick={onSearchOpen} /> : null}
    </span>
  );
}

function BrandBar({
  isAboutOpen,
  logo,
  onAboutOpen,
  onBack,
  onSearchOpen,
  subtitle,
  title
}: Pick<MapTopControlsProps, "logo" | "onAboutOpen" | "subtitle" | "title"> & {
  isAboutOpen: boolean;
  onBack?: (() => void) | undefined;
  onSearchOpen: () => void;
}) {
  return (
    <MapLogo
      actionSlot={<BrandActions isAboutOpen={isAboutOpen} onAboutOpen={onAboutOpen} onSearchOpen={onSearchOpen} />}
      logoSrc={logo}
      onBack={onBack}
      subtitle={subtitle}
      title={title}
    />
  );
}

function SearchPanel({
  onClose,
  onEscape,
  onQueryChange,
  onQueryReset,
  query
}: Pick<MapTopControlsProps, "onQueryChange" | "onQueryReset" | "query"> & {
  onClose: () => void;
  onEscape: () => void;
}) {
  return (
    <section aria-label="Поиск">
      <SearchBox
        autoFocus
        className="w-full"
        value={query}
        onChange={onQueryChange}
        onEmptyAction={onClose}
        onEscape={onEscape}
        onReset={onQueryReset}
      />
    </section>
  );
}

export function MapTopControls({
  isAboutOpen = false,
  logo,
  onAboutOpen,
  onBackToMain,
  onQueryChange,
  onQueryReset,
  query,
  subtitle,
  title
}: MapTopControlsProps) {
  const [mobileMode, setMobileMode] = useState<SearchMode>("brand");
  const isMobile = useIsMobileViewport();

  const openSearch = useCallback(() => {
    setMobileMode("search");
  }, []);

  const closeSearch = useCallback(() => {
    setMobileMode("brand");
  }, []);

  const handleEscape = useCallback(() => {
    if (query.trim()) {
      onQueryReset();
      return;
    }

    closeSearch();
  }, [closeSearch, onQueryReset, query]);

  return (
    <div className="map-top-ui fixed top-[max(16px,env(safe-area-inset-top))] left-[max(16px,env(safe-area-inset-left))] z-3 w-[min(820px,calc(100vw-476px))] min-w-[min(720px,calc(100vw-32px))] max-[900px]:w-[calc(100vw-32px)] max-[900px]:min-w-0 max-[700px]:top-[max(12px,env(safe-area-inset-top))] max-[700px]:right-[max(12px,env(safe-area-inset-right))] max-[700px]:left-[max(12px,env(safe-area-inset-left))] max-[700px]:w-auto">
      {isMobile ? (
        mobileMode === "brand" ? (
          <BrandBar
            isAboutOpen={isAboutOpen}
            logo={logo}
            title={title}
            subtitle={subtitle}
            onAboutOpen={onAboutOpen}
            onBack={onBackToMain}
            onSearchOpen={openSearch}
          />
        ) : (
          <SearchPanel
            query={query}
            onClose={closeSearch}
            onEscape={handleEscape}
            onQueryChange={onQueryChange}
            onQueryReset={onQueryReset}
          />
        )
      ) : (
        <div className="flex items-start gap-3">
          <MapLogo
            actionSlot={<BrandActions isAboutOpen={isAboutOpen} onAboutOpen={onAboutOpen} />}
            className="w-[340px] max-w-[min(340px,calc(100vw-32px))] flex-none"
            logoSrc={logo}
            title={title}
            subtitle={subtitle}
            onBack={onBackToMain}
          />
          <section className="min-w-0 flex-1" aria-label="Поиск">
            <SearchBox value={query} onChange={onQueryChange} onReset={onQueryReset} />
          </section>
        </div>
      )}
    </div>
  );
}
