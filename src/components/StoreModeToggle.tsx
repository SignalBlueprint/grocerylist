'use client';

interface StoreModeToggleProps {
  enabled: boolean;
  onToggle: () => void;
}

export function StoreModeToggle({ enabled, onToggle }: StoreModeToggleProps) {
  return (
    <button
      onClick={onToggle}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 ${
        enabled
          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 ring-2 ring-green-500/50'
          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
      }`}
      aria-pressed={enabled}
      title={enabled ? 'Exit store mode' : 'Enter store mode for shopping'}
    >
      {/* Cart/Store Icon */}
      <span className="relative">
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
        {/* Pulsing indicator when active */}
        {enabled && (
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse" />
        )}
      </span>
      <span className="text-sm font-medium">
        {enabled ? 'Shopping...' : 'Store Mode'}
      </span>
    </button>
  );
}
