import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
} from 'recharts';
import { 
  Plus, 
  List, 
  RotateCcw, 
  TrendingUp, 
  Calendar, 
  Target, 
  Award, 
  ArrowUpRight, 
  Sparkles, 
  Flame, 
  ChevronRight,
  BookOpen,
  Code2
} from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import PlatformStats from '../components/platform/PlatformStats';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    const refreshStats = () => fetchStats();
    window.addEventListener('focus', refreshStats);
    window.addEventListener('storage', refreshStats);
    window.addEventListener('question-status-updated', refreshStats);
    return () => {
      window.removeEventListener('focus', refreshStats);
      window.removeEventListener('storage', refreshStats);
      window.removeEventListener('question-status-updated', refreshStats);
    };
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/questions/all?limit=0');
      const questions = response.data.questions || [];
      let userStatuses = {};

      try {
        userStatuses = JSON.parse(localStorage.getItem('dsa_user_question_statuses') || '{}');
      } catch (error) {
        console.error('Error reading saved question statuses:', error);
      }

      const getStatus = (question) => {
        const serialKey = question._serial;
        const compoundKey = `${question.bookId}-${question.id}`;
        const hasSavedStatus = Object.prototype.hasOwnProperty.call(userStatuses, serialKey)
          || Object.prototype.hasOwnProperty.call(userStatuses, compoundKey);
        const savedStatus = userStatuses[serialKey] ?? userStatuses[compoundKey];

        if (hasSavedStatus) return savedStatus;
        if (question.solved === true || question.solved === 'true') return 'solved';
        if (question.status === 'solved' || question.status === 'revision') return question.status;
        return 'unsolved';
      };

      const chapterCounts = {};
      let solvedQuestions = 0;
      let revisionCount = 0;

      questions.forEach((question) => {
        const status = getStatus(question);
        if (status === 'solved') solvedQuestions++;
        if (status === 'revision') revisionCount++;

        const chapter = question.chapter || 'Uncategorized';
        chapterCounts[chapter] = (chapterCounts[chapter] || 0) + 1;

      });

      setStats({
        totalQuestions: questions.length,
        solvedQuestions,
        revisionCount,
        topicStats: Object.entries(chapterCounts)
          .map(([_id, count]) => ({ _id, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10),
      });
    } catch (error) {
      toast.error('Failed to fetch statistics');
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="relative">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-600"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary-600 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  const formatTopicLabel = (topic) => {
    if (!topic) return 'Uncategorized';
    return topic.length > 23 ? `${topic.slice(0, 21).trim()}…` : topic;
  };
  const totalQuestions = stats?.totalQuestions || 0;
  const solvedQuestions = stats?.solvedQuestions || 0;
  const revisionQuestions = stats?.revisionCount || 0;
  const completion = totalQuestions ? Math.round((solvedQuestions / totalQuestions) * 100) : 0;
  const remainingQuestions = Math.max(totalQuestions - solvedQuestions, 0);

  // Enhanced Stat Card Component
  const StatCard = ({ title, value, subtitle, icon: Icon, gradient, link, trend }) => (
    <div className="card card-hover group relative overflow-hidden">
      {/* Gradient background accent */}
      <div className={`absolute top-0 right-0 w-32 h-32 -translate-y-8 translate-x-8 rounded-full opacity-20 ${gradient}`} />
      
      <div className="relative">
        <div className="flex items-start justify-between">
          <div className={`p-3 rounded-xl ${gradient} shadow-lg`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
          {trend && (
            <div className="flex items-center gap-1 text-emerald-500 text-sm font-medium">
              <ArrowUpRight className="w-4 h-4" />
              {trend}
            </div>
          )}
        </div>
        
        <div className="mt-4">
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {value}
          </p>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mt-1">
            {title}
          </p>
          {subtitle && (
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-0.5">
              {subtitle}
            </p>
          )}
        </div>

        {link && (
          <Link
            to={link}
            className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 group-hover:gap-2 transition-all"
          >
            View details
            <ChevronRight className="w-4 h-4" />
          </Link>
        )}
      </div>
    </div>
  );

  // Quick Action Card
  const QuickActionCard = ({ to, icon: Icon, title, description, gradient }) => (
    <Link
      to={to}
      className="card card-hover group flex items-center gap-4 p-5"
    >
      <div className={`p-3 rounded-xl ${gradient} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
        <Icon className="h-5 w-5 text-white" />
      </div>
      <div className="flex-1">
        <p className="font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
          {title}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {description}
        </p>
      </div>
      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-primary-500 group-hover:translate-x-1 transition-all" />
    </Link>
  );

  // Custom Tooltip for Charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="font-medium text-gray-900 dark:text-white">{label}</p>
          <p className="text-primary-600 dark:text-primary-400">
            {payload[0].value} questions
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            Dashboard
            <span className="inline-flex items-center gap-1 text-sm font-medium text-amber-500 bg-amber-50 dark:bg-amber-900/30 px-3 py-1 rounded-full">
              <Flame className="w-4 h-4" />
              Keep Going!
            </span>
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Track your DSA learning progress and stay motivated!
          </p>
        </div>
        <Link to="/app/books" className="btn-primary flex items-center gap-2 w-fit shadow-md shadow-violet-500/20">
          <BookOpen className="w-5 h-5" />
          Open DSA Books
        </Link>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Questions"
          value={stats?.totalQuestions || 0}
          subtitle="Problems solved"
          icon={Target}
          gradient="bg-gradient-to-br from-primary-500 to-primary-600"
          link="/app/books"
        />
        <StatCard
          title="Needs Revision"
          value={stats?.revisionCount || 0}
          subtitle="Review pending"
          icon={RotateCcw}
          gradient="bg-gradient-to-br from-amber-500 to-orange-500"
          link="/app/books"
        />
        <StatCard
          title="Solved Questions"
          value={stats?.solvedQuestions || 0}
          subtitle="Across all DSA books"
          icon={Calendar}
          gradient="bg-gradient-to-br from-emerald-500 to-teal-500"
        />
        <StatCard
          title="Completion"
          value={`${stats?.totalQuestions ? Math.round(((stats?.solvedQuestions || 0) / stats.totalQuestions) * 100) : 0}%`}
          subtitle="Overall book progress"
          icon={Award}
          gradient="bg-gradient-to-br from-primary-500 to-primary-700"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Topic Distribution */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="section-title">
              <TrendingUp className="w-5 h-5 text-primary-500" />
              Questions by Topic
            </h3>
          </div>
          {stats?.topicStats && stats.topicStats.length > 0 ? (
            <ResponsiveContainer width="100%" height={Math.max(340, stats.topicStats.length * 38)}>
              <BarChart
                data={stats.topicStats}
                layout="vertical"
                margin={{ top: 4, right: 12, bottom: 4, left: 8 }}
                barCategoryGap="24%"
              >
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                <XAxis
                  type="number"
                  stroke="var(--text-secondary)"
                  fontSize={11}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <YAxis 
                  dataKey="_id" 
                  type="category"
                  width={142}
                  stroke="var(--text-secondary)"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={formatTopicLabel}
                />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ fill: 'var(--soft-green)', opacity: 0.45 }}
                />
                <Bar 
                  dataKey="count" 
                  fill="var(--accent)"
                  radius={[0, 5, 5, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
              <Target className="w-12 h-12 mb-3 opacity-50" />
              <p>No data available yet</p>
              <Link to="/app/add-question" className="mt-3 text-primary-500 hover:text-primary-600 text-sm font-medium">
                Add your first question →
              </Link>
            </div>
          )}
        </div>

        {/* Study Overview */}
        <div className="card study-overview-card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="section-title">
              <Target className="w-5 h-5 text-primary-500" />
              Study overview
            </h3>
            <span className="overview-kicker">Your momentum</span>
          </div>

          <div className="overview-progress">
            <div className="overview-progress-heading">
              <div>
                <span className="muted-label">Overall completion</span>
                <strong>{completion}%</strong>
              </div>
              <span>{solvedQuestions} of {totalQuestions} solved</span>
            </div>
            <div className="overview-track">
              <span style={{ width: `${completion}%` }} />
            </div>
          </div>

          <div className="overview-stats">
            <div><strong>{solvedQuestions}</strong><span>Solved</span></div>
            <div><strong>{revisionQuestions}</strong><span>Revision</span></div>
            <div><strong>{remainingQuestions}</strong><span>To explore</span></div>
          </div>

          <div className="overview-focus">
            <div className="flex items-center justify-between mb-3">
              <span className="muted-label">Top focus areas</span>
              <Link to="/app/books" className="text-xs text-primary-600 dark:text-primary-400 font-medium">View books</Link>
            </div>
            {stats?.topicStats?.length ? (
              stats.topicStats.slice(0, 3).map((topic, index) => (
                <div className="focus-row" key={topic._id}>
                  <span className="focus-index">0{index + 1}</span>
                  <span className="focus-name">{formatTopicLabel(topic._id)}</span>
                  <span className="focus-count">{topic.count}</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">Start solving questions to see your focus areas.</p>
            )}
          </div>
        </div>
      </div>

      {/* Platform Stats Section */}
      <PlatformStats />

      {/* Quick Actions */}
      <div className="card">
        <h3 className="section-title mb-6">
          <Sparkles className="w-5 h-5 text-primary-500" />
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <QuickActionCard
            to="/app/books"
            icon={BookOpen}
            title="Interactive DSA Books"
            description="Explore chapters & patterns"
            gradient="bg-gradient-to-br from-primary-500 to-primary-700"
          />
          <QuickActionCard
            to="/app/profile"
            icon={Target}
            title="Profile & Activity"
            description="LeetCode & Codeforces sync"
            gradient="bg-gradient-to-br from-emerald-500 to-teal-500"
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
