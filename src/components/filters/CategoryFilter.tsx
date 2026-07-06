import { useCallback, useEffect, useRef, useState } from "react";
import { FilterChip } from "../ui/FilterChip";

export type CategoryFilterItem = {
  slug: string;
  label: string;
};

type CategoryFilterProps = {
  activeCategory: string | null;
  categories: readonly CategoryFilterItem[];
  onCategorySelect: (slug: string) => void;
};

export function CategoryFilter({ activeCategory, categories, onCategorySelect }: CategoryFilterProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollForward, setCanScrollForward] = useState(false);

  const updateOverflowState = useCallback(() => {
    const scrollContainer = scrollRef.current;

    if (!scrollContainer) {
      return;
    }

    const remainingScroll = scrollContainer.scrollWidth - scrollContainer.clientWidth - scrollContainer.scrollLeft;
    setCanScrollForward(remainingScroll > 1);
  }, []);

  useEffect(() => {
    updateOverflowState();

    const scrollContainer = scrollRef.current;
    if (!scrollContainer) {
      return;
    }

    const resizeObserver = new ResizeObserver(updateOverflowState);
    resizeObserver.observe(scrollContainer);

    return () => resizeObserver.disconnect();
  }, [categories, updateOverflowState]);

  if (categories.length === 0) {
    return null;
  }

  return (
    <nav className="relative min-w-0 max-w-full" aria-label="Категории мест" data-testid="category-filter">
      <div
        ref={scrollRef}
        className="flex h-11 max-w-full touch-pan-x items-center gap-1.5 overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        onScroll={updateOverflowState}
      >
        {categories.map((category) => (
          <FilterChip
            key={category.slug}
            isSelected={activeCategory === category.slug}
            onClick={() => onCategorySelect(category.slug)}
          >
            {category.label}
          </FilterChip>
        ))}
      </div>
      {canScrollForward ? (
        <span
          className="pointer-events-none absolute top-0 right-0 h-11 w-7 bg-gradient-to-l from-[var(--color-page)] to-transparent"
          aria-hidden="true"
        />
      ) : null}
    </nav>
  );
}
