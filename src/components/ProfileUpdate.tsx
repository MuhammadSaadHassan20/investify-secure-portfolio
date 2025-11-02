import { useState } from 'react';
import { useAuth } from '../contexts/localAuthContext';
import { localDB } from '../utills/localDB';
import { User, Mail, Lock, Save, X } from 'lucide-react';
import { validatePassword } from '../utills/passwordValidator';
import { sanitizeInput, validateEmail } from '../utills/inputValidator';
import { logActivity } from '../utills/activityLogger';
import bcrypt from 'bcryptjs';

interface ProfileUpdateProps {
  onClose: () => void;
}

export default function ProfileUpdate({ onClose }: ProfileUpdateProps) {
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      // Validate current password is provided
      if (!currentPassword) {
        setError('Current password is required');
        return;
      }

      // Validate new password
      const passwordValidation = validatePassword(newPassword);
      if (!passwordValidation.isValid) {
        setError(passwordValidation.errors[0]);
        return;
      }

      // Check password match
      if (newPassword !== confirmPassword) {
        setError('New passwords do not match');
        return;
      }

      // Check if new password is different from current
      if (currentPassword === newPassword) {
        setError('New password must be different from current password');
        return;
      }

      setLoading(true);

      // Get user from database
      const dbUser = await localDB.getUserByEmail(user!.email);
      
      if (!dbUser) {
        setError('User not found');
        setLoading(false);
        return;
      }

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, dbUser.password);
      
      if (!isCurrentPasswordValid) {
        setError('Current password is incorrect');
        await logActivity('PASSWORD_CHANGED', { 
          email: user?.email,
          status: 'failed',
          reason: 'Invalid current password'
        });
        setLoading(false);
        return;
      }

      // Hash new password
      const hashedNewPassword = await bcrypt.hash(newPassword, 10);

      // Update password in database
      dbUser.password = hashedNewPassword;
      await localDB.updateUser(dbUser);

      await logActivity('PASSWORD_CHANGED', { 
        email: user?.email,
        status: 'success'
      });
      
      setSuccess('Password updated successfully!');
      setLoading(false);

      // Clear form and close after delay
      setTimeout(() => {
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        onClose();
      }, 2000);

    } catch (err) {
      console.error('Password update error:', err);
      setError('Failed to update password. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/50 p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-purple-500 to-pink-600 p-2 rounded-xl">
              <User className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Update Profile</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Current Email (Read-only) */}
        <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
            <Mail className="w-4 h-4" />
            <span>Current Email</span>
          </div>
          <div className="font-semibold text-gray-900">{user?.email}</div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-xl mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-100 border border-green-300 text-green-700 px-4 py-3 rounded-xl mb-4">
            {success}
          </div>
        )}

        <form onSubmit={handlePasswordUpdate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                placeholder="Enter current password"
                required
                disabled={loading || !!success}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              maxLength={128}
              className="w-full px-4 py-3 bg-white/50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
              placeholder="Enter new password"
              required
              disabled={loading || !!success}
            />
            <p className="text-xs text-gray-500 mt-1">
              Must contain: 8+ chars, uppercase, lowercase, number, special char
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm New Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              maxLength={128}
              className="w-full px-4 py-3 bg-white/50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
              placeholder="Confirm new password"
              required
              disabled={loading || !!success}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-semibold transition"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !!success}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-pink-700 transition disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              {loading ? 'Updating...' : success ? 'Updated!' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}