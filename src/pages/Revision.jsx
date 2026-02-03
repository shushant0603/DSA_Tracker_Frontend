import React, { useState, useEffect } from 'react';
import { 
  RotateCcw, 
  ExternalLink, 
  CheckCircle, 
  Clock,
  Target,
  TrendingUp,
  Loader2,
  BookOpen,
  Sparkles,
  Calendar,
  Timer,
  Bell,
  BellOff
} from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { format, formatDistanceToNow } from 'date-fns';

const Revision = () => {
  const [manualQuestions, setManualQuestions] = useState([]);
  const [scheduledQuestions, setScheduledQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'manual', 'scheduled'

  useEffect(() => {
    fetchAllRevisionQuestions();
    fetchStats();
  }, []);

  const fetchAllRevisionQuestions = async () => {
    try {
      setLoading(true);
      
      // Fetch both manual and scheduled revisions in parallel
      const [manualRes, scheduledRes] = await Promise.all([
        api.get('/questions?needsRevision=true&sortBy=solvedDate&sortOrder=asc'),
        api.get('/questions/scheduled-revisions')
      ]);
      
      setManualQuestions(manualRes.data.questions);
      setScheduledQuestions(scheduledRes.data.questions);
    } catch (error) {
      toast.error('Failed to fetch revision questions');
      console.error('Error fetching revision questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/questions/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  // Get combined questions based on active tab
  const getDisplayQuestions = () => {
    switch (activeTab) {
      case 'manual':
        return manualQuestions;
      case 'scheduled':
        return scheduledQuestions;
      default:
        // Combine and deduplicate
        const allIds = new Set();
        const combined = [];
        [...scheduledQuestions, ...manualQuestions].forEach(q => {
          if (!allIds.has(q._id)) {
            allIds.add(q._id);
            combined.push(q);
          }
        });
        return combined;
    }
  };

  const questions = getDisplayQuestions();

  const handleMarkAsReviewed = async (questionId, hasSchedule = false) => {
    try {
      await api.patch(`/questions/${questionId}/toggle-revision`, {
        needsRevision: false,
      });
      
      if (hasSchedule) {
        toast.success('Reviewed! Next revision scheduled.');
      } else {
        toast.success('Question marked as reviewed!');
      }
      
      fetchAllRevisionQuestions();
      fetchStats();
    } catch (error) {
      toast.error('Failed to update question status');
      console.error('Error updating question:', error);
    }
  };

  const handleToggleSchedule = async (questionId, currentEnabled) => {
    try {
      await api.patch(`/questions/${questionId}/revision-schedule`, {
        enabled: !currentEnabled,
      });
      toast.success(currentEnabled ? 'Revision schedule disabled' : 'Revision schedule enabled');
      fetchAllRevisionQuestions();
    } catch (error) {
      toast.error('Failed to update schedule');
      console.error('Error updating schedule:', error);
    }
  };

  const handleMarkAllAsReviewed = async () => {
    if (!window.confirm('Are you sure you want to mark all questions as reviewed?')) {
      return;
    }

    try {
      const promises = questions.map(question =>
        api.patch(`/questions/${question._id}/toggle-revision`, {
          needsRevision: false,
        })
      );
      
      await Promise.all(promises);
      toast.success('All questions marked as reviewed!');
      fetchAllRevisionQuestions();
      fetchStats();
    } catch (error) {
      toast.error('Failed to update questions');
      console.error('Error updating questions:', error);
    }
  };

  const getDifficultyBadge = (difficulty) => {
    const baseClasses = 'badge';
    switch (difficulty) {
      case 'Easy':
        return `${baseClasses} badge-easy`;
      case 'Medium':
        return `${baseClasses} badge-medium`;
      case 'Hard':
        return `${baseClasses} badge-hard`;
      default:
        return baseClasses;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-primary-600 animate-spin" />
          <p className="text-gray-500 dark:text-gray-400">Loading revision queue...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500">
              <RotateCcw className="w-6 h-6 text-white" />
            </div>
            Revision Mode
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Practice questions that need revision
          </p>
        </div>
        {questions.length > 0 && (
          <button
            onClick={handleMarkAllAsReviewed}
            className="btn-primary flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            Mark All as Reviewed
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="card bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-amber-200 dark:border-amber-800">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg">
              <Target className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-amber-700 dark:text-amber-300">
                Total Due
              </p>
              <p className="text-2xl font-bold text-amber-900 dark:text-amber-100">
                {questions.length}
              </p>
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 border-purple-200 dark:border-purple-800">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 rounded-xl bg-gradient-to-br from-purple-400 to-violet-500 shadow-lg">
              <Timer className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-purple-700 dark:text-purple-300">
                Scheduled
              </p>
              <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                {scheduledQuestions.length}
              </p>
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 border-emerald-200 dark:border-emerald-800">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 rounded-xl bg-gradient-to-br from-emerald-400 to-green-500 shadow-lg">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                Manual
              </p>
              <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">
                {manualQuestions.length}
              </p>
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-500 shadow-lg">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                Completion
              </p>
              <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                {stats?.totalQuestions 
                  ? Math.round(((stats.totalQuestions - questions.length) / stats.totalQuestions) * 100)
                  : 0}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl w-fit">
        {[
          { id: 'all', label: 'All', count: questions.length },
          { id: 'scheduled', label: 'Scheduled', count: scheduledQuestions.length },
          { id: 'manual', label: 'Manual', count: manualQuestions.length },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            {tab.label}
            <span className={`ml-2 px-1.5 py-0.5 text-xs rounded-full ${
              activeTab === tab.id
                ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
                : 'bg-gray-200 text-gray-600 dark:bg-gray-600 dark:text-gray-300'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Revision Questions */}
      <div className="space-y-4">
        {questions.length === 0 ? (
          <div className="card text-center py-16">
            <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-green-500 shadow-lg mb-6">
              <CheckCircle className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              All caught up! 🎉
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
              No questions need revision at the moment. Keep solving new problems and mark difficult ones for future practice.
            </p>
          </div>
        ) : (
          questions.map((question, index) => (
            <div key={question._id} className="card group hover:shadow-lg hover:border-amber-200 dark:hover:border-amber-800 transition-all duration-300">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center flex-wrap gap-2 mb-3">
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-amber-100 text-amber-700 text-sm font-bold dark:bg-amber-900/50 dark:text-amber-300">
                      {index + 1}
                    </span>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors truncate">
                      {question.title}
                    </h3>
                    <span className={getDifficultyBadge(question.difficulty)}>
                      {question.difficulty}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400 mb-3 flex-wrap">
                    <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-md font-medium">
                      {question.platform}
                    </span>
                    <span className="text-gray-300 dark:text-gray-600">|</span>
                    <div className="flex gap-1.5 flex-wrap">
                      {question.topic.slice(0, 3).map((topic, topicIndex) => (
                        <span
                          key={topicIndex}
                          className="inline-flex items-center px-2 py-0.5 text-xs font-medium text-primary-700 bg-primary-50 rounded-md dark:bg-primary-900/30 dark:text-primary-300"
                        >
                          {topic}
                        </span>
                      ))}
                      {question.topic.length > 3 && (
                        <span className="text-xs text-gray-500">+{question.topic.length - 3} more</span>
                      )}
                    </div>
                    <span className="text-gray-300 dark:text-gray-600">|</span>
                    <span className="inline-flex items-center gap-1 text-gray-500">
                      <Calendar className="w-3.5 h-3.5" />
                      {format(new Date(question.solvedDate), 'MMM dd, yyyy')}
                    </span>
                    {/* Show schedule info */}
                    {question.revisionSchedule?.enabled && (
                      <>
                        <span className="text-gray-300 dark:text-gray-600">|</span>
                        <span className="inline-flex items-center gap-1 text-purple-600 dark:text-purple-400">
                          <Timer className="w-3.5 h-3.5" />
                          Every {question.revisionSchedule.intervalDays} day{question.revisionSchedule.intervalDays > 1 ? 's' : ''}
                          {question.revisionSchedule.timesRevised > 0 && (
                            <span className="text-xs text-gray-500">
                              ({question.revisionSchedule.timesRevised}x revised)
                            </span>
                          )}
                        </span>
                      </>
                    )}
                  </div>

                  {question.description && (
                    <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm line-clamp-2">
                      {question.description}
                    </p>
                  )}

                  {question.notes && (
                    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-3 mb-4">
                      <p className="text-sm text-amber-800 dark:text-amber-200">
                        <strong className="font-semibold">Notes:</strong> {question.notes}
                      </p>
                    </div>
                  )}

                  {question.tags && question.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {question.tags.slice(0, 5).map((tag, tagIndex) => (
                        <span
                          key={tagIndex}
                          className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <a
                    href={question.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 text-sm font-medium transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Practice Now
                  </a>
                </div>

                <div className="flex-shrink-0 flex flex-col gap-2">
                  <button
                    onClick={() => handleMarkAsReviewed(question._id, question.revisionSchedule?.enabled)}
                    className="btn-primary flex items-center gap-2 text-sm whitespace-nowrap"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Mark Reviewed
                  </button>
                  
                  {/* Toggle schedule button */}
                  {question.revisionSchedule?.enabled && (
                    <button
                      onClick={() => handleToggleSchedule(question._id, true)}
                      className="btn-secondary flex items-center gap-2 text-sm whitespace-nowrap text-red-600 hover:text-red-700 border-red-200 hover:border-red-300 dark:text-red-400 dark:border-red-800"
                      title="Disable scheduled revision"
                    >
                      <BellOff className="w-4 h-4" />
                      Stop Schedule
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Progress Bar */}
      {stats?.totalQuestions && stats.totalQuestions > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Revision Progress
            </h3>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {stats.totalQuestions - questions.length} / {stats.totalQuestions} reviewed
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-emerald-400 to-green-500 h-full rounded-full transition-all duration-500 ease-out"
              style={{
                width: `${((stats.totalQuestions - questions.length) / stats.totalQuestions) * 100}%`
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Revision;
