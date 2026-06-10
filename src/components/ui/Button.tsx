import type { ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "accent" | "accent-soft";
type ButtonSize = "sm" | "md";
type ButtonShape = "rounded" | "pill";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  shape?: ButtonShape;
  fullWidth?: boolean;
};

const variants: Record<ButtonVariant, string> = {
  primary:
    "border-[var(--color-text)] bg-[var(--color-text)] text-white hover:shadow-[var(--shadow-raised)]",
  secondary:
    "border-[var(--color-line)] bg-[var(--color-surface)] text-[var(--color-text)] hover:border-[var(--color-line-strong)] hover:shadow-[var(--shadow-rest)]",
  accent:
    "border-[var(--color-accent)] bg-[var(--color-accent)] text-white hover:shadow-[var(--shadow-raised)]",
  "accent-soft":
    "border-[var(--color-accent)] bg-[var(--color-accent-soft)] text-[var(--color-accent)] hover:shadow-[var(--shadow-rest)]",
};

const sizes: Record<ButtonSize, string> = {
  sm: "min-h-9 px-3 py-1.5 text-[13px]",
  md: "min-h-11 px-3 py-2 text-sm",
};

export function Button({
  variant = "secondary",
  size = "md",
  shape = "rounded",
  fullWidth = false,
  className = "",
  ...props
}: ButtonProps) {
  const shapeClass = shape === "pill" ? "rounded-full" : "rounded-lg";
  const widthClass = fullWidth ? "w-full" : "";

  return (
    <button
      className={`inline-flex cursor-pointer items-center justify-center gap-2 border font-semibold tracking-[-0.01em] transition-[border-color,box-shadow,transform] duration-150 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)] ${sizes[size]} ${shapeClass} ${widthClass} ${variants[variant]} ${className}`.trim()}
      {...props}
    />
  );
}
