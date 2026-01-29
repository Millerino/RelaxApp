import { useState, useRef, useEffect } from 'react';

interface InfoTooltipProps {
  title: string;
  description: string;
}

export function InfoTooltip({ title, description }: InfoTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close tooltip when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        tooltipRef.current &&
        !tooltipRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  return (
    <div className="relative inline-flex">
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="w-4 h-4 rounded-full flex items-center justify-center
                 text-[10px] font-medium
                 bg-silver-200/50 dark:bg-silver-700/50
                 text-silver-500 dark:text-silver-400
                 hover:bg-silver-300/50 dark:hover:bg-silver-600/50
                 transition-colors"
        aria-label={`Info about ${title}`}
      >
        i
      </button>

      {isOpen && (
        <>
          {/* Backdrop for mobile - very subtle */}
          <div
            className="fixed inset-0 z-40 md:hidden"
            onClick={() => setIsOpen(false)}
          />

          {/* Tooltip */}
          <div
            ref={tooltipRef}
            className="absolute z-50 right-0 top-full mt-2
                     w-64 p-3 rounded-xl
                     bg-white/95 dark:bg-silver-800/95
                     backdrop-blur-lg
                     border border-silver-200/50 dark:border-silver-700/50
                     shadow-xl
                     animate-fade-in"
          >
            {/* Arrow pointing up */}
            <div className="absolute -top-1.5 right-2 w-3 h-3 rotate-45
                          bg-white dark:bg-silver-800
                          border-l border-t border-silver-200/50 dark:border-silver-700/50" />

            <h4 className="text-sm font-medium text-silver-800 dark:text-silver-100 mb-1.5">
              {title}
            </h4>
            <p className="text-xs text-silver-600 dark:text-silver-400 leading-relaxed">
              {description}
            </p>

            {/* Close hint */}
            <p className="text-[10px] text-silver-400 dark:text-silver-500 mt-2 text-right">
              Tap anywhere to close
            </p>
          </div>
        </>
      )}
    </div>
  );
}
