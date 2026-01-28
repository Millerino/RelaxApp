import { useState } from 'react';
import { createPortal } from 'react-dom';
import type { UserProfile, WellnessGoal } from '../types';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';

interface ProfileEditorProps {
  profile: UserProfile | undefined;
  onSave: (profile: UserProfile) => void;
  onClose: () => void;
}

// Cute animal avatars
const ANIMAL_AVATARS = [
  { id: 'cat', emoji: '🐱', label: 'Cat', bg: 'from-amber-400 to-orange-500' },
  { id: 'dog', emoji: '🐶', label: 'Dog', bg: 'from-amber-300 to-yellow-500' },
  { id: 'rabbit', emoji: '🐰', label: 'Rabbit', bg: 'from-pink-300 to-rose-400' },
  { id: 'bear', emoji: '🐻', label: 'Bear', bg: 'from-amber-500 to-amber-700' },
  { id: 'panda', emoji: '🐼', label: 'Panda', bg: 'from-slate-300 to-slate-500' },
  { id: 'koala', emoji: '🐨', label: 'Koala', bg: 'from-slate-400 to-slate-600' },
  { id: 'fox', emoji: '🦊', label: 'Fox', bg: 'from-orange-400 to-red-500' },
  { id: 'penguin', emoji: '🐧', label: 'Penguin', bg: 'from-slate-600 to-slate-800' },
  { id: 'owl', emoji: '🦉', label: 'Owl', bg: 'from-amber-600 to-amber-800' },
  { id: 'unicorn', emoji: '🦄', label: 'Unicorn', bg: 'from-pink-400 to-purple-500' },
  { id: 'butterfly', emoji: '🦋', label: 'Butterfly', bg: 'from-sky-400 to-blue-500' },
  { id: 'turtle', emoji: '🐢', label: 'Turtle', bg: 'from-emerald-400 to-green-600' },
  { id: 'hedgehog', emoji: '🦔', label: 'Hedgehog', bg: 'from-amber-400 to-amber-600' },
  { id: 'sloth', emoji: '🦥', label: 'Sloth', bg: 'from-amber-300 to-amber-500' },
  { id: 'dolphin', emoji: '🐬', label: 'Dolphin', bg: 'from-cyan-400 to-blue-500' },
];

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
  const { state, clearAllData } = useApp();
  const { signOut } = useAuth();
  const [name, setName] = useState(profile?.name || '');
  const [birthday, setBirthday] = useState(profile?.birthday || '');
  const [gender, setGender] = useState<UserProfile['gender']>(profile?.gender);
  const [country, setCountry] = useState(profile?.country || '');
  const [wellnessGoals, setWellnessGoals] = useState<WellnessGoal[]>(
    profile?.wellnessGoals || []
  );
  const [isSaving, setIsSaving] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(profile?.avatar || null);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  // Delete account states
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteStep, setDeleteStep] = useState(1);
  const [isDeleting, setIsDeleting] = useState(false);

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
      avatar: selectedAvatar || undefined,
      createdAt: profile?.createdAt || Date.now(),
    };

    // Simulate brief save delay for UX
    setTimeout(() => {
      onSave(updatedProfile);
      setIsSaving(false);
    }, 300);
  };

  const handleDeleteAccount = async () => {
    if (deleteStep < 3) {
      setDeleteStep(deleteStep + 1);
      return;
    }

    // Final step - actually delete
    setIsDeleting(true);
    try {
      // Clear all local data
      await clearAllData();
      // Sign out
      await signOut();
      onClose();
    } catch (error) {
      console.error('Error deleting account:', error);
      setIsDeleting(false);
    }
  };

  const canSave = name.trim().length >= 2;

  // Delete confirmation modal content based on step
  const getDeleteContent = () => {
    switch (deleteStep) {
      case 1:
        return {
          title: 'Delete Account?',
          icon: (
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <svg className="w-8 h-8 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          ),
          message: 'Are you sure you want to delete your account? This action cannot be undone.',
          warning: 'All your mood entries, reflections, and progress will be permanently deleted.',
          buttonText: 'I understand, continue',
          buttonClass: 'bg-amber-500 hover:bg-amber-600 text-white',
        };
      case 2:
        return {
          title: 'Final Warning',
          icon: (
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
              <svg className="w-8 h-8 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
          ),
          message: 'This is your second warning. Your data will be lost forever.',
          warning: `You have ${state.entries?.length || 0} mood entries and ${state.xp || 0} XP that will be permanently deleted.`,
          buttonText: 'Continue with deletion',
          buttonClass: 'bg-orange-500 hover:bg-orange-600 text-white',
        };
      case 3:
        return {
          title: 'Delete Forever',
          icon: (
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          ),
          message: 'This is your FINAL chance to keep your account.',
          warning: 'Clicking the button below will permanently delete your account and all associated data. There is no way to recover it.',
          buttonText: 'Delete my account forever',
          buttonClass: 'bg-red-600 hover:bg-red-700 text-white',
        };
      default:
        return null;
    }
  };

  // Use portal to render at document body level to avoid stacking context issues
  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm cursor-pointer"
        onClick={onClose}
      />

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="absolute inset-0 z-10 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => {
              setShowDeleteConfirm(false);
              setDeleteStep(1);
            }}
          />
          <div className="relative bg-white dark:bg-silver-900 rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-slide-up">
            {state.isPremium ? (
              /* Cannot delete with active subscription */
              <>
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-lavender-100 dark:bg-lavender-900/30 flex items-center justify-center">
                  <svg className="w-8 h-8 text-lavender-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-silver-800 dark:text-silver-100 text-center mb-2">
                  Active Subscription
                </h3>
                <p className="text-sm text-silver-600 dark:text-silver-400 text-center mb-6">
                  You cannot delete your account while you have an active Premium subscription.
                  Please cancel your subscription first from the subscription management page.
                </p>
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setDeleteStep(1);
                  }}
                  className="w-full py-3 rounded-xl bg-lavender-500 text-white font-medium hover:bg-lavender-600 transition-colors"
                >
                  Understood
                </button>
              </>
            ) : (
              /* Delete confirmation steps */
              <>
                {getDeleteContent()?.icon}
                <h3 className="text-lg font-semibold text-silver-800 dark:text-silver-100 text-center mb-2">
                  {getDeleteContent()?.title}
                </h3>
                <p className="text-sm text-silver-600 dark:text-silver-400 text-center mb-3">
                  {getDeleteContent()?.message}
                </p>
                <p className="text-xs text-red-500 dark:text-red-400 text-center mb-6 px-4 py-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  {getDeleteContent()?.warning}
                </p>

                {/* Step indicator */}
                <div className="flex justify-center gap-2 mb-6">
                  {[1, 2, 3].map((step) => (
                    <div
                      key={step}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        step <= deleteStep
                          ? step === 3 ? 'bg-red-500' : step === 2 ? 'bg-orange-500' : 'bg-amber-500'
                          : 'bg-silver-200 dark:bg-silver-700'
                      }`}
                    />
                  ))}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowDeleteConfirm(false);
                      setDeleteStep(1);
                    }}
                    className="flex-1 py-3 rounded-xl border border-silver-200 dark:border-silver-700 text-silver-600 dark:text-silver-300 font-medium hover:bg-silver-50 dark:hover:bg-silver-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteAccount}
                    disabled={isDeleting}
                    className={`flex-1 py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 ${getDeleteContent()?.buttonClass}`}
                  >
                    {isDeleting ? (
                      <>
                        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Deleting...
                      </>
                    ) : (
                      getDeleteContent()?.buttonText
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Main Modal */}
      <div className="relative glass-card p-0 w-full max-w-lg animate-slide-up overflow-hidden max-h-[85vh] sm:max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white/80 dark:bg-silver-900/80 backdrop-blur-sm border-b border-silver-200/50 dark:border-silver-700/30 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
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

        <div className="p-4 sm:p-6 space-y-5 sm:space-y-6">
          {/* Avatar and Name */}
          <div className="flex items-start gap-4">
            <div className="relative">
              {/* Avatar button */}
              <button
                type="button"
                onClick={() => setShowAvatarPicker(!showAvatarPicker)}
                className={`w-16 h-16 rounded-full bg-gradient-to-br ${
                  selectedAvatar
                    ? ANIMAL_AVATARS.find(a => a.id === selectedAvatar)?.bg || 'from-lavender-400 to-lavender-600'
                    : 'from-lavender-400 to-lavender-600'
                } flex items-center justify-center shrink-0
                hover:scale-105 transition-transform cursor-pointer ring-2 ring-transparent hover:ring-lavender-300`}
                title="Click to change avatar"
              >
                {selectedAvatar
                  ? <span className="text-[2.5rem] leading-none">{ANIMAL_AVATARS.find(a => a.id === selectedAvatar)?.emoji}</span>
                  : <span className="text-white text-2xl font-medium">{name.charAt(0).toUpperCase() || '?'}</span>
                }
              </button>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white dark:bg-silver-800
                            border-2 border-lavender-400 flex items-center justify-center">
                <svg className="w-3 h-3 text-lavender-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </div>

              {/* Avatar Picker Dropdown */}
              {showAvatarPicker && (
                <div className="absolute top-full left-0 mt-2 z-50 bg-white dark:bg-silver-800 rounded-xl
                              shadow-xl border border-silver-200 dark:border-silver-700 p-2 sm:p-3 w-56 sm:w-64">
                  <p className="text-xs text-silver-500 dark:text-silver-400 mb-2">Choose your avatar</p>

                  {/* Default letter option */}
                  <button
                    type="button"
                    onClick={() => { setSelectedAvatar(null); setShowAvatarPicker(false); }}
                    className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-lavender-400 to-lavender-600
                              flex items-center justify-center text-white text-xs sm:text-sm font-medium mb-2
                              ${!selectedAvatar ? 'ring-2 ring-lavender-400 ring-offset-2' : 'hover:scale-110'}
                              transition-all`}
                    title="Use your initial"
                  >
                    {name.charAt(0).toUpperCase() || '?'}
                  </button>

                  <p className="text-xs text-silver-400 dark:text-silver-500 mb-2">Or pick a friend</p>

                  {/* Animal grid */}
                  <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
                    {ANIMAL_AVATARS.map(animal => (
                      <button
                        key={animal.id}
                        type="button"
                        onClick={() => { setSelectedAvatar(animal.id); setShowAvatarPicker(false); }}
                        className={`w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-gradient-to-br ${animal.bg}
                                  flex items-center justify-center text-xl sm:text-[1.5rem]
                                  ${selectedAvatar === animal.id ? 'ring-2 ring-lavender-400 ring-offset-1 sm:ring-offset-2' : 'hover:scale-110'}
                                  transition-all`}
                        title={animal.label}
                      >
                        {animal.emoji}
                      </button>
                    ))}
                  </div>
                </div>
              )}
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
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {[
                { value: 'female', label: 'Female' },
                { value: 'male', label: 'Male' },
                { value: 'non-binary', label: 'Non-binary' },
                { value: 'prefer-not-to-say', label: 'Prefer not to say' },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setGender(option.value as UserProfile['gender'])}
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm transition-all
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

          {/* Danger Zone */}
          <div className="pt-4 border-t border-silver-200 dark:border-silver-700">
            <h3 className="text-sm font-medium text-red-600 dark:text-red-400 mb-3">Danger Zone</h3>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full py-3 px-4 rounded-xl border-2 border-red-200 dark:border-red-900/50
                       text-red-600 dark:text-red-400 text-sm font-medium
                       hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors
                       flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete my profile and data
            </button>
            <p className="text-xs text-silver-400 dark:text-silver-500 mt-2 text-center">
              This will permanently delete all your data and cannot be undone.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white/80 dark:bg-silver-900/80 backdrop-blur-sm border-t border-silver-200/50 dark:border-silver-700/30 px-4 sm:px-6 py-3 sm:py-4 flex gap-2 sm:gap-3">
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
    </div>,
    document.body
  );
}
