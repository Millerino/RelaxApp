import { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { AppProvider, useApp } from './context/AppContext';
import { LampToggle } from './components/LampToggle';
import { Background } from './components/Background';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Pricing } from './components/Pricing';
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

function AppContent({ onShowPricing }: { onShowPricing: () => void }) {
  const { state, shouldShowPaywall, setStep } = useApp();
  const { currentStep } = state;

  // Handle logo click - go to home/complete based on state
  const handleNavigateHome = () => {
    if (state.isOnboarded) {
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

  return (
    <>
      <Header onNavigateHome={handleNavigateHome} />
      <ProgressIndicator currentStep={currentStep} />
      {renderStep()}
      <Footer onPricingClick={onShowPricing} />
    </>
  );
}

function AppShell() {
  const [showPricing, setShowPricing] = useState(false);

  return (
    <div className="min-h-screen w-full bg-lavender-50 dark:bg-silver-950 text-silver-900 dark:text-silver-100">
      <Background />
      <LampToggle />
      <main className="relative min-h-screen flex items-center justify-center px-4 py-20">
        <AppContent onShowPricing={() => setShowPricing(true)} />
      </main>

      {/* Pricing Modal */}
      {showPricing && (
        <Pricing onClose={() => setShowPricing(false)} />
      )}
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
