import type { ButtonHTMLAttributes } from "react";

type IconButtonSize = "sm" | "md";
type IconButtonVariant = "default" | "overlay";

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  size?: IconButtonSize;
  variant?: IconButtonVariant;
  isActive?: boolean;
};

const sizes: Record<IconButtonSize, string> = {
  sm: "h-9 w-9 active:scale-[0.95]",
  md: "h-10 w-10 active:scale-[0.98]",
};

const variants: Record<IconButtonVariant, string> = {
  default:
    "border-[var(--color-line)] bg-[var(--color-surface-lower)] text-[var(--color-text)] transition-[border-color,box-shadow,transform] hover:border-[var(--color-line-strong)] hover:shadow-[var(--shadow-rest)] focus-visible:outline-[var(--color-accent)]",
  overlay:
    "border-white/25 bg-black/35 text-white backdrop-blur-sm transition-[background-color,border-color,transform] hover:bg-black/55 focus-visible:outline-white",
};

export function IconButton({
  size = "md",
  variant = "default",
  isActive,
  className = "",
  ...props
}: IconButtonProps) {
  const supportsActive = isActive !== undefined;
  const activeClass = supportsActive
    ? "data-[active=true]:border-[var(--color-accent)] data-[active=true]:shadow-[0_0_0_3px_var(--color-accent-soft)]"
    : "";
  const dataActive = supportsActive
    ? { "data-active": isActive ? "true" : "false" }
    : {};

  return (
    <button
      className={`grid ${sizes[size]} flex-none cursor-pointer place-items-center rounded-full border duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 ${variants[variant]} ${activeClass} ${className}`.trim()}
      {...dataActive}
      {...props}
    />
  );
}
