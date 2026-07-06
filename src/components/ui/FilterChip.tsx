import type { ButtonHTMLAttributes, ReactNode } from "react";

type FilterChipProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "aria-pressed" | "children" | "type"> & {
  children: ReactNode;
  isSelected: boolean;
};

export function FilterChip({ children, className = "", isSelected, ...props }: FilterChipProps) {
  const selectedClass = isSelected
    ? "border-[var(--color-accent)] bg-[var(--color-accent-soft)] text-[var(--color-accent)]"
    : "border-[var(--color-line)] bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:border-[var(--color-line-strong)]";

  return (
    <button
      className={`group inline-flex h-11 flex-none cursor-pointer items-center bg-transparent p-0 focus-visible:outline-none ${className}`.trim()}
      {...props}
      aria-pressed={isSelected}
      type="button"
    >
      <span
        className={`inline-flex h-6 items-center rounded-full border px-2.5 text-[11px] font-semibold tracking-[-0.01em] shadow-[var(--shadow-rest)] transition-[background-color,border-color,color,transform] duration-150 group-active:scale-[0.98] group-focus-visible:outline-2 group-focus-visible:outline-offset-2 group-focus-visible:outline-[var(--color-accent)] ${selectedClass}`}
      >
        {children}
      </span>
    </button>
  );
}
