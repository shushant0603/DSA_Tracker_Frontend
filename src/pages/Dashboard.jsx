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
  Award
} from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import Platform from '../components/platform/Platform';

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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

  const StatCard = ({ title, value, icon: Icon, color = 'primary', link }) => (
    <div className="card hover:shadow-md transition-shadow">
      <div className="flex items-center">
        <div className={`flex-shrink-0 p-3 rounded-lg bg-${color}-100 dark:bg-${color}-900`}>
          <Icon className={`h-6 w-6 text-${color}-600 dark:text-${color}-400`} />
        </div>
        <div className="ml-4 flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-semibold text-gray-900 dark:text-white">{value}</p>
        </div>
      </div>
      {link && (
        <div className="mt-4">
          <Link
            to={link}
            className={`text-sm font-medium text-${color}-600 hover:text-${color}-500 dark:text-${color}-400 dark:hover:text-${color}-300`}
          >
            View details →
          </Link>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Track your DSA learning progress and stay motivated!
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Questions"
          value={stats?.totalQuestions || 0}
          icon={Target}
          color="primary"
          link="/questions"
        />
        <StatCard
          title="Needs Revision"
          value={stats?.revisionCount || 0}
          icon={RotateCcw}
          color="yellow"
          link="/revision"
        />
        <StatCard
          title="This Month"
          value={stats?.recentQuestions || 0}
          icon={Calendar}
          color="green"
        />
        <StatCard
          title="Progress"
          value={`${Math.round(((stats?.totalQuestions || 0) / 100) * 100)}%`}
          icon={TrendingUp}
          color="purple"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Topic Distribution */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Questions by Topic
          </h3>
          {stats?.topicStats && stats.topicStats.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.topicStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="_id" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  fontSize={12}
                />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
              No data available
            </div>
          )}
        </div>

        {/* Difficulty Distribution */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Questions by Difficulty
          </h3>
          {stats?.difficultyStats && stats.difficultyStats.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats.difficultyStats}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ _id, count, percent }) => `${_id}: ${count} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {stats.difficultyStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
              No data available
            </div>
          )}
        </div>
      </div>

      {/* Platform Distribution */}
      <Platform  />

      {/* Quick Actions */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            to="/add-question"
            className="flex items-center p-4 bg-primary-50 dark:bg-primary-900 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-800 transition-colors"
          >
            <Plus className="h-5 w-5 text-primary-600 dark:text-primary-400 mr-3" />
            <span className="text-sm font-medium text-primary-900 dark:text-primary-100">
              Add New Question
            </span>
          </Link>
          <Link
            to="/questions"
            className="flex items-center p-4 bg-green-50 dark:bg-green-900 rounded-lg hover:bg-green-100 dark:hover:bg-green-800 transition-colors"
          >
            <List className="h-5 w-5 text-green-600 dark:text-green-400 mr-3" />
            <span className="text-sm font-medium text-green-900 dark:text-green-100">
              View All Questions
            </span>
          </Link>
          <Link
            to="/revision"
            className="flex items-center p-4 bg-yellow-50 dark:bg-yellow-900 rounded-lg hover:bg-yellow-100 dark:hover:bg-yellow-800 transition-colors"
          >
            <RotateCcw className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mr-3" />
            <span className="text-sm font-medium text-yellow-900 dark:text-yellow-100">
              Practice Revision
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
