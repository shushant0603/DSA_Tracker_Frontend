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
import { useAuth } from '../contexts/AuthContext';
import { useAppStore } from '../store/appStore';
import { getRevisionSummary } from '../services/revision';
import { getSolvedQuestions } from '../services/solvedQuestions';
import { getProblemOfTheDay } from '../services/problemOfTheDay';

const localDateKey = (date) => [
  date.getFullYear(),
  String(date.getMonth() + 1).padStart(2, '0'),
  String(date.getDate()).padStart(2, '0'),
].join('-');

const makeActivityCalendar = (dailyCounts = {}) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(today);
  start.setDate(start.getDate() - 364);
  start.setDate(start.getDate() - ((start.getDay() + 6) % 7));

  const days = [];
  for (const date = new Date(start); date <= today; date.setDate(date.getDate() + 1)) {
    const value = new Date(date);
    const key = localDateKey(value);
    days.push({ date: value, key, count: Number(dailyCounts[key] || 0) });
  }

  let streakCursor = new Date(today);
  if (!dailyCounts[localDateKey(streakCursor)]) streakCursor.setDate(streakCursor.getDate() - 1);
  let currentStreak = 0;
  while (dailyCounts[localDateKey(streakCursor)]) {
    currentStreak += 1;
    streakCursor.setDate(streakCursor.getDate() - 1);
  }

  let longestStreak = 0;
  let runningStreak = 0;
  days.forEach((day) => {
    runningStreak = day.count ? runningStreak + 1 : 0;
    longestStreak = Math.max(longestStreak, runningStreak);
  });
  return { days, weeks: Math.ceil(days.length / 7), currentStreak, longestStreak };
};

const Dashboard = () => {
  const {
    userCache,
    setDashboardStats,
    invalidateDashboardStats,
    setRevisionSummary,
  } = useAppStore();
  const [stats, setStats] = useState(userCache.dashboardStats);
  const dashboardStatsVersion = 5;
  const hasCurrentStats = userCache.dashboardStats?.version === dashboardStatsVersion;
  const [loading, setLoading] = useState(!hasCurrentStats);
  const [problemOfTheDay, setProblemOfTheDay] = useState(null);
  const { user } = useAuth();
  const userId = user?.id || user?._id;

  useEffect(() => {
    let active = true;
    getProblemOfTheDay()
      .then(({ data }) => {
        if (active) setProblemOfTheDay(data);
      })
      .catch((error) => {
        console.error('Unable to load problem of the day:', error);
      });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    fetchStats();
    const refreshStats = () => {
      invalidateDashboardStats();
      fetchStats(true);
    };
    const refreshRevisionSummary = async () => {
      try {
        const response = await getRevisionSummary();
        const summary = response.data;
        setRevisionSummary(summary);
        setStats((current) => current ? { ...current, revisionCount: summary.active } : current);
      } catch (error) {
        console.error('Error fetching dashboard revision summary:', error);
      }
    };

    refreshRevisionSummary();
    window.addEventListener('question-status-updated', refreshStats);
    window.addEventListener('revision-updated', refreshRevisionSummary);
    return () => {
      window.removeEventListener('question-status-updated', refreshStats);
      window.removeEventListener('revision-updated', refreshRevisionSummary);
    };
  }, [userId, invalidateDashboardStats, setRevisionSummary]);

  const fetchStats = async (force = false) => {
    const cacheIsFresh = !force && userCache.dashboardStats?.version === dashboardStatsVersion &&
      Date.now() - userCache.dashboardStatsFetchedAt < 5 * 60 * 1000;
    if (cacheIsFresh) {
      setStats(userCache.dashboardStats);
      setLoading(false);
      return;
    }
    try {
      const [questionsResponse, solvedResponse] = await Promise.all([
        api.get('/questions/all?limit=0'),
        getSolvedQuestions(),
      ]);
      const questions = questionsResponse.data.questions || [];
      const solvedQuestions = solvedResponse.data.total ?? solvedResponse.data.solvedQuestions?.length ?? 0;

      const chapterCounts = {};
      questions.forEach((question) => {
        const chapter = question.chapter || 'Uncategorized';
        chapterCounts[chapter] = (chapterCounts[chapter] || 0) + 1;

      });

      const nextStats = {
        version: dashboardStatsVersion,
        totalQuestions: questions.length,
        solvedQuestions,
        solvedByDay: solvedResponse.data.byDay || {},
        revisionCount: userCache.revisionSummary?.active || 0,
        topicStats: Object.entries(chapterCounts)
          .map(([_id, count]) => ({ _id, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10),
      };
      setStats(nextStats);
      setDashboardStats(nextStats);
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
  const activityCalendar = makeActivityCalendar(stats?.solvedByDay);
  const activityLevel = (count) => {
    if (!count) return 0;
    if (count >= 5) return 4;
    if (count >= 3) return 3;
    if (count >= 2) return 2;
    return 1;
  };
  const activityMonthLabels = new Map();
  activityCalendar.days.forEach((day, index) => {
    if (day.date.getDate() === 1) activityMonthLabels.set(Math.floor(index / 7), day.date.toLocaleDateString('en-US', { month: 'short' }));
  });

  // Enhanced Stat Card Component
  const StatCard = ({ title, value, subtitle, icon: Icon, gradient, link, trend }) => {
    const content = (
      <>
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
          <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary-600 dark:text-primary-400 group-hover:gap-2 transition-all">
            View details
            <ChevronRight className="w-4 h-4" />
          </span>
        )}
      </div>
      </>
    );
    const className = "card card-hover group relative block overflow-hidden";
    return link
      ? <Link to={link} className={className}>{content}</Link>
      : <div className={className}>{content}</div>;
  };

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
        <div className="flex flex-wrap items-center gap-3">
          {problemOfTheDay?.question && (
            <a
              href={problemOfTheDay.question.leetcodeUrl || problemOfTheDay.question.link}
              target="_blank"
              rel="noopener noreferrer"
              title={`Problem of the Day: ${problemOfTheDay.question.title}`}
              className="group flex w-fit max-w-[min(100%,20rem)] items-center gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50/80 px-3 py-2 transition hover:border-emerald-400 hover:bg-emerald-100 dark:border-emerald-900 dark:bg-emerald-950/40 dark:hover:border-emerald-700 dark:hover:bg-emerald-950/70"
            >
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-emerald-500 text-white"><Code2 className="h-4 w-4" /></span>
              <span className="min-w-0 text-left">
                <span className="block text-[9px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">Problem of the Day</span>
                <span className="block truncate text-xs font-semibold text-gray-900 dark:text-white">{problemOfTheDay.question.title}</span>
              </span>
              <ArrowUpRight className="h-4 w-4 shrink-0 text-emerald-700 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 dark:text-emerald-300" />
            </a>
          )}
          <Link to="/app/books" className="btn-primary flex items-center gap-2 w-fit shadow-md shadow-violet-500/20">
            <BookOpen className="w-5 h-5" />
            Open DSA Books
          </Link>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Questions"
          value={stats?.totalQuestions || 0}
          subtitle="Problems solved"
          icon={Target}
          gradient="bg-gradient-to-br from-primary-500 to-primary-600 dashboard-gradient-green"
          link="/app/books"
        />
        <StatCard
          title="Needs Revision"
          value={stats?.revisionCount || 0}
          subtitle="Review pending"
          icon={RotateCcw}
          gradient="bg-gradient-to-br from-amber-500 to-orange-500 dashboard-gradient-orange"
          link="/app/revision"
        />
        <StatCard
          title="Solved Questions"
          value={stats?.solvedQuestions || 0}
          subtitle="Across all DSA books"
          icon={Calendar}
          gradient="bg-gradient-to-br from-emerald-500 to-teal-500 dashboard-gradient-blue"
          link="/app/books?view=solved"
        />
        <StatCard
          title="Completion"
          value={`${stats?.totalQuestions ? Math.round(((stats?.solvedQuestions || 0) / stats.totalQuestions) * 100) : 0}%`}
          subtitle="Overall book progress"
          icon={Award}
          gradient="bg-gradient-to-br from-primary-500 to-primary-700 dashboard-gradient-purple"
        />
      </div>

      {/* Daily solve streak heatmap */}
      <section className="card">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="section-title"><Flame className="h-5 w-5 text-emerald-500" /> Daily solving streak</h3>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Each square shows how many questions you solved that day.</p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="font-semibold text-gray-700 dark:text-gray-300">🔥 {activityCalendar.currentStreak} day streak</span>
            <span className="text-gray-500 dark:text-gray-400">Best: {activityCalendar.longestStreak} days</span>
            <Link to="/app/books?view=solved" className="font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400">Solved list →</Link>
          </div>
        </div>

        <div className="overflow-x-auto pb-2">
          <div className="w-max">
            <div className="mb-2 grid grid-flow-col gap-1 pl-8 text-[10px] text-gray-500 dark:text-gray-400" style={{ gridTemplateColumns: `repeat(${activityCalendar.weeks}, 12px)` }}>
              {Array.from({ length: activityCalendar.weeks }, (_, week) => <span key={week}>{activityMonthLabels.get(week) || ''}</span>)}
            </div>
            <div className="flex gap-2">
              <div className="grid grid-rows-7 gap-1 pt-0.5 text-[9px] leading-3 text-gray-400 dark:text-gray-500">
                <span>Mon</span><span></span><span>Wed</span><span></span><span>Fri</span><span></span><span></span>
              </div>
              <div className="grid grid-flow-col grid-rows-7 gap-1" style={{ gridAutoColumns: '12px' }}>
                {activityCalendar.days.map((day) => {
                  const level = activityLevel(day.count);
                  const colors = [
                    'bg-gray-100 dark:bg-gray-800',
                    'bg-emerald-200 dark:bg-emerald-950',
                    'bg-emerald-300 dark:bg-emerald-800',
                    'bg-emerald-400 dark:bg-emerald-600',
                    'bg-emerald-600 dark:bg-emerald-400',
                  ];
                  return (
                    <span
                      key={day.key}
                      title={`${day.count} solved · ${day.date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}`}
                      aria-label={`${day.count} solved on ${day.key}`}
                      className={`h-3 w-3 rounded-[3px] ${colors[level]}`}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between text-[10px] text-gray-500 dark:text-gray-400">
          <span>Past year · {activityCalendar.days.reduce((sum, day) => sum + day.count, 0)} questions solved</span>
          <span className="flex items-center gap-1.5">Less <i className="h-3 w-3 rounded-[3px] bg-gray-100 dark:bg-gray-800" /><i className="h-3 w-3 rounded-[3px] bg-emerald-200 dark:bg-emerald-950" /><i className="h-3 w-3 rounded-[3px] bg-emerald-300 dark:bg-emerald-800" /><i className="h-3 w-3 rounded-[3px] bg-emerald-400 dark:bg-emerald-600" /><i className="h-3 w-3 rounded-[3px] bg-emerald-600 dark:bg-emerald-400" /> More</span>
        </div>
      </section>

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
