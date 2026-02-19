import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  User,
  Mail,
  Calendar,
  Flame,
  TrendingUp,
  LogOut,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { format } from 'date-fns';

/* ✅ SAFE DATE CONVERTER */
function toDate(value: any): Date {
  if (!value) return new Date();

  if (value.seconds) {
    return new Date(value.seconds * 1000); // Firestore Timestamp
  }

  const d = new Date(value);
  if (isNaN(d.getTime())) return new Date();

  return d;
}

export default function ProfilePage(): JSX.Element {
  const { currentUser, userProfile, logout } = useAuth();

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    alert('Account deletion requires backend support.');
    setDeleting(false);
    setShowDeleteConfirm(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Your Profile</h1>
        <p className="text-gray-500 mt-1">
          Manage your account and preferences
        </p>
      </div>

      {/* Profile Card */}
      <div className="seren-card p-8">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-[var(--seren-accent)] flex items-center justify-center">
            <span className="text-3xl font-bold">
              {userProfile?.displayName?.[0] ||
                currentUser?.email?.[0] ||
                'U'}
            </span>
          </div>

          <div>
            <h2 className="text-xl font-bold">
              {userProfile?.displayName || 'User'}
            </h2>

            <div className="flex items-center gap-2 text-gray-500 mt-1">
              <Mail size={16} />
              <span>{currentUser?.email}</span>
            </div>

            {userProfile?.createdAt && (
              <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                <Calendar size={14} />
                <span>
                  Member since{' '}
                  {format(toDate(userProfile.createdAt), 'MMMM yyyy')}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">

        <div className="seren-card p-6 text-center">
          <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center mx-auto mb-3">
            <Flame size={20} className="text-orange-500" />
          </div>
          <p className="text-2xl font-bold">
            {userProfile?.streakDays || 0}
          </p>
          <p className="text-sm text-gray-500">Day Streak</p>
        </div>

        <div className="seren-card p-6 text-center">
          <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center mx-auto mb-3">
            <TrendingUp size={20} className="text-green-500" />
          </div>
          <p className="text-2xl font-bold">
            {userProfile?.longestStreak || 0}
          </p>
          <p className="text-sm text-gray-500">Best Streak</p>
        </div>

        <div className="seren-card p-6 text-center">
          <div className="w-10 h-10 rounded-xl bg-[var(--seren-accent)]/30 flex items-center justify-center mx-auto mb-3">
            <User size={20} />
          </div>
          <p className="text-2xl font-bold">
            {userProfile?.totalCheckIns || 0}
          </p>
          <p className="text-sm text-gray-500">Check-ins</p>
        </div>

      </div>

      {/* Actions */}
      <div className="space-y-4">

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl border-2 border-gray-200 hover:border-[var(--seren-accent)] font-medium"
        >
          <LogOut size={20} />
          Log Out
        </button>

        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl border-2 border-red-200 text-red-500 hover:bg-red-50 font-medium"
        >
          <Trash2 size={20} />
          Delete Account
        </button>

      </div>

      {/* Delete Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="seren-card p-6 max-w-md w-full">

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle size={20} className="text-red-500" />
              </div>
              <h3 className="text-lg font-bold">
                Delete Account?
              </h3>
            </div>

            <p className="text-gray-500 mb-6">
              This will permanently delete your account and data.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 seren-button"
              >
                Cancel
              </button>

              <button
                onClick={handleDeleteAccount}
                disabled={deleting}
                className="flex-1 bg-red-500 text-white px-6 py-3 rounded-full font-medium hover:bg-red-600 disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
