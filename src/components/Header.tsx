import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { AuthModal } from './AuthModal';

interface HeaderProps {
  onNavigateHome?: () => void;
}

export function Header({ onNavigateHome }: HeaderProps) {
  const { user, signOut } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogoClick = () => {
    onNavigateHome?.();
  };

  const handleLogin = () => {
    setAuthMode('login');
    setShowAuthModal(true);
  };

  const handleSignup = () => {
    setAuthMode('signup');
    setShowAuthModal(true);
  };

  const handleSignOut = async () => {
    await signOut();
    setShowUserMenu(false);
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-40 px-6 py-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          {/* Logo/Brand - left side */}
          <button
            onClick={handleLogoClick}
            className="text-silver-700 dark:text-silver-300 text-sm font-semibold tracking-wide
                     hover:text-lavender-600 dark:hover:text-lavender-400 transition-colors"
          >
            pulsero
          </button>

          {/* Auth buttons - positioned to the left of lamp */}
          <div className="flex items-center gap-2 mr-14">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 text-xs text-silver-600 dark:text-silver-300
                           px-3 py-1.5 rounded-lg hover:bg-white/30 dark:hover:bg-silver-800/30
                           transition-colors"
                >
                  <div className="w-6 h-6 rounded-full bg-lavender-200 dark:bg-lavender-800
                                flex items-center justify-center text-lavender-600 dark:text-lavender-300
                                text-xs font-medium">
                    {user.email?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <span className="hidden sm:inline max-w-[120px] truncate">
                    {user.email}
                  </span>
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown menu */}
                {showUserMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowUserMenu(false)}
                    />
                    <div className="absolute right-0 mt-2 w-48 glass-card py-2 shadow-lg z-50 animate-fade-in">
                      <div className="px-4 py-2 border-b border-silver-200/50 dark:border-silver-700/30">
                        <p className="text-xs text-silver-500 dark:text-silver-400 truncate">
                          {user.email}
                        </p>
                      </div>
                      <button
                        onClick={handleSignOut}
                        className="w-full text-left px-4 py-2 text-sm text-silver-600 dark:text-silver-300
                                 hover:bg-silver-100/50 dark:hover:bg-silver-800/50 transition-colors"
                      >
                        Sign out
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <>
                <button
                  onClick={handleLogin}
                  className="text-xs text-silver-500 dark:text-silver-400
                           hover:text-silver-700 dark:hover:text-silver-200
                           transition-colors px-3 py-1.5 rounded-lg
                           hover:bg-white/30 dark:hover:bg-silver-800/30"
                >
                  Log in
                </button>
                <button
                  onClick={handleSignup}
                  className="text-xs font-medium text-lavender-600 dark:text-lavender-400
                           hover:text-lavender-700 dark:hover:text-lavender-300
                           transition-colors px-3 py-1.5 rounded-lg
                           bg-lavender-100/50 dark:bg-lavender-900/30
                           hover:bg-lavender-100 dark:hover:bg-lavender-900/50"
                >
                  Sign up
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          initialMode={authMode}
        />
      )}
    </>
  );
}
