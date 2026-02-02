import React, { useState, useEffect } from 'react';
import { 
  RotateCcw, 
  ExternalLink, 
  CheckCircle, 
  Clock,
  Target,
  TrendingUp
} from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const Revision = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchRevisionQuestions();
    fetchStats();
  }, []);

  const fetchRevisionQuestions = async () => {
    try {
      setLoading(true);
      const response = await api.get('/questions?needsRevision=true&sortBy=solvedDate&sortOrder=asc');
      setQuestions(response.data.questions);
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

  const handleMarkAsReviewed = async (questionId) => {
    try {
      await api.patch(`/questions/${questionId}/toggle-revision`, {
        needsRevision: false,
      });
      toast.success('Question marked as reviewed!');
      fetchRevisionQuestions();
      fetchStats(); // Refresh stats
    } catch (error) {
      toast.error('Failed to update question status');
      console.error('Error updating question:', error);
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
      fetchRevisionQuestions();
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
            <RotateCcw className="w-6 h-6 mr-2 text-yellow-600" />
            Revision Mode
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Practice questions that need revision
          </p>
        </div>
        {questions.length > 0 && (
          <button
            onClick={handleMarkAllAsReviewed}
            className="btn-primary flex items-center"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Mark All as Reviewed
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 rounded-lg bg-yellow-100 dark:bg-yellow-900">
              <Target className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Questions to Review
              </p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {questions.length}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 rounded-lg bg-green-100 dark:bg-green-900">
              <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Questions
              </p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {stats?.totalQuestions || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 rounded-lg bg-blue-100 dark:bg-blue-900">
              <TrendingUp className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Completion Rate
              </p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {stats?.totalQuestions 
                  ? Math.round(((stats.totalQuestions - questions.length) / stats.totalQuestions) * 100)
                  : 0}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Revision Questions */}
      <div className="space-y-4">
        {questions.length === 0 ? (
          <div className="card text-center py-12">
            <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-green-100 dark:bg-green-900 mb-4">
              <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              All caught up!
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              No questions need revision at the moment.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              Keep solving new problems and mark difficult ones for revision.
            </p>
          </div>
        ) : (
          questions.map((question, index) => (
            <div key={question._id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      #{index + 1}
                    </span>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      {question.title}
                    </h3>
                    <span className={getDifficultyBadge(question.difficulty)}>
                      {question.difficulty}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-2">
                    <span className='px-3 py-1 text-sm font-bold'>{question.platform}</span>
                    <span>•</span>
                    <div className="flex gap-2 flex-wrap">
  {question.topic.map((topic, index) => (
    <span
      key={index}
      className="px-3 py-1 text-sm font-bold text-white bg-gradient-to-r from-purple-500 to-indigo-500 rounded-lg shadow-md"
    >
      {topic}
    </span>
  ))}
</div>
                    <span>•</span>
                    <span className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {format(new Date(question.solvedDate), 'MMM dd, yyyy')}
                    </span>
                  </div>

                  {question.description && (
                    <p className="text-gray-600 dark:text-gray-400 mb-3">
                      {question.description}
                    </p>
                  )}

                  {question.notes && (
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 mb-3">
                      <p className="text-sm text-yellow-800 dark:text-yellow-200">
                        <strong>Notes:</strong> {question.notes}
                      </p>
                    </div>
                  )}

                  {question.tags && question.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {question.tags.map((tag, tagIndex) => (
                        <span
                          key={tagIndex}
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
                      Practice Now
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => handleMarkAsReviewed(question._id)}
                    className="btn-primary flex items-center text-sm"
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Mark as Reviewed
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Progress Bar */}
      {stats?.totalQuestions && stats.totalQuestions > 0 && (
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Revision Progress
          </h3>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-green-600 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${((stats.totalQuestions - questions.length) / stats.totalQuestions) * 100}%`
              }}
            />
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            {stats.totalQuestions - questions.length} of {stats.totalQuestions} questions reviewed
          </p>
        </div>
      )}
    </div>
  );
};

export default Revision;
