import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { 
  User, 
  Mail, 
  Calendar, 
  Settings, 
  Save, 
  Eye, 
  EyeOff,
  Trash2,
  AlertTriangle,
  Github,
  Code2,
  Link as LinkIcon,
  CheckCircle2,
  Loader2,
  ExternalLink
} from 'lucide-react';
import api from '../services/api';
import { updatePlatformUsernames, getPlatformStats } from '../services/platform/platform';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

// LeetCode Icon Component
const LeetCodeIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M13.483 0a1.374 1.374 0 0 0-.961.438L7.116 6.226l-3.854 4.126a5.266 5.266 0 0 0-1.209 2.104 5.35 5.35 0 0 0-.125.513 5.527 5.527 0 0 0 .062 2.362 5.83 5.83 0 0 0 .349 1.017 5.938 5.938 0 0 0 1.271 1.818l4.277 4.193.039.038c2.248 2.165 5.852 2.133 8.063-.074l2.396-2.392c.54-.54.54-1.414.003-1.955a1.378 1.378 0 0 0-1.951-.003l-2.396 2.392a3.021 3.021 0 0 1-4.205.038l-.02-.019-4.276-4.193c-.652-.64-.972-1.469-.948-2.263a2.68 2.68 0 0 1 .066-.523 2.545 2.545 0 0 1 .619-1.164L9.13 8.114c1.058-1.134 3.204-1.27 4.43-.278l3.501 2.831c.593.48 1.461.387 1.94-.207a1.384 1.384 0 0 0-.207-1.943l-3.5-2.831c-.8-.647-1.766-1.045-2.774-1.202l2.015-2.158A1.384 1.384 0 0 0 13.483 0zm-2.866 12.815a1.38 1.38 0 0 0-1.38 1.382 1.38 1.38 0 0 0 1.38 1.382H20.79a1.38 1.38 0 0 0 1.38-1.382 1.38 1.38 0 0 0-1.38-1.382z"/>
  </svg>
);

// Codeforces Icon Component
const CodeforcesIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M4.5 7.5C5.328 7.5 6 8.172 6 9v10.5c0 .828-.672 1.5-1.5 1.5h-3C.672 21 0 20.328 0 19.5V9c0-.828.672-1.5 1.5-1.5h3zm9-4.5c.828 0 1.5.672 1.5 1.5v15c0 .828-.672 1.5-1.5 1.5h-3c-.828 0-1.5-.672-1.5-1.5v-15c0-.828.672-1.5 1.5-1.5h3zm9 7.5c.828 0 1.5.672 1.5 1.5v7.5c0 .828-.672 1.5-1.5 1.5h-3c-.828 0-1.5-.672-1.5-1.5V12c0-.828.672-1.5 1.5-1.5h3z"/>
  </svg>
);

const Profile = () => {
  const { user, updateUser, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const [loading, setLoading] = useState(false);
  const [platformLoading, setPlatformLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    preferences: {
      darkMode: user?.preferences?.darkMode || false,
      notifications: user?.preferences?.notifications || true,
    }
  });

  const [platformUsernames, setPlatformUsernames] = useState({
    github: '',
    leetcode: '',
    codeforces: ''
  });

  const [platformData, setPlatformData] = useState(null);

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchStats();
    fetchPlatformData();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/questions/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchPlatformData = async () => {
    try {
      const response = await getPlatformStats();
      setPlatformData(response.data);
      if (response.data.platformUsernames) {
        setPlatformUsernames({
          github: response.data.platformUsernames.github || '',
          leetcode: response.data.platformUsernames.leetcode || '',
          codeforces: response.data.platformUsernames.codeforces || ''
        });
      }
    } catch (error) {
      console.error('Error fetching platform data:', error);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.put('/user/profile', profileData);
      updateUser(profileData);
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePlatformUpdate = async (e) => {
    e.preventDefault();
    setPlatformLoading(true);

    try {
      const dataToUpdate = {};
      if (platformUsernames.github) dataToUpdate.github = platformUsernames.github;
      if (platformUsernames.leetcode) dataToUpdate.leetcode = platformUsernames.leetcode;
      if (platformUsernames.codeforces) dataToUpdate.codeforces = platformUsernames.codeforces;

      await updatePlatformUsernames(dataToUpdate);
      toast.success('Platform usernames updated!');
      fetchPlatformData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update usernames');
    } finally {
      setPlatformLoading(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    try {
      await api.put('/user/password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      toast.success('Password updated successfully!');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setShowPasswordForm(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!passwordData.currentPassword) {
      toast.error('Please enter your current password to delete account');
      return;
    }

    setLoading(true);

    try {
      await api.delete('/user/account', {
        data: { password: passwordData.currentPassword }
      });
      toast.success('Account deleted successfully');
      logout();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete account');
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'platforms', name: 'Platforms', icon: LinkIcon },
    { id: 'preferences', name: 'Preferences', icon: Settings },
    { id: 'security', name: 'Security', icon: Eye },
  ];

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Profile Settings</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Manage your account settings and connected platforms
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="card p-2">
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                      activeTab === tab.id
                        ? 'bg-primary-50 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700/50 dark:hover:text-white'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {tab.name}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {activeTab === 'profile' && (
            <>
              <div className="card">
                <h3 className="section-title mb-6">
                  <User className="w-5 h-5 text-primary-500" />
                  Profile Information
                </h3>
                <form onSubmit={handleProfileUpdate} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={profileData.name}
                      onChange={(e) => setProfileData(prev => ({
                        ...prev,
                        name: e.target.value
                      }))}
                      className="input-field"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="email"
                        value={user?.email || ''}
                        disabled
                        className="input-field pl-12 bg-gray-50 dark:bg-gray-700/50 cursor-not-allowed"
                      />
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">
                      Email cannot be changed
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Member Since
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        value={user?.createdAt ? format(new Date(user.createdAt), 'MMMM dd, yyyy') : ''}
                        disabled
                        className="input-field pl-12 bg-gray-50 dark:bg-gray-700/50 cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="btn-primary flex items-center gap-2"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          Save Changes
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>

              {/* Progress Stats */}
              {stats && (
                <div className="card">
                  <h3 className="section-title mb-6">
                    <Code2 className="w-5 h-5 text-primary-500" />
                    Your Progress
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="text-center p-4 bg-primary-50 dark:bg-primary-900/30 rounded-xl">
                      <p className="text-3xl font-bold text-primary-600 dark:text-primary-400">
                        {stats.totalQuestions}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Total Questions</p>
                    </div>
                    <div className="text-center p-4 bg-amber-50 dark:bg-amber-900/30 rounded-xl">
                      <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">
                        {stats.revisionCount}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Need Revision</p>
                    </div>
                    <div className="text-center p-4 bg-emerald-50 dark:bg-emerald-900/30 rounded-xl">
                      <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                        {stats.recentQuestions}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">This Month</p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {activeTab === 'platforms' && (
            <div className="card">
              <h3 className="section-title mb-6">
                <LinkIcon className="w-5 h-5 text-primary-500" />
                Connected Platforms
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Connect your coding platform accounts to display stats on your dashboard.
              </p>

              <form onSubmit={handlePlatformUpdate} className="space-y-6">
                {/* GitHub */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <div className="flex items-center gap-2">
                      <Github className="w-4 h-4" />
                      GitHub Username
                      {platformData?.stats?.github && !platformData.stats.github.error && (
                        <span className="inline-flex items-center gap-1 text-xs text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-400 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3" />
                          Connected
                        </span>
                      )}
                    </div>
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={platformUsernames.github}
                      onChange={(e) => setPlatformUsernames(prev => ({ ...prev, github: e.target.value }))}
                      placeholder="e.g., octocat"
                      className="input-field flex-1"
                    />
                    {platformData?.stats?.github?.profileUrl && (
                      <a
                        href={platformData.stats.github.profileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-secondary px-3"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>

                {/* LeetCode */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <div className="flex items-center gap-2">
                      <LeetCodeIcon className="w-4 h-4" />
                      LeetCode Username
                      {platformData?.stats?.leetcode && !platformData.stats.leetcode.error && (
                        <span className="inline-flex items-center gap-1 text-xs text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-400 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3" />
                          Connected
                        </span>
                      )}
                    </div>
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={platformUsernames.leetcode}
                      onChange={(e) => setPlatformUsernames(prev => ({ ...prev, leetcode: e.target.value }))}
                      placeholder="e.g., leetcoder"
                      className="input-field flex-1"
                    />
                    {platformUsernames.leetcode && (
                      <a
                        href={`https://leetcode.com/${platformUsernames.leetcode}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-secondary px-3"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>

                {/* Codeforces */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <div className="flex items-center gap-2">
                      <CodeforcesIcon className="w-4 h-4" />
                      Codeforces Username
                      {platformData?.stats?.codeforces && !platformData.stats.codeforces.error && (
                        <span className="inline-flex items-center gap-1 text-xs text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-400 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3" />
                          Connected
                        </span>
                      )}
                    </div>
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={platformUsernames.codeforces}
                      onChange={(e) => setPlatformUsernames(prev => ({ ...prev, codeforces: e.target.value }))}
                      placeholder="e.g., tourist"
                      className="input-field flex-1"
                    />
                    {platformUsernames.codeforces && (
                      <a
                        href={`https://codeforces.com/profile/${platformUsernames.codeforces}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-secondary px-3"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    type="submit"
                    disabled={platformLoading}
                    className="btn-primary flex items-center gap-2"
                  >
                    {platformLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Save Platforms
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'preferences' && (
            <div className="card">
              <h3 className="section-title mb-6">
                <Settings className="w-5 h-5 text-primary-500" />
                Preferences
              </h3>
              <form onSubmit={handleProfileUpdate} className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      Dark Mode
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                      Switch between light and dark themes
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const newDarkMode = !profileData.preferences.darkMode;
                      setProfileData(prev => ({
                        ...prev,
                        preferences: {
                          ...prev.preferences,
                          darkMode: newDarkMode
                        }
                      }));
                      toggleDarkMode();
                    }}
                    className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                      profileData.preferences.darkMode ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform ${
                        profileData.preferences.darkMode ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      Notifications
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                      Receive notifications about your progress
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setProfileData(prev => ({
                      ...prev,
                      preferences: {
                        ...prev.preferences,
                        notifications: !prev.preferences.notifications
                      }
                    }))}
                    className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                      profileData.preferences.notifications ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform ${
                        profileData.preferences.notifications ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary flex items-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <div className="card">
                <h3 className="section-title mb-6">
                  <Eye className="w-5 h-5 text-primary-500" />
                  Change Password
                </h3>
                {!showPasswordForm ? (
                  <button
                    onClick={() => setShowPasswordForm(true)}
                    className="btn-secondary"
                  >
                    Change Password
                  </button>
                ) : (
                  <form onSubmit={handlePasswordUpdate} className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Current Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPasswords.current ? 'text' : 'password'}
                          value={passwordData.currentPassword}
                          onChange={(e) => setPasswordData(prev => ({
                            ...prev,
                            currentPassword: e.target.value
                          }))}
                          className="input-field pr-12"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility('current')}
                          className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
                        >
                          {showPasswords.current ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPasswords.new ? 'text' : 'password'}
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData(prev => ({
                            ...prev,
                            newPassword: e.target.value
                          }))}
                          className="input-field pr-12"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility('new')}
                          className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
                        >
                          {showPasswords.new ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPasswords.confirm ? 'text' : 'password'}
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData(prev => ({
                            ...prev,
                            confirmPassword: e.target.value
                          }))}
                          className="input-field pr-12"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility('confirm')}
                          className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
                        >
                          {showPasswords.confirm ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                      <button
                        type="button"
                        onClick={() => {
                          setShowPasswordForm(false);
                          setPasswordData({
                            currentPassword: '',
                            newPassword: '',
                            confirmPassword: '',
                          });
                        }}
                        className="btn-secondary"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary"
                      >
                        {loading ? 'Updating...' : 'Update Password'}
                      </button>
                    </div>
                  </form>
                )}
              </div>

              <div className="card border-red-200 dark:border-red-900/50">
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30">
                    <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-red-900 dark:text-red-100">
                      Delete Account
                    </h3>
                    <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                      Once you delete your account, there is no going back. All your data will be permanently removed.
                    </p>
                    <div className="mt-4">
                      {!showDeleteConfirm ? (
                        <button
                          onClick={() => setShowDeleteConfirm(true)}
                          className="btn-danger flex items-center gap-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete Account
                        </button>
                      ) : (
                        <div className="space-y-4">
                          <p className="text-sm text-red-700 dark:text-red-300">
                            To confirm deletion, please enter your current password:
                          </p>
                          <input
                            type="password"
                            value={passwordData.currentPassword}
                            onChange={(e) => setPasswordData(prev => ({
                              ...prev,
                              currentPassword: e.target.value
                            }))}
                            className="input-field"
                            placeholder="Enter your current password"
                          />
                          <div className="flex gap-3">
                            <button
                              onClick={() => {
                                setShowDeleteConfirm(false);
                                setPasswordData(prev => ({
                                  ...prev,
                                  currentPassword: ''
                                }));
                              }}
                              className="btn-secondary"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={handleDeleteAccount}
                              disabled={loading || !passwordData.currentPassword}
                              className="btn-danger"
                            >
                              {loading ? 'Deleting...' : 'Delete Account'}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
