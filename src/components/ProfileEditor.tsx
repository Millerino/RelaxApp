import { useState } from 'react';
import type { UserProfile, WellnessGoal } from '../types';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';

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

const ANIMAL_AVATARS = [
  { id: 'red-panda', label: 'Red Panda' },
  { id: 'axolotl', label: 'Axolotl' },
  { id: 'snow-leopard', label: 'Snow Leopard' },
  { id: 'otter', label: 'Otter' },
  { id: 'fennec-fox', label: 'Fennec Fox' },
  { id: 'capybara', label: 'Capybara' },
  { id: 'narwhal', label: 'Narwhal' },
  { id: 'quokka', label: 'Quokka' },
  { id: 'pangolin', label: 'Pangolin' },
  { id: 'koi-fish', label: 'Koi Fish' },
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
  const [avatar, setAvatar] = useState(profile?.avatar || '');
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [birthday, setBirthday] = useState(profile?.birthday || '');
  const [gender, setGender] = useState<UserProfile['gender']>(profile?.gender);
  const [country, setCountry] = useState(profile?.country || '');
  const [wellnessGoals, setWellnessGoals] = useState<WellnessGoal[]>(
    profile?.wellnessGoals || []
  );
  const [isSaving, setIsSaving] = useState(false);

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
      avatar: avatar || undefined,
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm"
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
      <div className="relative glass-card p-0 w-full max-w-lg animate-slide-up overflow-hidden max-h-[90vh] overflow-y-auto"
           onClick={(e) => e.stopPropagation()}>
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
            <div className="relative shrink-0">
              <button
                onClick={() => setShowAvatarPicker(!showAvatarPicker)}
                className="w-16 h-16 rounded-full bg-gradient-to-br from-lavender-400 to-lavender-600 flex items-center justify-center text-white text-2xl font-medium overflow-hidden
                         hover:ring-2 hover:ring-lavender-400/50 hover:ring-offset-2 hover:ring-offset-white dark:hover:ring-offset-silver-900 transition-all"
              >
                {avatar ? (
                  <img src={`/images/avatars/${avatar}.png`} alt={avatar} className="w-full h-full object-cover" />
                ) : (
                  name.charAt(0).toUpperCase() || '?'
                )}
              </button>
              <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-lavender-500 flex items-center justify-center
                            border-2 border-white dark:border-silver-900">
                <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </div>
              {showAvatarPicker && (
                <div className="absolute top-full left-0 mt-2 p-2 bg-white dark:bg-silver-800
                              rounded-xl shadow-xl border border-silver-200 dark:border-silver-700 z-20
                              grid grid-cols-5 gap-1.5 w-56">
                  {ANIMAL_AVATARS.map(animal => (
                    <button
                      key={animal.id}
                      onClick={() => { setAvatar(animal.id); setShowAvatarPicker(false); }}
                      className={`w-10 h-10 rounded-lg overflow-hidden
                                hover:ring-2 hover:ring-lavender-400 transition-all hover:scale-105
                                ${avatar === animal.id ? 'ring-2 ring-lavender-400 scale-105' : ''}`}
                      title={animal.label}
                    >
                      <img src={`/images/avatars/${animal.id}.png`} alt={animal.label} className="w-full h-full object-cover" />
                    </button>
                  ))}
                  {avatar && (
                    <button
                      onClick={() => { setAvatar(''); setShowAvatarPicker(false); }}
                      className="col-span-5 mt-1 text-xs text-silver-500 hover:text-silver-700 dark:hover:text-silver-300 py-1"
                    >
                      Remove avatar
                    </button>
                  )}
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
