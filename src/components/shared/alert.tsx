/**
 * @fileoverview Reusable Alert component for displaying success, error, info, and warning messages.
 * Styled with the warm-professional design system using CSS variables.
 */

interface AlertProps {
  /** Alert type: success (green), error (red), info (blue), or warning (amber) */
  type: "success" | "error" | "info" | "warning";
  /** The message text to display */
  message: string;
}

const alertStyles: Record<AlertProps["type"], string> = {
  success:
    "bg-[var(--success-bg)] border-[var(--success)]/30 text-[var(--success)]",
  error:
    "bg-[var(--error-bg)] border-[var(--error)]/30 text-[var(--error)]",
  info:
    "bg-[var(--info-bg)] border-[var(--info)]/30 text-[var(--info)]",
  warning:
    "bg-[var(--warning-bg)] border-[var(--warning)]/30 text-[var(--warning)]",
};

const alertIcons: Record<AlertProps["type"], string> = {
  success: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
  error: "M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z",
  info: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  warning: "M12 9v2m0 4h.01M10.29 3.86l-8.3 14.33A1 1 0 002.7 20h18.6a1 1 0 00.9-1.45l-8.3-14.33a1 1 0 00-1.7 0z",
};

/**
 * Displays a styled alert message with color coding and icon.
 * @param props.type - The alert type determining the color scheme.
 * @param props.message - The message to display.
 */
export default function Alert({ type, message }: AlertProps) {
  return (
    <div
      className={`animate-fade-in rounded-lg border px-4 py-3 text-sm font-medium ${alertStyles[type]}`}
      role="alert"
    >
      <div className="flex items-start gap-2.5">
        <svg
          className="mt-0.5 h-4 w-4 shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d={alertIcons[type]} />
        </svg>
        <span>{message}</span>
      </div>
    </div>
  );
}
