import { ThemeProvider } from './context/ThemeContext';
import { AppProvider, useApp } from './context/AppContext';
import { LampToggle } from './components/LampToggle';
import { Background } from './components/Background';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
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

function AppContent() {
  const { state, shouldShowPaywall } = useApp();
  const { currentStep } = state;

  // Show paywall if user has used for 3+ days and isn't premium
  if (shouldShowPaywall && currentStep !== 'complete') {
    return <Paywall />;
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
      <ProgressIndicator currentStep={currentStep} />
      {renderStep()}
    </>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppProvider>
        <div className="min-h-screen w-full bg-lavender-50 dark:bg-silver-950 text-silver-900 dark:text-silver-100">
          <Background />
          <Header />
          <LampToggle />
          <main className="relative min-h-screen flex items-center justify-center px-4 py-20">
            <AppContent />
          </main>
          <Footer />
        </div>
      </AppProvider>
    </ThemeProvider>
  );
}

export default App;
