/**
 * @fileoverview FormField wrapper component for consistent form field rendering.
 * Wraps a label, input/control, and error message with consistent styling.
 * Supports optional description text below the field.
 */

import type { ReactNode } from "react";

interface FormFieldProps {
  /** Label text displayed above the field */
  label: string;
  /** Field ID — linked to label's htmlFor */
  id: string;
  /** Error message displayed below the field */
  error?: string;
  /** Optional helper/description text below the field */
  description?: string;
  /** The form control to render (input, select, textarea, etc.) */
  children: ReactNode;
  /** Whether the field is required */
  required?: boolean;
}

/**
 * Reusable form field wrapper with label, error, and description.
 * Provides consistent spacing and error styling across all forms.
 *
 * @param props.label - The label text.
 * @param props.id - The field ID (linked to label).
 * @param props.error - Optional error message to display.
 * @param props.description - Optional helper text.
 * @param props.children - The form control element.
 * @param props.required - Whether to show a required indicator.
 */
export default function FormField({
  label,
  id,
  error,
  description,
  children,
  required = false,
}: FormFieldProps) {
  return (
    <div className="mb-4">
      <label
        htmlFor={id}
        className="label-base"
      >
        {label}
        {required && <span className="ml-1 text-[var(--error)]">*</span>}
      </label>
      {children}
      {description && (
        <p className="mt-1.5 text-xs text-[var(--text-secondary)]">{description}</p>
      )}
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-sm text-[var(--error)]" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
