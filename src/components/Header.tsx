import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { AuthModal } from './AuthModal';
import { SubscriptionModal } from './SubscriptionModal';
import { ProfileEditor } from './ProfileEditor';

// Cute animal avatars - must match ProfileEditor
const ANIMAL_AVATARS = [
  { id: 'cat', emoji: '🐱', bg: 'from-amber-400 to-orange-500' },
  { id: 'dog', emoji: '🐶', bg: 'from-amber-300 to-yellow-500' },
  { id: 'rabbit', emoji: '🐰', bg: 'from-pink-300 to-rose-400' },
  { id: 'bear', emoji: '🐻', bg: 'from-amber-500 to-amber-700' },
  { id: 'panda', emoji: '🐼', bg: 'from-slate-300 to-slate-500' },
  { id: 'koala', emoji: '🐨', bg: 'from-slate-400 to-slate-600' },
  { id: 'fox', emoji: '🦊', bg: 'from-orange-400 to-red-500' },
  { id: 'penguin', emoji: '🐧', bg: 'from-slate-600 to-slate-800' },
  { id: 'owl', emoji: '🦉', bg: 'from-amber-600 to-amber-800' },
  { id: 'unicorn', emoji: '🦄', bg: 'from-pink-400 to-purple-500' },
  { id: 'butterfly', emoji: '🦋', bg: 'from-sky-400 to-blue-500' },
  { id: 'turtle', emoji: '🐢', bg: 'from-emerald-400 to-green-600' },
  { id: 'hedgehog', emoji: '🦔', bg: 'from-amber-400 to-amber-600' },
  { id: 'sloth', emoji: '🦥', bg: 'from-amber-300 to-amber-500' },
  { id: 'dolphin', emoji: '🐬', bg: 'from-cyan-400 to-blue-500' },
];

interface HeaderProps {
  onNavigateHome?: () => void;
}

export function Header({ onNavigateHome }: HeaderProps) {
  const { user, signOut } = useAuth();
  const { state, setProfile, setStep } = useApp();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);

  // Get display name - prefer profile name over email
  const displayName = state.profile?.name || user?.email?.split('@')[0] || 'User';
  const initials = displayName.charAt(0).toUpperCase();

  // Get avatar info
  const avatarId = state.profile?.avatar;
  const avatarData = avatarId ? ANIMAL_AVATARS.find(a => a.id === avatarId) : null;

  const handleLogoClick = () => {
    // Always navigate to complete step (home) when clicking logo
    if (state.isOnboarded) {
      setStep('complete');
    }
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
    // Reset to welcome page on logout
    setStep('welcome');
  };

  const handleManageSubscription = () => {
    setShowUserMenu(false);
    setShowSubscriptionModal(true);
  };

  const handleEditProfile = () => {
    setShowUserMenu(false);
    setShowEditProfile(true);
  };

  // Listen for custom event to open profile editor (from Quick Actions)
  useEffect(() => {
    const handleOpenProfileEditor = () => {
      if (user) {
        setShowEditProfile(true);
      }
    };

    window.addEventListener('openProfileEditor', handleOpenProfileEditor);
    return () => {
      window.removeEventListener('openProfileEditor', handleOpenProfileEditor);
    };
  }, [user]);

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
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center
                                ${avatarData
                                  ? `bg-gradient-to-br ${avatarData.bg}`
                                  : 'bg-lavender-200 dark:bg-lavender-800'
                                }`}>
                    {avatarData ? (
                      <span className="text-xl leading-none">{avatarData.emoji}</span>
                    ) : (
                      <span className="text-lavender-600 dark:text-lavender-300 text-xs font-medium">
                        {initials}
                      </span>
                    )}
                  </div>
                  <span className="hidden sm:inline max-w-[120px] truncate">
                    {displayName}
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
                    <div className="absolute right-0 mt-2 w-52 glass-card py-2 shadow-lg z-50 animate-fade-in">
                      <div className="px-4 py-2 border-b border-silver-200/50 dark:border-silver-700/30">
                        <p className="text-sm font-medium text-silver-700 dark:text-silver-200">
                          {displayName}
                        </p>
                        <p className="text-xs text-silver-500 dark:text-silver-400 truncate">
                          {user.email}
                        </p>
                        {state.isPremium && (
                          <button
                            onClick={() => {
                              setShowUserMenu(false);
                              setShowSubscriptionModal(true);
                            }}
                            className="inline-flex items-center mt-1.5 px-2 py-0.5 rounded-full text-xs
                                     bg-gradient-to-r from-lavender-500 to-lavender-600 text-white
                                     hover:from-lavender-600 hover:to-lavender-700 transition-all
                                     hover:scale-105 cursor-pointer"
                          >
                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z" clipRule="evenodd" />
                            </svg>
                            Premium
                          </button>
                        )}
                      </div>

                      <button
                        onClick={handleEditProfile}
                        className="w-full text-left px-4 py-2.5 text-sm text-silver-600 dark:text-silver-300
                                 hover:bg-silver-100/50 dark:hover:bg-silver-800/50 transition-colors
                                 flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Edit profile
                      </button>

                      <button
                        onClick={handleManageSubscription}
                        className="w-full text-left px-4 py-2.5 text-sm text-silver-600 dark:text-silver-300
                                 hover:bg-silver-100/50 dark:hover:bg-silver-800/50 transition-colors
                                 flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                        Manage subscription
                      </button>

                      <div className="border-t border-silver-200/50 dark:border-silver-700/30 mt-1 pt-1">
                        <button
                          onClick={handleSignOut}
                          className="w-full text-left px-4 py-2.5 text-sm text-silver-500 dark:text-silver-400
                                   hover:bg-silver-100/50 dark:hover:bg-silver-800/50 transition-colors
                                   flex items-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          Sign out
                        </button>
                      </div>
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
          onClose={() => {
            setShowAuthModal(false);
            // After login, redirect to dashboard
            setStep('complete');
          }}
          initialMode={authMode}
        />
      )}

      {/* Subscription Modal */}
      {showSubscriptionModal && (
        <SubscriptionModal
          onClose={() => setShowSubscriptionModal(false)}
        />
      )}

      {/* Edit Profile Modal */}
      {showEditProfile && (
        <ProfileEditor
          profile={state.profile}
          onSave={(profile) => {
            setProfile(profile);
            setShowEditProfile(false);
          }}
          onClose={() => setShowEditProfile(false)}
        />
      )}
    </>
  );
}
