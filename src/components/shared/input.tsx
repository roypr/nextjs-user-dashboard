/**
 * @fileoverview Reusable Input component with label and error message display.
 * Wraps a native HTML input with consistent warm-professional styling.
 * Smooth box-shadow transition for focus state — not just color.
 * Supports password visibility toggle when type="password".
 */

"use client";

import { useState } from "react";

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
  type = "text",
  ...rest
}: InputProps) {
  const inputId =
    id ?? label.toLowerCase().replace(/\s+/g, "-");

  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword && showPassword ? "text" : type;

  return (
    <div className="mb-4">
      <label
        htmlFor={inputId}
        className="label-base"
      >
        {label}
      </label>
      <div className="relative">
        <input
          id={inputId}
          type={inputType}
          className={`input-base ${
            isPassword ? "pr-10" : ""
          } ${
            error
              ? "!border-[var(--error)] !shadow-[0_0_0_1px_var(--error)]"
              : ""
          } ${className}`}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={error ? `${inputId}-error` : undefined}
          {...rest}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
            aria-label={showPassword ? "Hide password" : "Show password"}
            tabIndex={-1}
          >
            {showPassword ? (
              /* Eye-off (hidden) icon */
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
            ) : (
              /* Eye (visible) icon */
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        )}
      </div>
      {error && (
        <p id={`${inputId}-error`} className="mt-1.5 text-sm text-[var(--error)]" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
