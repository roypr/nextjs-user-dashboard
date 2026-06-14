/**
 * @fileoverview Reusable loading spinner component.
 * Renders a centered animated SVG spinner for loading states.
 */

interface LoadingSpinnerProps {
  /** Optional additional CSS classes */
  className?: string;
  /** Size variant: sm (small), md (medium/default), lg (large) */
  size?: "sm" | "md" | "lg";
}

const sizeClasses: Record<string, string> = {
  sm: "h-4 w-4",
  md: "h-8 w-8",
  lg: "h-12 w-12",
};

/**
 * Animated loading spinner component.
 * @param props.className - Optional additional CSS classes.
 * @param props.size - Size variant (sm, md, lg).
 */
export default function LoadingSpinner({
  className = "",
  size = "md",
}: LoadingSpinnerProps) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <svg
        className={`animate-spin text-gray-400 ${sizeClasses[size]}`}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        aria-label="Loading"
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
    </div>
  );
}
