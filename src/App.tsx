import { useState, useCallback } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { AppProvider, useApp } from './context/AppContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LampToggle } from './components/LampToggle';
import { Background } from './components/Background';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Pricing } from './components/Pricing';
import { FAQModal } from './components/FAQModal';
import { SupportModal } from './components/SupportModal';
import { LegalModal } from './components/LegalModal';
import { CookieConsent } from './components/CookieConsent';
import { ProgressIndicator } from './components/ProgressIndicator';
import { AuthModal } from './components/AuthModal';
import { ProfileSetup } from './components/ProfileSetup';
import { AIChat } from './components/AIChat';
import { AuthCallback } from './components/AuthCallback';
import {
  WelcomeStep,
  MoodStep,
  EmotionsStep,
  ReflectionStep,
  GratitudeStep,
  GoalsStep,
  LoginPrompt,
  Paywall,
  CompleteStep,
} from './components/steps';

interface AppContentProps {
  onShowPricing: () => void;
  onShowFAQ: () => void;
  onShowSupport: () => void;
  onShowLegal: () => void;
}

function AppContent({ onShowPricing, onShowFAQ, onShowSupport, onShowLegal }: AppContentProps) {
  const { state, shouldShowPaywall, setStep } = useApp();
  const { currentStep, isOnboarded } = state;

  // Handle logo click - go to home/complete based on state
  const handleNavigateHome = () => {
    if (isOnboarded) {
      // Returning user - go to complete screen
      setStep('complete');
    } else {
      // New user - go to welcome
      setStep('welcome');
    }
  };

  // Show paywall if user has used for 3+ days and isn't premium
  if (shouldShowPaywall && currentStep !== 'complete') {
    return (
      <>
        <Header onNavigateHome={handleNavigateHome} />
        <Paywall />
      </>
    );
  }

  const renderStep = () => {
    switch (currentStep) {
      case 'welcome':
        return <WelcomeStep />;
      case 'mood':
        return <MoodStep />;
      case 'emotions':
        return <EmotionsStep />;
      case 'reflection':
        return <ReflectionStep />;
      case 'gratitude':
        return <GratitudeStep />;
      case 'goals':
        return <GoalsStep />;
      case 'login-prompt':
        return <LoginPrompt />;
      case 'paywall':
        return <Paywall />;
      case 'complete':
        return <CompleteStep />;
      default:
        return <WelcomeStep />;
    }
  };

  // Determine if this is first time (not onboarded yet)
  const isFirstTime = !isOnboarded;

  return (
    <>
      <Header onNavigateHome={handleNavigateHome} />
      <ProgressIndicator currentStep={currentStep} isFirstTime={isFirstTime} />
      {renderStep()}
      <Footer
        onPricingClick={onShowPricing}
        onFAQClick={onShowFAQ}
        onSupportClick={onShowSupport}
        onLegalClick={onShowLegal}
      />
    </>
  );
}

function AppShell() {
  const { state, setProfile, setStep } = useApp();
  const { user } = useAuth();
  const [showPricing, setShowPricing] = useState(false);
  const [showFAQ, setShowFAQ] = useState(false);
  const [showSupport, setShowSupport] = useState(false);
  const [showLegal, setShowLegal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [showAIChat, setShowAIChat] = useState(false);
  const [isAuthCallback, setIsAuthCallback] = useState(
    window.location.pathname === '/auth/callback'
  );

  const handleAuthComplete = useCallback(() => {
    setIsAuthCallback(false);
    // Navigate to complete step if user is onboarded, otherwise welcome
    if (state.isOnboarded) {
      setStep('complete');
    }
  }, [state.isOnboarded, setStep]);

  const handleLoginFromPricing = () => {
    setShowPricing(false);
    setShowAuthModal(true);
  };

  // Check if we should prompt for profile setup (logged in but no profile)
  const shouldShowProfilePrompt = user && !state.profile && state.isOnboarded;

  // Handle auth callback route
  if (isAuthCallback) {
    return (
      <div className="min-h-screen w-full bg-lavender-50 dark:bg-silver-950 text-silver-900 dark:text-silver-100">
        <Background />
        <LampToggle />
        <main className="relative min-h-screen flex items-center justify-center px-4 py-20">
          <AuthCallback onComplete={handleAuthComplete} />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-lavender-50 dark:bg-silver-950 text-silver-900 dark:text-silver-100">
      <Background />
      <LampToggle />
      <main className="relative min-h-screen flex items-center justify-center px-4 py-20">
        <AppContent
          onShowPricing={() => setShowPricing(true)}
          onShowFAQ={() => setShowFAQ(true)}
          onShowSupport={() => setShowSupport(true)}
          onShowLegal={() => setShowLegal(true)}
        />
      </main>

      {/* AI Chat floating button - only show when user has entries */}
      {state.entries.length > 0 && (
        <button
          onClick={() => setShowAIChat(true)}
          className="fixed bottom-20 right-4 z-40 w-14 h-14 rounded-full
                   bg-gradient-to-br from-lavender-400 to-lavender-500
                   shadow-lg shadow-lavender-500/30 hover:shadow-xl hover:shadow-lavender-500/40
                   flex items-center justify-center transition-all hover:scale-105 active:scale-95"
          aria-label="Open AI Chat"
        >
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </button>
      )}

      {/* Modals */}
      {showPricing && (
        <Pricing
          onClose={() => setShowPricing(false)}
          onLoginClick={handleLoginFromPricing}
        />
      )}
      {showFAQ && <FAQModal onClose={() => setShowFAQ(false)} />}
      {showSupport && <SupportModal onClose={() => setShowSupport(false)} />}
      {showLegal && <LegalModal onClose={() => setShowLegal(false)} />}
      {showAuthModal && (
        <AuthModal
          onClose={() => {
            setShowAuthModal(false);
            // Show profile setup after successful auth if needed
            if (user && !state.profile) {
              setShowProfileSetup(true);
            }
          }}
        />
      )}

      {/* Profile Setup Modal */}
      {(showProfileSetup || shouldShowProfilePrompt) && (
        <ProfileSetup
          onComplete={(profile) => {
            setProfile(profile);
            setShowProfileSetup(false);
          }}
          onSkip={() => {
            // Set a minimal profile to stop prompting
            setProfile({
              name: user?.email?.split('@')[0] || 'Friend',
              createdAt: Date.now(),
            });
            setShowProfileSetup(false);
          }}
          initialProfile={state.profile}
        />
      )}

      {/* AI Chat Modal */}
      {showAIChat && (
        <AIChat
          entries={state.entries}
          userName={state.profile?.name}
          onClose={() => setShowAIChat(false)}
        />
      )}

      {/* Cookie Consent Banner */}
      <CookieConsent />
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppProvider>
          <AppShell />
        </AppProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
