/**
 * @fileoverview Reusable Button component with variant support (primary, secondary, danger).
 * Includes active scale transform for tactile feel and smooth transitions.
 */

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Button variant affecting color scheme */
  variant?: "primary" | "secondary" | "danger";
  /** Loading state — disables button and shows spinner */
  loading?: boolean;
  /** Full width button */
  fullWidth?: boolean;
}

const variantStyles: Record<string, string> = {
  primary:
    "bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] active:scale-[0.97] disabled:opacity-50",
  secondary:
    "bg-[var(--bg-card)] text-[var(--text-primary)] border border-[var(--border)] hover:bg-[var(--bg-subtle)] active:scale-[0.97] disabled:opacity-50",
  danger:
    "bg-[var(--error)] text-white hover:bg-[#b91c1c] active:scale-[0.97] disabled:opacity-50",
};

/**
 * Reusable button component with variant styles.
 * @param props.variant - Color variant (primary, secondary, danger).
 * @param props.loading - Shows a loading state and disables the button.
 * @param props.fullWidth - Makes the button full width.
 * @param props.className - Additional CSS classes.
 * @param props.children - Button content.
 * @param props.disabled - Disables the button.
 */
export default function Button({
  variant = "primary",
  loading = false,
  fullWidth = false,
  className = "",
  children,
  disabled,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 disabled:cursor-not-allowed ${variantStyles[variant]} ${fullWidth ? "w-full" : ""} ${className}`}
      disabled={disabled || loading}
      {...rest}
    >
      {loading && (
        <svg
          className="h-4 w-4 animate-spin"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      )}
      {children}
    </button>
  );
}
