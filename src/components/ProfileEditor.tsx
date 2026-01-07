import { useState } from 'react';
import type { UserProfile, WellnessGoal } from '../types';

interface ProfileEditorProps {
  profile: UserProfile | undefined;
  onSave: (profile: UserProfile) => void;
  onClose: () => void;
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

const COUNTRIES = [
  'Norway', 'United States', 'United Kingdom', 'Canada', 'Australia',
  'Germany', 'France', 'Sweden', 'Denmark', 'Netherlands', 'Spain',
  'Italy', 'Japan', 'South Korea', 'India', 'Brazil', 'Mexico', 'Other'
];

export function ProfileEditor({ profile, onSave, onClose }: ProfileEditorProps) {
  const [name, setName] = useState(profile?.name || '');
  const [birthday, setBirthday] = useState(profile?.birthday || '');
  const [gender, setGender] = useState<UserProfile['gender']>(profile?.gender);
  const [country, setCountry] = useState(profile?.country || '');
  const [wellnessGoals, setWellnessGoals] = useState<WellnessGoal[]>(
    profile?.wellnessGoals || []
  );
  const [isSaving, setIsSaving] = useState(false);

  const toggleGoal = (goal: WellnessGoal) => {
    setWellnessGoals(prev =>
      prev.includes(goal)
        ? prev.filter(g => g !== goal)
        : prev.length < 4 ? [...prev, goal] : prev
    );
  };

  const handleSave = () => {
    if (name.trim().length < 2) return;

    setIsSaving(true);
    const updatedProfile: UserProfile = {
      name: name.trim(),
      birthday: birthday || undefined,
      gender,
      country: country || undefined,
      wellnessGoals: wellnessGoals.length > 0 ? wellnessGoals : undefined,
      createdAt: profile?.createdAt || Date.now(),
    };

    // Simulate brief save delay for UX
    setTimeout(() => {
      onSave(updatedProfile);
      setIsSaving(false);
    }, 300);
  };

  const canSave = name.trim().length >= 2;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative glass-card p-0 w-full max-w-lg animate-slide-up overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white/80 dark:bg-silver-900/80 backdrop-blur-sm border-b border-silver-200/50 dark:border-silver-700/30 px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-medium text-silver-800 dark:text-silver-100">
            Edit Profile
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-silver-400 hover:text-silver-600 dark:hover:text-silver-200 transition-colors rounded-lg hover:bg-silver-100/50 dark:hover:bg-silver-800/50"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Avatar and Name */}
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-lavender-400 to-lavender-600 flex items-center justify-center text-white text-2xl font-medium shrink-0">
              {name.charAt(0).toUpperCase() || '?'}
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-silver-700 dark:text-silver-200 mb-1.5">
                Display Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="input-field"
                autoFocus
              />
              {name.trim().length > 0 && name.trim().length < 2 && (
                <p className="text-xs text-red-500 mt-1">Name must be at least 2 characters</p>
              )}
            </div>
          </div>

          {/* Birthday */}
          <div>
            <label className="block text-sm font-medium text-silver-700 dark:text-silver-200 mb-1.5">
              Birthday <span className="text-silver-400 font-normal">(optional)</span>
            </label>
            <input
              type="date"
              value={birthday}
              onChange={(e) => setBirthday(e.target.value)}
              className="input-field"
            />
          </div>

          {/* Gender */}
          <div>
            <label className="block text-sm font-medium text-silver-700 dark:text-silver-200 mb-2">
              Gender <span className="text-silver-400 font-normal">(optional)</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                { value: 'female', label: 'Female' },
                { value: 'male', label: 'Male' },
                { value: 'non-binary', label: 'Non-binary' },
                { value: 'prefer-not-to-say', label: 'Prefer not to say' },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setGender(option.value as UserProfile['gender'])}
                  className={`px-4 py-2 rounded-xl text-sm transition-all
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

          {/* Country */}
          <div>
            <label className="block text-sm font-medium text-silver-700 dark:text-silver-200 mb-1.5">
              Country <span className="text-silver-400 font-normal">(optional)</span>
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

          {/* Wellness Goals */}
          <div>
            <label className="block text-sm font-medium text-silver-700 dark:text-silver-200 mb-2">
              Wellness Goals <span className="text-silver-400 font-normal">(select up to 4)</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {WELLNESS_GOALS.map((goal) => (
                <button
                  key={goal.id}
                  onClick={() => toggleGoal(goal.id)}
                  className={`px-3 py-2.5 rounded-xl text-sm transition-all flex items-center gap-2
                           ${wellnessGoals.includes(goal.id)
                             ? 'bg-lavender-500 text-white ring-2 ring-lavender-300'
                             : 'bg-silver-100 dark:bg-silver-800 text-silver-600 dark:text-silver-300 hover:bg-silver-200 dark:hover:bg-silver-700'
                           }`}
                >
                  <span>{goal.icon}</span>
                  <span className="text-xs">{goal.label}</span>
                </button>
              ))}
            </div>
            <p className="text-xs text-silver-400 mt-2">
              {wellnessGoals.length}/4 selected
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white/80 dark:bg-silver-900/80 backdrop-blur-sm border-t border-silver-200/50 dark:border-silver-700/30 px-6 py-4 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 btn-secondary py-3"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!canSave || isSaving}
            className="flex-1 btn-primary py-3 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSaving ? (
              <>
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
