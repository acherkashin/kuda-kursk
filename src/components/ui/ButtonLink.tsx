import type { AnchorHTMLAttributes } from "react";

type ButtonLinkVariant = "primary" | "secondary" | "accent" | "accent-soft";
type ButtonLinkSize = "sm" | "md";
type ButtonLinkShape = "rounded" | "pill";

type ButtonLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  variant?: ButtonLinkVariant;
  size?: ButtonLinkSize;
  shape?: ButtonLinkShape;
  fullWidth?: boolean;
};

const variants: Record<ButtonLinkVariant, string> = {
  primary:
    "border-[var(--color-text)] bg-[var(--color-text)] text-white hover:shadow-[var(--shadow-raised)]",
  secondary:
    "border-[var(--color-line)] bg-[var(--color-surface)] text-[var(--color-text)] hover:border-[var(--color-line-strong)] hover:shadow-[var(--shadow-rest)]",
  accent:
    "border-[var(--color-accent)] bg-[var(--color-accent)] text-white hover:shadow-[var(--shadow-raised)]",
  "accent-soft":
    "border-[var(--color-accent)] bg-[var(--color-accent-soft)] text-[var(--color-accent)] hover:shadow-[var(--shadow-rest)]",
};

const sizes: Record<ButtonLinkSize, string> = {
  sm: "min-h-9 px-3 py-1.5 text-[13px]",
  md: "min-h-11 px-3 py-2 text-sm",
};

export function ButtonLink({
  variant = "secondary",
  size = "md",
  shape = "rounded",
  fullWidth = false,
  className = "",
  ...props
}: ButtonLinkProps) {
  const shapeClass = shape === "pill" ? "rounded-full" : "rounded-lg";
  const widthClass = fullWidth ? "w-full" : "";

  return (
    <a
      className={`inline-flex cursor-pointer items-center justify-center gap-2 border font-semibold no-underline tracking-[-0.01em] transition-[border-color,box-shadow,transform] duration-150 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)] ${sizes[size]} ${shapeClass} ${widthClass} ${variants[variant]} ${className}`.trim()}
      {...props}
    />
  );
}
