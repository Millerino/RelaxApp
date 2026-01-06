export function Footer() {
  return (
    <footer className="fixed bottom-0 left-0 right-0 z-30 px-6 py-4">
      <div className="max-w-4xl mx-auto flex justify-center items-center gap-6">
        <a
          href="#faq"
          className="text-xs text-silver-400 dark:text-silver-500
                   hover:text-silver-600 dark:hover:text-silver-300
                   transition-colors"
        >
          FAQ
        </a>
        <span className="text-silver-300 dark:text-silver-700">·</span>
        <a
          href="mailto:support@pulsero.fit"
          className="text-xs text-silver-400 dark:text-silver-500
                   hover:text-silver-600 dark:hover:text-silver-300
                   transition-colors"
        >
          Support
        </a>
        <span className="text-silver-300 dark:text-silver-700">·</span>
        <a
          href="#legal"
          className="text-xs text-silver-400 dark:text-silver-500
                   hover:text-silver-600 dark:hover:text-silver-300
                   transition-colors"
        >
          Legal
        </a>
      </div>
    </footer>
  );
}
