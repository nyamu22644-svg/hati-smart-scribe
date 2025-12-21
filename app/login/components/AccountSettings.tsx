import React, { useState } from 'react';
import { User, Mail, Lock, Save, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { UserRecord } from '@/types';
import { auth } from '@/lib/firebase';
import { updatePassword, updateProfile } from 'firebase/auth';

interface AccountSettingsProps {
  user: UserRecord;
  onUpdate?: () => void;
}

export const AccountSettings: React.FC<AccountSettingsProps> = ({ user, onUpdate }) => {
  const [name, setName] = useState(user.name || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');

  const handleUpdateProfile = async () => {
    if (!name.trim()) {
      setStatus('error');
      setMessage('Name cannot be empty');
      return;
    }

    setLoading(true);
    setStatus('idle');

    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('No user logged in');
      }

      await updateProfile(currentUser, {
        displayName: name
      });

      setStatus('success');
      setMessage('Profile updated successfully');
      onUpdate?.();
      
      setTimeout(() => {
        setStatus('idle');
        setMessage('');
      }, 3000);
    } catch (error: any) {
      setStatus('error');
      setMessage(error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword.trim()) {
      setStatus('error');
      setMessage('Current password is required');
      return;
    }

    if (!newPassword.trim()) {
      setStatus('error');
      setMessage('New password is required');
      return;
    }

    if (newPassword !== confirmPassword) {
      setStatus('error');
      setMessage('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setStatus('error');
      setMessage('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setStatus('idle');

    try {
      const currentUser = auth.currentUser;
      if (!currentUser || !currentUser.email) {
        throw new Error('No user logged in');
      }

      // Re-authenticate user with current password
      const { signInWithEmailAndPassword } = await import('firebase/auth');
      try {
        await signInWithEmailAndPassword(auth, currentUser.email, currentPassword);
      } catch (error: any) {
        throw new Error('Current password is incorrect');
      }

      // Update password
      await updatePassword(currentUser, newPassword);

      setStatus('success');
      setMessage('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      setTimeout(() => {
        setStatus('idle');
        setMessage('');
      }, 3000);
    } catch (error: any) {
      setStatus('error');
      setMessage(error.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-serif font-black text-navy mb-2">Account Settings</h2>
        <p className="text-slate-500 font-medium">Manage your profile and security settings</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b-2 border-slate-200">
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-6 py-3 font-bold transition-all ${
            activeTab === 'profile'
              ? 'text-gold border-b-2 border-gold -mb-[2px]'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <div className="flex items-center gap-2">
            <User className="w-4 h-4" />
            Profile
          </div>
        </button>
        <button
          onClick={() => setActiveTab('password')}
          className={`px-6 py-3 font-bold transition-all ${
            activeTab === 'password'
              ? 'text-gold border-b-2 border-gold -mb-[2px]'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4" />
            Change Password
          </div>
        </button>
      </div>

      {/* Status Messages */}
      {status !== 'idle' && (
        <div
          className={`p-4 rounded-2xl flex items-start gap-3 ${
            status === 'success'
              ? 'bg-emerald-50 border border-emerald-200'
              : 'bg-rose-50 border border-rose-200'
          }`}
        >
          {status === 'success' ? (
            <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
          )}
          <p
            className={`text-sm font-bold ${
              status === 'success' ? 'text-emerald-700' : 'text-rose-700'
            }`}
          >
            {message}
          </p>
        </div>
      )}

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="space-y-6 bg-white rounded-[32px] shadow-sm border border-slate-100 p-8">
          <div>
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 mb-3 block">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-gold/30 focus:bg-white font-bold transition-all disabled:opacity-50"
                placeholder="John Doe"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 mb-3 block">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="email"
                value={user.email || ''}
                disabled
                className="w-full pl-12 pr-4 py-4 bg-slate-100 border border-slate-200 rounded-2xl text-slate-600 font-bold cursor-not-allowed"
              />
            </div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2 ml-1">
              Contact support to change email address
            </p>
          </div>

          <div className="pt-4 border-t border-slate-200">
            <button
              onClick={handleUpdateProfile}
              disabled={loading || name === user.name}
              className="w-full bg-navy hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Password Tab */}
      {activeTab === 'password' && (
        <div className="space-y-6 bg-white rounded-[32px] shadow-sm border border-slate-100 p-8">
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-amber-900">Security Note</p>
              <p className="text-[12px] text-amber-800 mt-1">
                We'll ask you to re-authenticate for security. Make sure you have your current password.
              </p>
            </div>
          </div>

          <div>
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 mb-3 block">
              Current Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                disabled={loading}
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-gold/30 focus:bg-white font-bold transition-all disabled:opacity-50"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 mb-3 block">
              New Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={loading}
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-gold/30 focus:bg-white font-bold transition-all disabled:opacity-50"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 mb-3 block">
              Confirm New Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-gold/30 focus:bg-white font-bold transition-all disabled:opacity-50"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200">
            <button
              onClick={handleChangePassword}
              disabled={loading || !currentPassword || !newPassword || !confirmPassword}
              className="w-full bg-navy hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Lock className="w-5 h-5" />
                  Change Password
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
