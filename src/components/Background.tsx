export function Background() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Base gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-lavender-50 via-silver-50 to-metallic-light
                      dark:from-silver-950 dark:via-lavender-950 dark:to-silver-900
                      transition-colors duration-500" />

      {/* Metallic sheen overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/10 to-white/20
                      dark:via-lavender-500/5 dark:to-transparent
                      pointer-events-none" />

      {/* Subtle animated orbs */}
      <div className="absolute top-1/4 -left-32 w-96 h-96
                      bg-lavender-200/40 dark:bg-lavender-800/20
                      rounded-full blur-3xl animate-pulse-soft" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96
                      bg-metallic/30 dark:bg-lavender-700/10
                      rounded-full blur-3xl animate-pulse-soft"
           style={{ animationDelay: '1.5s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px]
                      bg-gradient-radial from-lavender-100/30 to-transparent
                      dark:from-lavender-900/10 dark:to-transparent
                      rounded-full blur-2xl" />

      {/* Fine grain texture for premium feel */}
      <div className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03]"
           style={{
             backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
           }} />
    </div>
  );
}
