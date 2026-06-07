import { useCallback, useEffect, useState } from "react";
import { ArrowLeftIcon, SearchIcon } from "lucide-react";
import { SearchBox } from "../filters/SearchBox";
import { MapLogo } from "./MapLogo";

type SearchMode = "brand" | "search";

type MapTopControlsProps = {
  query: string;
  subtitle: string;
  title: string;
  onQueryChange: (value: string) => void;
  onQueryReset: () => void;
  onBackToMain?: (() => void) | undefined;
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

function BackToMainButton({ compact, onClick }: { compact?: boolean; onClick: () => void }) {
  return (
    <button
      className="inline-flex min-h-11 flex-none cursor-pointer items-center gap-2 rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] px-3 text-[14px] font-semibold tracking-[-0.01em] text-[var(--color-text)] shadow-[var(--shadow-rest)] transition-[border-color,box-shadow,transform] duration-150 hover:border-[var(--color-line-strong)] hover:shadow-[var(--shadow-raised)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)] active:scale-[0.98] max-[700px]:min-h-11 max-[700px]:px-2.5"
      type="button"
      aria-label="На главную карту"
      onClick={onClick}
    >
      <ArrowLeftIcon aria-hidden="true" size={18} />
      {compact ? null : <span className="max-[860px]:sr-only">На главную карту</span>}
    </button>
  );
}

function SearchButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      className="grid h-9 w-9 flex-none place-items-center rounded-full border border-[var(--color-line)] bg-[var(--color-surface-lower)] text-[var(--color-text)] transition-[border-color,box-shadow,transform] duration-150 hover:border-[var(--color-line-strong)] hover:shadow-[var(--shadow-rest)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)] active:scale-[0.98]"
      type="button"
      aria-label="Открыть поиск"
      onClick={onClick}
    >
      <SearchIcon aria-hidden="true" size={18} />
    </button>
  );
}

function BrandBar({ onSearchOpen, subtitle, title }: Pick<MapTopControlsProps, "subtitle" | "title"> & { onSearchOpen: () => void }) {
  return <MapLogo actionSlot={<SearchButton onClick={onSearchOpen} />} subtitle={subtitle} title={title} />;
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

export function MapTopControls({ onBackToMain, onQueryChange, onQueryReset, query, subtitle, title }: MapTopControlsProps) {
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
          <div className="flex items-center gap-2">
            {onBackToMain ? <BackToMainButton compact onClick={onBackToMain} /> : null}
            <div className="min-w-0 flex-1">
              <BrandBar title={title} subtitle={subtitle} onSearchOpen={openSearch} />
            </div>
          </div>
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
          {onBackToMain ? <BackToMainButton onClick={onBackToMain} /> : null}
          <MapLogo title={title} subtitle={subtitle} />
          <section className="min-w-0 flex-1" aria-label="Поиск">
            <SearchBox value={query} onChange={onQueryChange} onReset={onQueryReset} />
          </section>
        </div>
      )}
    </div>
  );
}
