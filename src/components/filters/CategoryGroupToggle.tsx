import type { PlaceCategoryGroup } from "../../domain/placeCategories";

export type CategoryGroupToggleItem = {
  value: PlaceCategoryGroup;
  label: string;
};

type CategoryGroupToggleProps = {
  activeGroup: PlaceCategoryGroup;
  groups: readonly CategoryGroupToggleItem[];
  onGroupSelect: (group: PlaceCategoryGroup) => void;
};

export function CategoryGroupToggle({ activeGroup, groups, onGroupSelect }: CategoryGroupToggleProps) {
  if (groups.length < 2) {
    return null;
  }

  return (
    <div className="flex h-11 items-center gap-1.5" role="group" aria-label="Ракурс исторических мест">
      {groups.map((group) => {
        const isSelected = activeGroup === group.value;

        return (
          <button
            key={group.value}
            className="group inline-flex h-11 cursor-pointer items-center bg-transparent px-0 focus-visible:outline-none"
            type="button"
            aria-pressed={isSelected}
            onClick={() => onGroupSelect(group.value)}
          >
            <span
              className={`inline-flex h-6 items-center rounded-full border px-2.5 text-[11px] font-semibold tracking-[-0.01em] shadow-[var(--shadow-rest)] transition-[background-color,border-color,color,transform] duration-150 group-active:scale-[0.98] group-focus-visible:outline-2 group-focus-visible:outline-offset-2 group-focus-visible:outline-[var(--color-accent)] ${
                isSelected
                  ? "border-[var(--color-accent)] bg-[var(--color-accent-soft)] text-[var(--color-accent)]"
                  : "border-[var(--color-line)] bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:border-[var(--color-line-strong)]"
              }`}
            >
              {group.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
