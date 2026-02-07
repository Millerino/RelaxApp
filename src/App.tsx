import { useState, useCallback, useEffect } from 'react';
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
  const { user } = useAuth();
  const { currentStep, isOnboarded, entries } = state;

  // Smart routing based on auth status and history
  useEffect(() => {
    // Logged-in user: go to dashboard if on welcome
    if (user && currentStep === 'welcome' && entries.length > 0) {
      setStep('complete');
    }
    // Not logged-in user on complete with no entries: go to welcome
    else if (!user && currentStep === 'complete' && entries.length === 0) {
      setStep('welcome');
    }
  }, [user, currentStep, entries.length, setStep]);

  // Handle logo click
  const handleNavigateHome = () => {
    setStep(entries.length > 0 ? 'complete' : 'welcome');
  };

  // Show paywall after 3-day free trial for non-premium users
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
  const { state, setProfile, setStep, subscribeToPremium, cancelSubscription } = useApp();
  const { user, profile: supabaseProfile, refreshProfile } = useAuth();
  const [showPricing, setShowPricing] = useState(false);
  const [showFAQ, setShowFAQ] = useState(false);
  const [showSupport, setShowSupport] = useState(false);
  const [showLegal, setShowLegal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [isAuthCallback, setIsAuthCallback] = useState(
    window.location.pathname === '/auth/callback'
  );

  const handleAuthComplete = useCallback(() => {
    setIsAuthCallback(false);
    setStep('complete');
  }, [setStep]);

  const handleLoginFromPricing = () => {
    setShowPricing(false);
    setShowAuthModal(true);
  };

  // Sync premium status from Supabase profile → local state
  // This is the ONLY way premium gets activated: from the database
  useEffect(() => {
    if (!user || !supabaseProfile) return;

    const dbSaysPremium = supabaseProfile.is_premium;
    // Also grant premium if subscription was canceled but paid period hasn't ended
    const stillHasTime = supabaseProfile.premium_until
      ? new Date(supabaseProfile.premium_until) > new Date()
      : false;
    const shouldBePremium = dbSaysPremium || stillHasTime;

    if (shouldBePremium && !state.isPremium) {
      subscribeToPremium();
    }
    // Anti-tampering: revoke if DB says not premium AND paid period has ended
    if (!shouldBePremium && state.isPremium) {
      cancelSubscription();
    }
  }, [supabaseProfile?.is_premium, supabaseProfile?.premium_until, state.isPremium, user, supabaseProfile, subscribeToPremium, cancelSubscription]);

  // Handle payment success redirect from Stripe
  // Does NOT grant premium — only polls Supabase for the webhook to confirm
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.has('payment_success')) {
      window.history.replaceState({}, '', window.location.pathname);
      setStep('complete');

      if (user) {
        // Poll Supabase for webhook confirmation (5 attempts, 3s apart = 15s)
        const checkPremium = async (attempts: number) => {
          const p = await refreshProfile();
          if (p?.is_premium) {
            subscribeToPremium();
          } else if (attempts > 0) {
            setTimeout(() => checkPremium(attempts - 1), 3000);
          }
          // If all attempts fail, premium stays off
          // The sync effect will catch it on next page load when webhook completes
        };
        checkPremium(5);
      }
      // If not logged in, do nothing — can't verify payment without an account
    }
  }, []); // Run once on mount

  // Listen for auth modal events from Paywall/other components
  useEffect(() => {
    const handleOpenAuth = () => {
      setShowAuthModal(true);
    };
    window.addEventListener('openAuthModal', handleOpenAuth);
    return () => window.removeEventListener('openAuthModal', handleOpenAuth);
  }, []);

  // Auto-create minimal profile for logged-in users without one
  useEffect(() => {
    if (user && !state.profile) {
      setProfile({
        name: user.email?.split('@')[0] || 'Friend',
        createdAt: Date.now(),
      });
    }
  }, [user, state.profile, setProfile]);

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
            // Navigation handled by smart routing useEffect when user state changes
          }}
        />
      )}

      {/* Profile Setup Modal - only shown when explicitly triggered */}
      {showProfileSetup && (
        <ProfileSetup
          onComplete={(profile) => {
            setProfile(profile);
            setShowProfileSetup(false);
          }}
          onSkip={() => setShowProfileSetup(false)}
          initialProfile={state.profile}
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
