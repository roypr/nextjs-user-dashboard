/**
 * @fileoverview Simple search input component with text input and submit button.
 * Wraps in a <form> that submits via query params (no debounce for MVP).
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
 * Wraps the input and submit button in a <form> element.
 *
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
        className="block w-full max-w-xs rounded border border-gray-300 px-3 py-2 text-sm shadow-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        type="submit"
        className="inline-flex items-center rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
      >
        Search
      </button>
    </form>
  );
}
