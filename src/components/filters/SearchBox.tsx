import { type KeyboardEvent, useEffect, useRef } from "react";
import { SearchIcon, XIcon } from "lucide-react";

type SearchBoxProps = {
  autoFocus?: boolean;
  className?: string;
  emptyActionLabel?: string;
  onEscape?: () => void;
  onEmptyAction?: () => void;
  value: string;
  onChange: (value: string) => void;
  onReset: () => void;
};

export function SearchBox({
  autoFocus = false,
  className = "",
  emptyActionLabel = "Закрыть поиск",
  onEmptyAction,
  onEscape,
  value,
  onChange,
  onReset
}: SearchBoxProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const hasValue = value.trim().length > 0;
  const showAction = hasValue || Boolean(onEmptyAction);
  const actionLabel = hasValue ? "Сбросить поиск" : emptyActionLabel;
  const handleAction = hasValue ? onReset : onEmptyAction;

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
      className={`grid min-h-12 grid-cols-[auto_1fr_auto] items-center gap-3 rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] px-3 text-[15px] text-[var(--color-muted)] shadow-[var(--shadow-rest)] transition-[box-shadow,border-color] duration-150 focus-within:border-[var(--color-accent)] focus-within:shadow-[var(--shadow-focus)] max-[700px]:min-h-11 max-[520px]:gap-2 max-[520px]:px-2.5 ${className}`}
    >
      <SearchIcon aria-hidden="true" size={18} />
      <input
        ref={inputRef}
        className="min-w-0 border-0 bg-transparent text-[var(--color-text)] outline-0 placeholder:text-[var(--color-muted)]"
        aria-label="Поиск мест"
        role="searchbox"
        type="text"
        value={value}
        placeholder="Найти место, улицу или район..."
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={handleKeyDown}
      />
      {showAction ? (
        <button
          className="grid h-10 w-10 flex-none place-items-center rounded-full border border-[var(--color-line)] bg-[var(--color-surface-lower)] text-[var(--color-text)] shadow-[var(--shadow-rest)] transition-[border-color,box-shadow,transform] duration-150 hover:border-[var(--color-line-strong)] hover:shadow-[var(--shadow-raised)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)] active:scale-[0.98]"
          type="button"
          aria-label={actionLabel}
          onClick={handleAction}
        >
          <XIcon aria-hidden="true" size={17} strokeWidth={2.2} />
        </button>
      ) : null}
    </div>
  );
}
