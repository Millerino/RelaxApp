import { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { AppProvider, useApp } from './context/AppContext';
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
  const [showPricing, setShowPricing] = useState(false);
  const [showFAQ, setShowFAQ] = useState(false);
  const [showSupport, setShowSupport] = useState(false);
  const [showLegal, setShowLegal] = useState(false);

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
      {showPricing && <Pricing onClose={() => setShowPricing(false)} />}
      {showFAQ && <FAQModal onClose={() => setShowFAQ(false)} />}
      {showSupport && <SupportModal onClose={() => setShowSupport(false)} />}
      {showLegal && <LegalModal onClose={() => setShowLegal(false)} />}

      {/* Cookie Consent Banner */}
      <CookieConsent />
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppProvider>
        <AppShell />
      </AppProvider>
    </ThemeProvider>
  );
}

export default App;
