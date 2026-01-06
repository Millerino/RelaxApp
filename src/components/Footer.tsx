interface FooterProps {
  onPricingClick?: () => void;
  onFAQClick?: () => void;
  onSupportClick?: () => void;
  onLegalClick?: () => void;
}

export function Footer({ onPricingClick, onFAQClick, onSupportClick, onLegalClick }: FooterProps) {
  return (
    <footer className="fixed bottom-0 left-0 right-0 z-30 px-6 py-4">
      <div className="max-w-4xl mx-auto flex justify-center items-center gap-6">
        <button
          onClick={onFAQClick}
          className="text-xs text-silver-400 dark:text-silver-500
                   hover:text-silver-600 dark:hover:text-silver-300
                   transition-colors"
        >
          FAQ
        </button>
        <span className="text-silver-300 dark:text-silver-700">·</span>
        <button
          onClick={onSupportClick}
          className="text-xs text-silver-400 dark:text-silver-500
                   hover:text-silver-600 dark:hover:text-silver-300
                   transition-colors"
        >
          Support
        </button>
        <span className="text-silver-300 dark:text-silver-700">·</span>
        <button
          onClick={onPricingClick}
          className="text-xs text-silver-400 dark:text-silver-500
                   hover:text-silver-600 dark:hover:text-silver-300
                   transition-colors"
        >
          Pricing
        </button>
        <span className="text-silver-300 dark:text-silver-700">·</span>
        <button
          onClick={onLegalClick}
          className="text-xs text-silver-400 dark:text-silver-500
                   hover:text-silver-600 dark:hover:text-silver-300
                   transition-colors"
        >
          Legal
        </button>
      </div>
    </footer>
  );
}
