/**
 * @fileoverview Search input component with text input and submit button.
 * Wraps in a <form> that submits via query params.
 * Styled consistently with the design system.
 */

interface SearchInputProps {
  /** Placeholder text for the search input */
  placeholder?: string;
  /** Current search value (for controlled display) */
  defaultValue?: string;
  /** The query param name for the search term (default: "search") */
  paramName?: string;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Search form component that submits via query params.
 * @param props.placeholder - Input placeholder text.
 * @param props.defaultValue - Current search value.
 * @param props.paramName - Query parameter name (default: "search").
 * @param props.className - Additional CSS classes.
 */
export default function SearchInput({
  placeholder = "Search...",
  defaultValue = "",
  paramName = "search",
  className = "",
}: SearchInputProps) {
  return (
    <form method="GET" className={`flex items-center gap-2 ${className}`}>
      <input
        type="text"
        name={paramName}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="input-base max-w-xs"
      />
      <button
        type="submit"
        className="inline-flex items-center gap-2 rounded-lg bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-white transition-all duration-150 hover:bg-[var(--accent-hover)] active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        Search
      </button>
    </form>
  );
}
