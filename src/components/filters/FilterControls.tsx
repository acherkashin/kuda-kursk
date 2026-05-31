import * as ToggleGroup from "@radix-ui/react-toggle-group";
import type { Category, Collection } from "../../domain/places";

type FilterControlsProps = {
  categories: Category[];
  collections: Collection[];
  selectedCategoryIds: string[];
  selectedCollectionIds: string[];
  onCategoryChange: (ids: string[]) => void;
  onCollectionChange: (ids: string[]) => void;
};

export function FilterControls({
  categories,
  collections,
  selectedCategoryIds,
  selectedCollectionIds,
  onCategoryChange,
  onCollectionChange
}: FilterControlsProps) {
  return (
    <div className="filter-controls">
      <ToggleGroup.Root
        className="filter-group"
        type="multiple"
        value={selectedCategoryIds}
        onValueChange={onCategoryChange}
        aria-label="Категории"
      >
        {categories.map((category) => (
          <ToggleGroup.Item className="filter-chip" value={category.id} key={category.id} aria-label={category.label}>
            {category.label}
          </ToggleGroup.Item>
        ))}
      </ToggleGroup.Root>
      <ToggleGroup.Root
        className="filter-group filter-group--collections"
        type="multiple"
        value={selectedCollectionIds}
        onValueChange={onCollectionChange}
        aria-label="Подборки"
      >
        {collections.slice(0, 7).map((collection) => (
          <ToggleGroup.Item className="filter-chip" value={collection.id} key={collection.id} aria-label={collection.label}>
            {collection.label}
          </ToggleGroup.Item>
        ))}
      </ToggleGroup.Root>
    </div>
  );
}
