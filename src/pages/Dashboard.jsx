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
  PieChart,
  Pie,
  Cell
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
  ChevronRight
} from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import PlatformStats from '../components/platform/PlatformStats';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/questions/stats');
      setStats(response.data);
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

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];
  
  const DIFFICULTY_COLORS = {
    'Easy': '#10b981',
    'Medium': '#f59e0b', 
    'Hard': '#ef4444'
  };

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
        <Link to="/app/add-question" className="btn-primary flex items-center gap-2 w-fit">
          <Plus className="w-5 h-5" />
          Add Question
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
          link="/app/questions"
        />
        <StatCard
          title="Needs Revision"
          value={stats?.revisionCount || 0}
          subtitle="Review pending"
          icon={RotateCcw}
          gradient="bg-gradient-to-br from-amber-500 to-orange-500"
          link="/app/revision"
        />
        <StatCard
          title="This Month"
          value={stats?.recentQuestions || 0}
          subtitle="Recent progress"
          icon={Calendar}
          gradient="bg-gradient-to-br from-emerald-500 to-teal-500"
          trend="+12%"
        />
        <StatCard
          title="Completion"
          value={`${Math.min(100, Math.round(((stats?.totalQuestions || 0) / 100) * 100))}%`}
          subtitle="Towards 100 goal"
          icon={Award}
          gradient="bg-gradient-to-br from-violet-500 to-purple-600"
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
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.topicStats} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />
                <XAxis type="number" stroke="#9ca3af" fontSize={12} />
                <YAxis 
                  dataKey="_id" 
                  type="category"
                  width={100}
                  stroke="#9ca3af"
                  fontSize={12}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="count" 
                  fill="url(#colorGradient)" 
                  radius={[0, 4, 4, 0]}
                />
                <defs>
                  <linearGradient id="colorGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#06b6d4" />
                  </linearGradient>
                </defs>
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

        {/* Difficulty Distribution */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="section-title">
              <Award className="w-5 h-5 text-primary-500" />
              Difficulty Breakdown
            </h3>
          </div>
          {stats?.difficultyStats && stats.difficultyStats.length > 0 ? (
            <div className="flex items-center gap-8">
              <ResponsiveContainer width="50%" height={250}>
                <PieChart>
                  <Pie
                    data={stats.difficultyStats}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="count"
                  >
                    {stats.difficultyStats.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={DIFFICULTY_COLORS[entry._id] || COLORS[index % COLORS.length]}
                        strokeWidth={0}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-4">
                {stats.difficultyStats.map((item, index) => {
                  const total = stats.difficultyStats.reduce((acc, curr) => acc + curr.count, 0);
                  const percentage = ((item.count / total) * 100).toFixed(0);
                  return (
                    <div key={item._id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {item._id}
                        </span>
                        <span className="text-sm text-gray-500">
                          {item.count} ({percentage}%)
                        </span>
                      </div>
                      <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full transition-all duration-500"
                          style={{ 
                            width: `${percentage}%`,
                            backgroundColor: DIFFICULTY_COLORS[item._id]
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
              <Award className="w-12 h-12 mb-3 opacity-50" />
              <p>No data available yet</p>
            </div>
          )}
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <QuickActionCard
            to="/app/add-question"
            icon={Plus}
            title="Add New Question"
            description="Track a new problem"
            gradient="bg-gradient-to-br from-primary-500 to-primary-600"
          />
          <QuickActionCard
            to="/app/questions"
            icon={List}
            title="View All Questions"
            description="Browse your collection"
            gradient="bg-gradient-to-br from-emerald-500 to-teal-500"
          />
          <QuickActionCard
            to="/app/revision"
            icon={RotateCcw}
            title="Practice Revision"
            description="Review marked problems"
            gradient="bg-gradient-to-br from-amber-500 to-orange-500"
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
