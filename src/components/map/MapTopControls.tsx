import { useCallback, useEffect, useState } from "react";
import { InfoIcon, SearchIcon } from "lucide-react";
import { IconButton } from "../ui/IconButton";
import { CategoryFilter, type CategoryFilterItem } from "../filters/CategoryFilter";
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
  categories: readonly CategoryFilterItem[];
  activeCategory: string | null;
  onCategorySelect: (slug: string) => void;
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

function BrandActions({ isAboutOpen, onAboutOpen, onSearchOpen }: { isAboutOpen: boolean; onAboutOpen: () => void; onSearchOpen?: () => void }) {
  return (
    <span className="flex flex-none items-center gap-2">
      <IconButton size="sm" type="button" aria-label="О проекте" aria-pressed={isAboutOpen} isActive={isAboutOpen} onClick={onAboutOpen}>
        <InfoIcon aria-hidden="true" size={18} />
      </IconButton>
      {onSearchOpen ? (
        <IconButton size="sm" type="button" aria-label="Открыть поиск" onClick={onSearchOpen}>
          <SearchIcon aria-hidden="true" size={18} />
        </IconButton>
      ) : null}
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
  activeCategory,
  categories,
  isAboutOpen = false,
  logo,
  onAboutOpen,
  onBackToMain,
  onCategorySelect,
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
    <div className="map-top-ui fixed top-[max(16px,env(safe-area-inset-top))] left-[max(16px,env(safe-area-inset-left))] z-3 w-fit max-w-[min(980px,calc(100vw-476px))] max-[1120px]:max-w-[calc(100vw-32px)] max-[700px]:top-[max(12px,env(safe-area-inset-top))] max-[700px]:right-[max(12px,env(safe-area-inset-right))] max-[700px]:left-[max(12px,env(safe-area-inset-left))] max-[700px]:w-auto max-[700px]:max-w-none">
      <div className="min-w-0 max-w-full">
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
          <div className="flex w-full max-w-full items-start gap-3">
            <MapLogo
              actionSlot={<BrandActions isAboutOpen={isAboutOpen} onAboutOpen={onAboutOpen} />}
              className="w-fit min-w-[340px] max-w-[min(470px,calc(100vw-32px))] flex-[0_1_auto] max-[1120px]:max-w-[min(470px,48vw)]"
              logoSrc={logo}
              title={title}
              subtitle={subtitle}
              onBack={onBackToMain}
            />
            <section className="w-[482px] max-w-[482px] min-w-0 flex-[1_1_482px]" aria-label="Поиск">
              <SearchBox value={query} onChange={onQueryChange} onReset={onQueryReset} />
            </section>
          </div>
        )}
        <CategoryFilter
          activeCategory={activeCategory}
          categories={categories}
          onCategorySelect={onCategorySelect}
        />
      </div>
    </div>
  );
}
