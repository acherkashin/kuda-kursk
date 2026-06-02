import { type KeyboardEvent, type ReactNode, useEffect, useRef } from "react";
import { SearchIcon, XIcon } from "lucide-react";

type SearchBoxProps = {
  autoFocus?: boolean;
  className?: string;
  onEscape?: () => void;
  value: string;
  onChange: (value: string) => void;
  onReset: () => void;
  trailingAction?: ReactNode;
};

export function SearchBox({ autoFocus = false, className = "", onEscape, value, onChange, onReset, trailingAction }: SearchBoxProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus) {
      inputRef.current?.focus();
    }
  }, [autoFocus]);

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      onEscape?.();
    }
  };

  return (
    <div
      className={`grid min-h-12 grid-cols-[auto_1fr_auto_auto] items-center gap-3 rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] px-3 text-[15px] text-[var(--color-muted)] shadow-[var(--shadow-rest)] transition-[box-shadow,border-color] duration-150 focus-within:border-[var(--color-accent)] focus-within:shadow-[var(--shadow-focus)] max-[700px]:min-h-11 max-[520px]:gap-2 max-[520px]:px-2.5 ${className}`}
    >
      <SearchIcon aria-hidden="true" size={18} />
      <input
        ref={inputRef}
        className="min-w-0 border-0 bg-transparent text-[var(--color-text)] outline-0 placeholder:text-[var(--color-muted)]"
        aria-label="Поиск мест"
        type="search"
        value={value}
        placeholder="Найти место, улицу или район..."
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={handleKeyDown}
      />
      {value ? (
        <button
          className="grid h-7 w-7 place-items-center rounded-lg border-0 bg-[var(--color-accent-soft)] text-[var(--color-accent)] transition-colors duration-150 hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
          type="button"
          aria-label="Сбросить поиск"
          onClick={onReset}
        >
          <XIcon aria-hidden="true" size={16} />
        </button>
      ) : null}
      {trailingAction}
    </div>
  );
}
