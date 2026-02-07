import { useState } from 'react';
import type { UserProfile, WellnessGoal } from '../types';

interface ProfileSetupProps {
  onComplete: (profile: UserProfile) => void;
  onSkip?: () => void;
  initialProfile?: Partial<UserProfile>;
}

const WELLNESS_GOALS: { id: WellnessGoal; label: string; icon: string }[] = [
  { id: 'reduce-stress', label: 'Reduce stress', icon: '🧘' },
  { id: 'improve-sleep', label: 'Improve sleep', icon: '😴' },
  { id: 'build-mindfulness', label: 'Build mindfulness', icon: '🧠' },
  { id: 'track-emotions', label: 'Track emotions', icon: '💭' },
  { id: 'increase-gratitude', label: 'Increase gratitude', icon: '🙏' },
  { id: 'boost-productivity', label: 'Boost productivity', icon: '⚡' },
  { id: 'better-relationships', label: 'Better relationships', icon: '💝' },
  { id: 'self-discovery', label: 'Self-discovery', icon: '🔮' },
];

const ANIMAL_AVATARS = [
  '🐶', '🐱', '🐻', '🐼', '🦊', '🐨', '🦁', '🐯',
  '🐸', '🐵', '🐰', '🐦', '🦋', '🐢', '🐙', '🦄',
];

const COUNTRIES = [
  'Norway', 'United States', 'United Kingdom', 'Canada', 'Australia',
  'Germany', 'France', 'Sweden', 'Denmark', 'Netherlands', 'Spain',
  'Italy', 'Japan', 'South Korea', 'India', 'Brazil', 'Mexico', 'Other'
];

export function ProfileSetup({ onComplete, onSkip, initialProfile }: ProfileSetupProps) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState(initialProfile?.name || '');
  const [avatar, setAvatar] = useState(initialProfile?.avatar || '');
  const [birthday, setBirthday] = useState(initialProfile?.birthday || '');
  const [gender, setGender] = useState<UserProfile['gender']>(initialProfile?.gender);
  const [country, setCountry] = useState(initialProfile?.country || '');
  const [wellnessGoals, setWellnessGoals] = useState<WellnessGoal[]>(
    initialProfile?.wellnessGoals || []
  );

  const totalSteps = 3;

  const toggleGoal = (goal: WellnessGoal) => {
    setWellnessGoals(prev =>
      prev.includes(goal)
        ? prev.filter(g => g !== goal)
        : prev.length < 4 ? [...prev, goal] : prev
    );
  };

  const handleComplete = () => {
    const profile: UserProfile = {
      name: name.trim(),
      avatar: avatar || undefined,
      birthday: birthday || undefined,
      gender,
      country: country || undefined,
      wellnessGoals: wellnessGoals.length > 0 ? wellnessGoals : undefined,
      createdAt: Date.now(),
    };
    onComplete(profile);
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return name.trim().length >= 2;
      case 2:
        return true; // Optional step
      case 3:
        return true; // Optional step
      default:
        return false;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm"
           onClick={onSkip} />

      {/* Modal */}
      <div className="relative glass-card p-0 w-full max-w-md animate-slide-up overflow-hidden"
           onClick={e => e.stopPropagation()}>
        {/* Progress bar */}
        <div className="h-1 bg-silver-100 dark:bg-silver-800">
          <div
            className="h-full bg-gradient-to-r from-lavender-400 to-lavender-500 transition-all duration-300"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          />
        </div>

        <div className="p-6 md:p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <p className="text-xs text-lavender-500 font-medium uppercase tracking-wide mb-2">
              Step {step} of {totalSteps}
            </p>
            <h2 className="text-2xl font-light text-silver-800 dark:text-silver-100">
              {step === 1 && "Let's personalize your experience"}
              {step === 2 && 'A bit about you'}
              {step === 3 && 'What brings you here?'}
            </h2>
          </div>

          {/* Step 1: Name + Avatar */}
          {step === 1 && (
            <div className="space-y-6">
              {/* Avatar picker */}
              <div>
                <label className="block text-sm font-medium text-silver-700 dark:text-silver-200 mb-3 text-center">
                  Pick your avatar
                </label>
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-lavender-400 to-lavender-600
                                flex items-center justify-center text-2xl">
                    {avatar || (name ? name.charAt(0).toUpperCase() : '?')}
                  </div>
                </div>
                <div className="grid grid-cols-8 gap-1.5 max-w-xs mx-auto">
                  {ANIMAL_AVATARS.map(emoji => (
                    <button
                      key={emoji}
                      onClick={() => setAvatar(avatar === emoji ? '' : emoji)}
                      className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg
                                hover:bg-lavender-50 dark:hover:bg-lavender-900/30 transition-all hover:scale-110
                                ${avatar === emoji ? 'bg-lavender-100 dark:bg-lavender-900/50 ring-2 ring-lavender-400 scale-110' : ''}`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-silver-700 dark:text-silver-200 mb-2">
                  What should we call you?
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your first name"
                  className="input-field text-center text-lg"
                  autoFocus
                />
                <p className="text-xs text-silver-400 dark:text-silver-500 text-center mt-2">
                  This helps us personalize your daily greetings
                </p>
              </div>
            </div>
          )}

          {/* Step 2: Personal info */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-silver-700 dark:text-silver-200 mb-2">
                  Birthday <span className="text-silver-400">(optional)</span>
                </label>
                <input
                  type="date"
                  value={birthday}
                  onChange={(e) => setBirthday(e.target.value)}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-silver-700 dark:text-silver-200 mb-2">
                  Gender <span className="text-silver-400">(optional)</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: 'female', label: 'Female' },
                    { value: 'male', label: 'Male' },
                    { value: 'non-binary', label: 'Non-binary' },
                    { value: 'prefer-not-to-say', label: 'Prefer not to say' },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setGender(option.value as UserProfile['gender'])}
                      className={`px-4 py-2.5 rounded-xl text-sm transition-all
                               ${gender === option.value
                                 ? 'bg-lavender-500 text-white'
                                 : 'bg-silver-100 dark:bg-silver-800 text-silver-600 dark:text-silver-300 hover:bg-silver-200 dark:hover:bg-silver-700'
                               }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-silver-700 dark:text-silver-200 mb-2">
                  Country <span className="text-silver-400">(optional)</span>
                </label>
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="input-field"
                >
                  <option value="">Select country</option>
                  {COUNTRIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Step 3: Wellness goals */}
          {step === 3 && (
            <div className="space-y-4">
              <p className="text-sm text-silver-500 dark:text-silver-400 text-center mb-4">
                Select up to 4 goals that resonate with you
              </p>
              <div className="grid grid-cols-2 gap-2">
                {WELLNESS_GOALS.map((goal) => (
                  <button
                    key={goal.id}
                    onClick={() => toggleGoal(goal.id)}
                    className={`px-3 py-3 rounded-xl text-sm transition-all flex items-center gap-2
                             ${wellnessGoals.includes(goal.id)
                               ? 'bg-lavender-500 text-white ring-2 ring-lavender-300'
                               : 'bg-silver-100 dark:bg-silver-800 text-silver-600 dark:text-silver-300 hover:bg-silver-200 dark:hover:bg-silver-700'
                             }`}
                  >
                    <span className="text-lg">{goal.icon}</span>
                    <span className="text-xs font-medium">{goal.label}</span>
                  </button>
                ))}
              </div>
              <p className="text-xs text-silver-400 dark:text-silver-500 text-center">
                {wellnessGoals.length}/4 selected
              </p>
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-3 mt-8">
            {step > 1 && (
              <button
                onClick={() => setStep(step - 1)}
                className="flex-1 btn-secondary py-3"
              >
                Back
              </button>
            )}
            {onSkip && step === 1 && (
              <button
                onClick={onSkip}
                className="flex-1 btn-secondary py-3"
              >
                Skip for now
              </button>
            )}
            {step < totalSteps ? (
              <button
                onClick={() => setStep(step + 1)}
                disabled={!canProceed()}
                className="flex-1 btn-primary py-3 disabled:opacity-50"
              >
                Continue
              </button>
            ) : (
              <button
                onClick={handleComplete}
                className="flex-1 btn-primary py-3"
              >
                Get started
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
