/**
 * @fileoverview Reusable Input component with label and error message display.
 * Wraps a native HTML input with consistent warm-professional styling.
 * Smooth box-shadow transition for focus state — not just color.
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
        className="label-base"
      >
        {label}
      </label>
      <input
        id={inputId}
        className={`input-base ${
          error
            ? "!border-[var(--error)] !shadow-[0_0_0_1px_var(--error)]"
            : ""
        } ${className}`}
        aria-invalid={error ? "true" : "false"}
        aria-describedby={error ? `${inputId}-error` : undefined}
        {...rest}
      />
      {error && (
        <p id={`${inputId}-error`} className="mt-1.5 text-sm text-[var(--error)]" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
