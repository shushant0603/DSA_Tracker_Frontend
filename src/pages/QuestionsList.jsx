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
  Plus
} from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import SearchInput from '../components/SearchInput';

const QuestionsList = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">All Questions</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            {pagination.totalQuestions} questions found
          </p>
        </div>
        <Link
          to="/add-question"
          className="btn-primary flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
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
            className="btn-secondary flex items-center"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </button>
        </div>

        {showFilters && (
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
        )}
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        {questions.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">No questions found</p>
            <Link to="/add-question" className="btn-primary mt-4 inline-flex items-center">
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Question
            </Link>
          </div>
        ) : (
          questions.map((question) => (
            <div key={question._id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      {question.title}
                    </h3>
                    <span className={getDifficultyBadge(question.difficulty)}>
                      {question.difficulty}
                    </span>
                    {question.needsRevision && (
                      <span className="badge bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                        Needs Revision
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-2">
                    <span>{question.platform}</span>
                    <span>•</span>
                    <div className="flex gap-2 flex-wrap">
  {Array.isArray(question.topic) ? (
    question.topic.map((topic, index) => (
      <span
        key={index}
        className="px-2 py-1 text-sm text-gray-700 bg-gray-200 rounded-md dark:bg-gray-700 dark:text-gray-300"
      >
        {topic}
      </span>
    ))
  ) : (
    <span className="text-sm text-gray-500 italic">No topics available</span>
  )}
</div>
                    <span>•</span>
                    <span>{format(new Date(question.solvedDate), 'MMM dd, yyyy')}</span>
                  </div>

                  {question.description && (
                    <p className="text-gray-600 dark:text-gray-400 mb-3">
                      {question.description}
                    </p>
                  )}

                  {question.tags && question.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {question.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-4">
                    <a
                      href={question.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300 text-sm font-medium flex items-center"
                    >
                      <ExternalLink className="w-4 h-4 mr-1" />
                      View Problem
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => handleToggleRevision(question._id, question.needsRevision)}
                    className={`p-2 rounded-lg transition-colors ${
                      question.needsRevision
                        ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200 dark:bg-yellow-900 dark:text-yellow-400 dark:hover:bg-yellow-800'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600'
                    }`}
                    title={question.needsRevision ? 'Mark as reviewed' : 'Mark for revision'}
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                  
                  <button
                    onClick={() => handleDelete(question._id)}
                    className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900 dark:text-red-400 dark:hover:bg-red-800 transition-colors"
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
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700 dark:text-gray-300">
            Showing {((pagination.currentPage - 1) * pagination.totalQuestions) + 1} to{' '}
            {Math.min(pagination.currentPage * pagination.totalQuestions, pagination.totalQuestions)} of{' '}
            {pagination.totalQuestions} results
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              disabled={!pagination.hasPrev}
              className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            
            <span className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              Page {pagination.currentPage} of {pagination.totalPages}
            </span>
            
            <button
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={!pagination.hasNext}
              className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionsList;
