/**
 * @fileoverview Reusable Button component with variant support (primary, secondary, danger).
 * Renders a styled <button> or <a> element based on props.
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
    "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 disabled:bg-blue-400",
  secondary:
    "bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-400 disabled:bg-gray-100",
  danger:
    "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 disabled:bg-red-400",
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
      className={`inline-flex items-center justify-center rounded px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed ${variantStyles[variant]} ${fullWidth ? "w-full" : ""} ${className}`}
      disabled={disabled || loading}
      {...rest}
    >
      {loading && (
        <svg
          className="mr-2 h-4 w-4 animate-spin"
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
