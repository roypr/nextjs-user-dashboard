/**
 * @fileoverview Reusable Input component with label and error message display.
 * Wraps a native HTML input with Tailwind styling and optional error state.
 */

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Label text displayed above the input */
  label: string;
  /** Error message displayed below the input */
  error?: string;
}

/**
 * Reusable input field with label and error message.
 * @param props.label - The label text.
 * @param props.error - Optional error message.
 * @param props.className - Additional CSS classes.
 * @param props.id - Input ID (auto-generated from label if not provided).
 */
export default function Input({
  label,
  error,
  className = "",
  id,
  ...rest
}: InputProps) {
  const inputId =
    id ?? label.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="mb-4">
      <label
        htmlFor={inputId}
        className="mb-1 block text-sm font-medium text-gray-700"
      >
        {label}
      </label>
      <input
        id={inputId}
        className={`block w-full rounded border px-3 py-2 text-sm shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          error
            ? "border-red-300 focus:border-red-500"
            : "border-gray-300 focus:border-blue-500"
        } ${className}`}
        aria-invalid={error ? "true" : "false"}
        aria-describedby={error ? `${inputId}-error` : undefined}
        {...rest}
      />
      {error && (
        <p id={`${inputId}-error`} className="mt-1 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
