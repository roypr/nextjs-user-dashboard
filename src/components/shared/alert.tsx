/**
 * @fileoverview Reusable Alert component for displaying success, error, and info messages.
 * Styled with Tailwind CSS with color coding based on the type prop.
 */

interface AlertProps {
  /** Alert type: success (green), error (red), or info (blue) */
  type: "success" | "error" | "info";
  /** The message text to display */
  message: string;
}

const alertStyles: Record<AlertProps["type"], string> = {
  success: "bg-green-50 border-green-200 text-green-800",
  error: "bg-red-50 border-red-200 text-red-800",
  info: "bg-blue-50 border-blue-200 text-blue-800",
};

/**
 * Displays a styled alert message with color coding.
 * @param props.type - The alert type determining the color scheme.
 * @param props.message - The message to display.
 */
export default function Alert({ type, message }: AlertProps) {
  return (
    <div
      className={`rounded border px-4 py-3 text-sm ${alertStyles[type]}`}
      role="alert"
    >
      {message}
    </div>
  );
}
