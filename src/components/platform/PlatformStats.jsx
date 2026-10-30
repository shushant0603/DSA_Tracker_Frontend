import React, { useState, useEffect } from 'react';
import { 
  Github, 
  Code2, 
  Trophy, 
  Star, 
  GitFork, 
  Users, 
  ExternalLink,
  ChevronRight,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { getPlatformStats, savePlatformUsernames } from '../../services/platform/platform';
import toast from 'react-hot-toast';

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

// Difficulty Progress Bar
const DifficultyBar = ({ label, solved, total, color }) => {
  const percentage = total > 0 ? (solved / total) * 100 : 0;
  
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center text-sm">
        <span className={`font-medium ${color}`}>{label}</span>
        <span className="text-gray-600 dark:text-gray-400">{solved}/{total}</span>
      </div>
      <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
        <div 
          className={`h-full rounded-full transition-all duration-500 ${
            label === 'Easy' ? 'bg-emerald-500' : 
            label === 'Medium' ? 'bg-amber-500' : 'bg-rose-500'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

// Skeleton Loading Component
const StatsSkeleton = () => (
  <div className="space-y-6 animate-pulse">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="card">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-xl" />
            <div className="space-y-2">
              <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
          </div>
          <div className="space-y-3">
            <div className="h-3 w-full bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-3 w-3/4 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Username Setup Form
const UsernameSetupForm = ({ onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    github: '',
    leetcode: '',
    codeforces: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.github && !formData.leetcode && !formData.codeforces) {
      toast.error('Please enter at least one username');
      return;
    }
    onSubmit(formData);
  };

  return (
    <div className="card max-w-2xl mx-auto animate-fade-in">
      <div className="text-center mb-8">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary-500 to-cyan-500 flex items-center justify-center">
          <Sparkles className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Connect Your Profiles
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Link your coding platform accounts to track your progress across all platforms
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* GitHub */}
        <div className="relative group">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <div className="flex items-center gap-2">
              <Github className="w-4 h-4" />
              GitHub Username
            </div>
          </label>
          <input
            type="text"
            value={formData.github}
            onChange={(e) => setFormData(prev => ({ ...prev, github: e.target.value }))}
            placeholder="e.g., octocat"
            className="input-field pl-4"
          />
        </div>

        {/* LeetCode */}
        <div className="relative group">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <div className="flex items-center gap-2">
              <LeetCodeIcon className="w-4 h-4" />
              LeetCode Username
            </div>
          </label>
          <input
            type="text"
            value={formData.leetcode}
            onChange={(e) => setFormData(prev => ({ ...prev, leetcode: e.target.value }))}
            placeholder="e.g., leetcoder"
            className="input-field pl-4"
          />
        </div>

        {/* Codeforces */}
        <div className="relative group">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <div className="flex items-center gap-2">
              <CodeforcesIcon className="w-4 h-4" />
              Codeforces Username
            </div>
          </label>
          <input
            type="text"
            value={formData.codeforces}
            onChange={(e) => setFormData(prev => ({ ...prev, codeforces: e.target.value }))}
            placeholder="e.g., tourist"
            className="input-field pl-4"
          />
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Validating & Saving...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5" />
                Save & Connect Profiles
              </>
            )}
          </button>
        </div>

        <p className="text-xs text-center text-gray-500 dark:text-gray-400">
          You can update these usernames later from your profile settings
        </p>
      </form>
    </div>
  );
};

// GitHub Stats Card
const GitHubCard = ({ stats }) => {
  if (stats.error) {
    return (
      <div className="card border-l-4 border-red-500">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: '#24292f' }}
          >
            <Github className="w-5 h-5" style={{ color: '#ffffff' }} />
          </div>
          <div className="flex items-center gap-2 text-red-500">
            <AlertCircle className="w-5 h-5" />
            <span>{stats.error}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card card-hover group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300"
            style={{ backgroundColor: '#24292f' }}
          >
            <Github className="w-6 h-6" style={{ color: '#ffffff' }} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">GitHub</h3>
            <p className="text-sm text-gray-500">@{stats.username}</p>
          </div>
        </div>
        <a 
          href={stats.profileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <ExternalLink className="w-4 h-4 text-gray-400" />
        </a>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
          <div className="flex items-center justify-center gap-1 text-amber-500 mb-1">
            <Star className="w-4 h-4" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalStars}</p>
          <p className="text-xs text-gray-500">Stars</p>
        </div>
        <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
          <div className="flex items-center justify-center gap-1 text-primary-500 mb-1">
            <GitFork className="w-4 h-4" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalForks}</p>
          <p className="text-xs text-gray-500">Forks</p>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-4">
          <span className="text-gray-600 dark:text-gray-400">
            <strong className="text-gray-900 dark:text-white">{stats.publicRepos}</strong> repos
          </span>
          <span className="text-gray-600 dark:text-gray-400">
            <strong className="text-gray-900 dark:text-white">{stats.followers}</strong> followers
          </span>
        </div>
      </div>
    </div>
  );
};

// LeetCode Stats Card
const LeetCodeCard = ({ stats }) => {
  if (stats.error) {
    return (
      <div className="card border-l-4 border-red-500">
        <div className="flex items-center gap-3 text-red-500">
          <AlertCircle className="w-5 h-5" />
          <span>{stats.error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="card card-hover group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            <LeetCodeIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">LeetCode</h3>
            <p className="text-sm text-gray-500">@{stats.username}</p>
          </div>
        </div>
        <a 
          href={`https://leetcode.com/${stats.username}`}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <ExternalLink className="w-4 h-4 text-gray-400" />
        </a>
      </div>

      {/* Total solved circle */}
      <div className="flex items-center gap-6 mb-6">
        <div className="relative">
          <svg className="w-24 h-24 transform -rotate-90">
            <circle
              cx="48"
              cy="48"
              r="40"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              className="text-gray-100 dark:text-gray-700"
            />
            <circle
              cx="48"
              cy="48"
              r="40"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              strokeDasharray={`${(stats.totalSolved / stats.totalQuestions) * 251.2} 251.2`}
              className="text-primary-500"
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalSolved}</span>
            <span className="text-xs text-gray-500">solved</span>
          </div>
        </div>
        <div className="flex-1 space-y-3">
          <DifficultyBar 
            label="Easy" 
            solved={stats.easySolved} 
            total={stats.easyTotal}
            color="text-emerald-600 dark:text-emerald-400"
          />
          <DifficultyBar 
            label="Medium" 
            solved={stats.mediumSolved} 
            total={stats.mediumTotal}
            color="text-amber-600 dark:text-amber-400"
          />
          <DifficultyBar 
            label="Hard" 
            solved={stats.hardSolved} 
            total={stats.hardTotal}
            color="text-rose-600 dark:text-rose-400"
          />
        </div>
      </div>

      {stats.ranking && (
        <div className="flex items-center justify-between text-sm pt-4 border-t border-gray-100 dark:border-gray-700">
          <span className="text-gray-500">Global Ranking</span>
          <span className="font-semibold text-gray-900 dark:text-white">#{stats.ranking.toLocaleString()}</span>
        </div>
      )}
    </div>
  );
};

// Codeforces Stats Card  
const CodeforcesCard = ({ stats }) => {
  if (stats.error) {
    return (
      <div className="card border-l-4 border-red-500">
        <div className="flex items-center gap-3 text-red-500">
          <AlertCircle className="w-5 h-5" />
          <span>{stats.error}</span>
        </div>
      </div>
    );
  }

  const getRankColor = (rank) => {
    const colors = {
      'newbie': 'text-gray-500',
      'pupil': 'text-green-500',
      'specialist': 'text-cyan-500',
      'expert': 'text-blue-500',
      'candidate master': 'text-violet-500',
      'master': 'text-orange-500',
      'international master': 'text-orange-600',
      'grandmaster': 'text-red-500',
      'international grandmaster': 'text-red-600',
      'legendary grandmaster': 'text-red-700'
    };
    return colors[rank?.toLowerCase()] || 'text-gray-500';
  };

  return (
    <div className="card card-hover group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            <CodeforcesIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Codeforces</h3>
            <p className="text-sm text-gray-500">@{stats.username}</p>
          </div>
        </div>
        <a 
          href={`https://codeforces.com/profile/${stats.username}`}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <ExternalLink className="w-4 h-4 text-gray-400" />
        </a>
      </div>

      <div className="text-center py-4 mb-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
        <p className={`text-lg font-bold capitalize ${getRankColor(stats.rank)}`}>
          {stats.rank}
        </p>
        <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
          {stats.rating}
        </p>
        <p className="text-xs text-gray-500 mt-1">Current Rating</p>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="text-center">
          <p className="text-gray-500">Max Rating</p>
          <p className="font-semibold text-gray-900 dark:text-white">{stats.maxRating}</p>
          <p className={`text-xs capitalize ${getRankColor(stats.maxRank)}`}>{stats.maxRank}</p>
        </div>
        <div className="text-center">
          <p className="text-gray-500">Contribution</p>
          <p className={`font-semibold ${stats.contribution >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {stats.contribution >= 0 ? '+' : ''}{stats.contribution}
          </p>
        </div>
      </div>
    </div>
  );
};

// Main PlatformStats Component
const PlatformStats = () => {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getPlatformStats();
      setData(response.data);
    } catch (err) {
      console.error('Error fetching platform stats:', err);
      setError('Failed to fetch platform stats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleUsernameSubmit = async (formData) => {
    try {
      setSubmitting(true);
      const submitData = {};
      if (formData.github) submitData.github = formData.github;
      if (formData.leetcode) submitData.leetcode = formData.leetcode;
      if (formData.codeforces) submitData.codeforces = formData.codeforces;

      await savePlatformUsernames(submitData);
      toast.success('Platform profiles connected successfully!');
      fetchStats();
    } catch (err) {
      console.error('Error saving usernames:', err);
      if (err.response?.data?.validationResults) {
        const results = err.response.data.validationResults;
        Object.entries(results).forEach(([platform, result]) => {
          if (!result.valid) {
            toast.error(`${platform}: ${result.error}`);
          }
        });
      } else {
        toast.error(err.response?.data?.message || 'Failed to save usernames');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="section-title">
            <Code2 className="w-5 h-5 text-primary-500" />
            Coding Platforms
          </h2>
        </div>
        <StatsSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="card border-l-4 border-red-500">
        <div className="flex items-center gap-3 text-red-500">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
        <button 
          onClick={fetchStats}
          className="mt-4 btn-secondary"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Show setup form if user hasn't submitted platform data
  if (!data?.hasPlatformData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="section-title">
            <Code2 className="w-5 h-5 text-primary-500" />
            Coding Platforms
          </h2>
        </div>
        <UsernameSetupForm onSubmit={handleUsernameSubmit} loading={submitting} />
      </div>
    );
  }

  const { stats } = data;
  const hasAnyStats = stats.github || stats.leetcode || stats.codeforces;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="section-title">
          <Code2 className="w-5 h-5 text-primary-500" />
          Coding Platforms
        </h2>
        <button 
          onClick={fetchStats}
          className="btn-ghost text-sm flex items-center gap-1"
        >
          Refresh <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {!hasAnyStats ? (
        <div className="card text-center py-12">
          <Code2 className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
          <p className="text-gray-500 dark:text-gray-400">
            No platform stats available yet
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {stats.github && <GitHubCard stats={stats.github} />}
          {stats.leetcode && <LeetCodeCard stats={stats.leetcode} />}
          {stats.codeforces && <CodeforcesCard stats={stats.codeforces} />}
        </div>
      )}
    </div>
  );
};

export default PlatformStats;
