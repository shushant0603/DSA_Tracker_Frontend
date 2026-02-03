import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  ExternalLink, 
  Edit, 
  Trash2, 
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar,
  Tag,
  X,
  Loader2,
  Timer,
  Bell,
  BellOff,
  Settings2
} from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import SearchInput from '../components/SearchInput';

// Schedule Edit Modal Component
const ScheduleModal = ({ question, onClose, onSave }) => {
  const [enabled, setEnabled] = useState(question.revisionSchedule?.enabled || false);
  const [intervalDays, setIntervalDays] = useState(question.revisionSchedule?.intervalDays || 3);
  const [saving, setSaving] = useState(false);

  const intervals = [
    { value: 1, label: '1 day' },
    { value: 2, label: '2 days' },
    { value: 3, label: '3 days' },
    { value: 5, label: '5 days' },
    { value: 7, label: '1 week' },
    { value: 14, label: '2 weeks' },
    { value: 30, label: '1 month' },
  ];

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.patch(`/questions/${question._id}/revision-schedule`, {
        enabled,
        intervalDays: parseInt(intervalDays)
      });
      toast.success(enabled ? 'Revision schedule updated!' : 'Revision schedule disabled');
      onSave();
      onClose();
    } catch (error) {
      toast.error('Failed to update schedule');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 animate-scale-in" onClick={e => e.stopPropagation()}>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Revision Schedule
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          {question.title}
        </p>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Enable Schedule</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Auto-remind for revision</p>
            </div>
            <button
              type="button"
              onClick={() => setEnabled(!enabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                enabled ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                enabled ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>

          {enabled && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Revision Interval
              </label>
              <select
                value={intervalDays}
                onChange={(e) => setIntervalDays(e.target.value)}
                className="input-field"
              >
                {intervals.map(i => (
                  <option key={i.value} value={i.value}>Every {i.label}</option>
                ))}
              </select>
            </div>
          )}

          {question.revisionSchedule?.timesRevised > 0 && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Revised {question.revisionSchedule.timesRevised} time{question.revisionSchedule.timesRevised > 1 ? 's' : ''}
            </p>
          )}
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="btn-primary flex-1">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
};

const QuestionsList = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [scheduleModal, setScheduleModal] = useState(null); // Question to edit schedule
  const [filters, setFilters] = useState({
    search: '',
    topic: '',
    platform: '',
    difficulty: '',
    needsRevision: '',
    sortBy: 'solvedDate',
    sortOrder: 'desc',
    page: 1,
    limit: 20,
  });
  const [showFilters, setShowFilters] = useState(false);

  const topics = [
    'Array', 'String', 'Hash Table', 'Dynamic Programming', 'Math', 'Sorting',
    'Greedy', 'Depth-First Search', 'Breadth-First Search', 'Tree', 'Binary Search',
    'Matrix', 'Two Pointers', 'Bit Manipulation', 'Stack', 'Heap', 'Graph',
    'Design', 'Backtracking', 'Sliding Window', 'Union Find', 'Trie', 'Recursion',
    'Binary Tree', 'Binary Search Tree', 'Linked List', 'Queue', 'Other'
  ];

  const platforms = [
    'LeetCode', 'Codeforces', 'GeeksforGeeks', 'HackerRank', 'CodeChef', 'AtCoder', 'Other'
  ];

  const difficulties = ['Easy', 'Medium', 'Hard'];

  const handleSearch = useCallback((searchValue) => {
    setFilters(prev => {
      if (prev.search !== searchValue) {
        return {
          ...prev,
          search: searchValue,
          page: 1, // Reset to first page when search changes
        };
      }
      return prev;
    });
  }, []);

  const fetchQuestions = useCallback(async (currentFilters) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      Object.entries(currentFilters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
  
      const response = await api.get(`/questions?${params.toString()}`);
      
      console.log("API Response Questions:", response.data.questions); // <-- log here
  
      setQuestions(response.data.questions);
      setPagination(response.data.pagination);
    } catch (error) {
      toast.error('Failed to fetch questions');
      console.error('Error fetching questions:', error);
    } finally {
      setLoading(false);
    }
  }, []);
  
  useEffect(() => {
    fetchQuestions(filters);
  }, [filters, fetchQuestions]);
  


  const handleFilterChange = useCallback((key, value) => {
    setFilters(prev => {
      if (prev[key] !== value) {
        return {
          ...prev,
          [key]: value,
          page: 1, // Reset to first page when filters change
        };
      }
      return prev;
    });
  }, []);

  const handlePageChange = useCallback((newPage) => {
    setFilters(prev => {
      if (prev.page !== newPage) {
        return {
          ...prev,
          page: newPage,
        };
      }
      return prev;
    });
  }, []);

  const handleDelete = async (questionId) => {
    if (!window.confirm('Are you sure you want to delete this question?')) {
      return;
    }

    try {
      await api.delete(`/questions/${questionId}`);
      toast.success('Question deleted successfully');
      fetchQuestions();
    } catch (error) {
      toast.error('Failed to delete question');
      console.error('Error deleting question:', error);
    }
  };

  const handleToggleRevision = async (questionId, needsRevision) => {
    try {
      await api.patch(`/questions/${questionId}/toggle-revision`, {
        needsRevision: !needsRevision,
      });
      toast.success('Revision status updated');
      fetchQuestions();
    } catch (error) {
      toast.error('Failed to update revision status');
      console.error('Error updating revision status:', error);
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
          <p className="text-gray-500 dark:text-gray-400">Loading questions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">All Questions</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            <span className="font-semibold text-primary-600 dark:text-primary-400">{pagination.totalQuestions}</span> questions in your collection
          </p>
        </div>
        <Link
          to="/app/add-question"
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Question
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <SearchInput onSearch={handleSearch} />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`btn-secondary flex items-center gap-2 ${showFilters ? 'bg-primary-50 text-primary-700 border-primary-200 dark:bg-primary-900/30 dark:text-primary-300 dark:border-primary-700' : ''}`}
          >
            <Filter className="w-4 h-4" />
            Filters
            {(filters.topic || filters.platform || filters.difficulty || filters.needsRevision) && (
              <span className="w-2 h-2 rounded-full bg-primary-500" />
            )}
          </button>
        </div>

        {showFilters && (
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Filter Options</h3>
              {(filters.topic || filters.platform || filters.difficulty || filters.needsRevision) && (
                <button
                  onClick={() => setFilters(prev => ({ ...prev, topic: '', platform: '', difficulty: '', needsRevision: '', page: 1 }))}
                  className="text-xs text-primary-600 hover:text-primary-700 dark:text-primary-400 flex items-center gap-1"
                >
                  <X className="w-3 h-3" />
                  Clear all
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Topic
              </label>
              <select
                value={filters.topic}
                onChange={(e) => handleFilterChange('topic', e.target.value)}
                className="input-field"
              >
                <option value="">All Topics</option>
                {topics.map(topic => (
                  <option key={topic} value={topic}>{topic}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Platform
              </label>
              <select
                value={filters.platform}
                onChange={(e) => handleFilterChange('platform', e.target.value)}
                className="input-field"
              >
                <option value="">All Platforms</option>
                {platforms.map(platform => (
                  <option key={platform} value={platform}>{platform}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Difficulty
              </label>
              <select
                value={filters.difficulty}
                onChange={(e) => handleFilterChange('difficulty', e.target.value)}
                className="input-field"
              >
                <option value="">All Difficulties</option>
                {difficulties.map(difficulty => (
                  <option key={difficulty} value={difficulty}>{difficulty}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Status
              </label>
              <select
                value={filters.needsRevision}
                onChange={(e) => handleFilterChange('needsRevision', e.target.value)}
                className="input-field"
              >
                <option value="">All Questions</option>
                <option value="true">Needs Revision</option>
                <option value="false">Reviewed</option>
              </select>
            </div>
            </div>
          </div>
        )}
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        {questions.length === 0 ? (
          <div className="card text-center py-16">
            <div className="w-16 h-16 mx-auto bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No questions found</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              {filters.search || filters.topic || filters.platform || filters.difficulty 
                ? "Try adjusting your filters or search query" 
                : "Start building your collection by adding your first question"}
            </p>
            <Link to="/app/add" className="btn-primary inline-flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Your First Question
            </Link>
          </div>
        ) : (
          questions.map((question) => (
            <div key={question._id} className="card group hover:shadow-lg hover:border-primary-200 dark:hover:border-primary-800 transition-all duration-300">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center flex-wrap gap-2 mb-3">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors truncate">
                      {question.title}
                    </h3>
                    <span className={getDifficultyBadge(question.difficulty)}>
                      {question.difficulty}
                    </span>
                    {question.needsRevision && (
                      <span className="badge bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300 border border-amber-200 dark:border-amber-700">
                        <RotateCcw className="w-3 h-3 mr-1" />
                        Needs Revision
                      </span>
                    )}
                    {question.revisionSchedule?.enabled && (
                      <span className="badge bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300 border border-purple-200 dark:border-purple-700">
                        <Timer className="w-3 h-3 mr-1" />
                        Every {question.revisionSchedule.intervalDays}d
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400 mb-3 flex-wrap">
                    <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-md font-medium">
                      {question.platform}
                    </span>
                    <span className="text-gray-300 dark:text-gray-600">|</span>
                    <div className="flex gap-1.5 flex-wrap">
                      {Array.isArray(question.topic) ? (
                        question.topic.slice(0, 3).map((topic, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-0.5 text-xs font-medium text-primary-700 bg-primary-50 rounded-md dark:bg-primary-900/30 dark:text-primary-300"
                          >
                            {topic}
                          </span>
                        ))
                      ) : null}
                      {Array.isArray(question.topic) && question.topic.length > 3 && (
                        <span className="text-xs text-gray-500">+{question.topic.length - 3} more</span>
                      )}
                    </div>
                    <span className="text-gray-300 dark:text-gray-600">|</span>
                    <span className="inline-flex items-center gap-1 text-gray-500">
                      <Calendar className="w-3.5 h-3.5" />
                      {format(new Date(question.solvedDate), 'MMM dd, yyyy')}
                    </span>
                  </div>

                  {question.description && (
                    <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm line-clamp-2">
                      {question.description}
                    </p>
                  )}

                  {question.tags && question.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {question.tags.slice(0, 5).map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                        >
                          <Tag className="w-2.5 h-2.5" />
                          {tag}
                        </span>
                      ))}
                      {question.tags.length > 5 && (
                        <span className="text-xs text-gray-500">+{question.tags.length - 5}</span>
                      )}
                    </div>
                  )}

                  <a
                    href={question.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 text-sm font-medium transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    View Problem
                  </a>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setScheduleModal(question)}
                    className={`p-2.5 rounded-xl transition-all duration-200 ${
                      question.revisionSchedule?.enabled
                        ? 'bg-purple-100 text-purple-600 hover:bg-purple-200 dark:bg-purple-900/50 dark:text-purple-400 dark:hover:bg-purple-800/50'
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-purple-600 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-purple-400'
                    }`}
                    title="Schedule revision"
                  >
                    {question.revisionSchedule?.enabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
                  </button>
                  
                  <button
                    onClick={() => handleToggleRevision(question._id, question.needsRevision)}
                    className={`p-2.5 rounded-xl transition-all duration-200 ${
                      question.needsRevision
                        ? 'bg-amber-100 text-amber-600 hover:bg-amber-200 dark:bg-amber-900/50 dark:text-amber-400 dark:hover:bg-amber-800/50'
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-amber-600 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-amber-400'
                    }`}
                    title={question.needsRevision ? 'Mark as reviewed' : 'Mark for revision'}
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                  
                  <button
                    onClick={() => handleDelete(question._id)}
                    className="p-2.5 rounded-xl bg-gray-100 text-gray-500 hover:bg-red-100 hover:text-red-600 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-red-900/50 dark:hover:text-red-400 transition-all duration-200"
                    title="Delete question"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="card">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Showing page <span className="font-semibold text-gray-900 dark:text-white">{pagination.currentPage}</span> of <span className="font-semibold text-gray-900 dark:text-white">{pagination.totalPages}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={!pagination.hasPrev}
                className="p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 hover:border-gray-300 dark:hover:bg-gray-700 dark:hover:border-gray-600 transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  const pageNum = Math.max(1, Math.min(pagination.currentPage - 2, pagination.totalPages - 4)) + i;
                  if (pageNum > pagination.totalPages) return null;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`w-10 h-10 rounded-xl text-sm font-medium transition-all ${
                        pageNum === pagination.currentPage
                          ? 'bg-primary-600 text-white'
                          : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              
              <button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={!pagination.hasNext}
                className="p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 hover:border-gray-300 dark:hover:bg-gray-700 dark:hover:border-gray-600 transition-all"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Modal */}
      {scheduleModal && (
        <ScheduleModal
          question={scheduleModal}
          onClose={() => setScheduleModal(null)}
          onSave={() => fetchQuestions(filters)}
        />
      )}
    </div>
  );
};

export default QuestionsList;
