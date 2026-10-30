import React, { useEffect, useState } from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import {
  Home,
  List,
  User,
  Menu,
  X,
  Sun,
  Moon,
  LogOut,
  Code2,
  ChevronRight,
  Sparkles,
  BookOpen,
  CalendarClock,
  Bell
} from 'lucide-react';
import { getRevisionSummary } from '../services/revision';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const location = useLocation();
  const [revisionSummary, setRevisionSummary] = useState(null);
  const [showRevisionNotice, setShowRevisionNotice] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/app/dashboard', icon: Home, description: 'Overview & stats' },
    { name: 'DSA Books', href: '/app/books', icon: BookOpen, description: 'Chapters & Patterns' },
    { name: 'Revision', href: '/app/revision', icon: CalendarClock, description: 'Due questions' },
    { name: 'Profile', href: '/app/profile', icon: User, description: 'Account settings' },
  ];

  const isActive = (path) => location.pathname === path;

  useEffect(() => {
    const fetchRevisionSummary = async () => {
      try {
        const response = await getRevisionSummary();
        const summary = response.data;
        setRevisionSummary(summary);
        const today = new Date().toISOString().slice(0, 10);
        const dismissedOn = localStorage.getItem('revision-notice-dismissed-on');
        setShowRevisionNotice(summary.totalDue > 0 && dismissedOn !== today);
      } catch (error) {
        console.error('Error fetching revision notification:', error);
      }
    };

    fetchRevisionSummary();
    window.addEventListener('focus', fetchRevisionSummary);
    window.addEventListener('revision-updated', fetchRevisionSummary);
    return () => {
      window.removeEventListener('focus', fetchRevisionSummary);
      window.removeEventListener('revision-updated', fetchRevisionSummary);
    };
  }, []);

  const dismissRevisionNotice = () => {
    localStorage.setItem('revision-notice-dismissed-on', new Date().toISOString().slice(0, 10));
    setShowRevisionNotice(false);
  };

  const NavLink = ({ item, mobile = false }) => {
    const Icon = item.icon;
    const active = isActive(item.href);
    
    return (
      <Link
        to={item.href}
        onClick={() => mobile && setSidebarOpen(false)}
        className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
          active
            ? 'bg-primary-50 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300 shadow-sm'
            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
        }`}
      >
        <div className={`p-2 rounded-lg transition-all duration-200 ${
          active 
            ? 'bg-primary-100 dark:bg-primary-800 text-primary-600 dark:text-primary-400' 
            : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 group-hover:bg-gray-200 dark:group-hover:bg-gray-600'
        }`}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="flex-1">
          <p className={`text-sm font-medium ${active ? 'text-primary-700 dark:text-primary-300' : ''}`}>
            {item.name}
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 hidden lg:block">
            {item.description}
          </p>
        </div>
        {active && (
          <ChevronRight className="w-4 h-4 text-primary-500" />
        )}
      </Link>
    );
  };

  return (
    <div className="app-shell min-h-screen">
      {/* Mobile sidebar overlay */}
      <div className={`fixed inset-0 z-50 lg:hidden transition-opacity duration-300 ${sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div 
          className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm" 
          onClick={() => setSidebarOpen(false)} 
        />
        <div className={`app-sidebar fixed inset-y-0 left-0 w-72 shadow-2xl transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="flex h-16 items-center justify-between px-4 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-gradient-to-br from-primary-500 to-cyan-500">
                <Code2 className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold text-gray-900 dark:text-white">
                DSA Tracker
              </span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <nav className="flex-1 space-y-1 px-3 py-4">
            {navigation.map((item) => (
              <NavLink key={item.name} item={item} mobile />
            ))}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col">
        <div className="app-sidebar flex flex-col flex-grow border-r">
          {/* Logo */}
          <div className="app-topbar flex h-16 items-center gap-3 px-5 border-b">
            <div className="p-2 rounded-xl bg-gradient-to-br from-primary-500 to-cyan-500 shadow-lg shadow-primary-500/25">
              <Code2 className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white">
                DSA Tracker
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">Master your skills</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
            <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Menu
            </p>
            {navigation.map((item) => (
              <NavLink key={item.name} item={item} />
            ))}
          </nav>

          {/* User section */}
          <div className="p-4 border-t border-gray-100 dark:border-gray-700/50">
            <div className="app-user-card flex items-center gap-3 p-3 rounded-xl">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-cyan-500 flex items-center justify-center text-white font-semibold text-sm">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {user?.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {user?.email}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-72">
        {/* Top bar */}
        <div className="app-topbar sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b backdrop-blur-xl px-4 sm:px-6 lg:px-8">
          <button
            type="button"
            className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 lg:hidden transition-colors"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Separator */}
          <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 lg:hidden" />

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex flex-1" />
            <div className="flex items-center gap-x-3">
              {/* Theme toggle */}
              <Link
                to="/app/revision"
                className="relative p-2.5 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title="Revision notifications"
              >
                <Bell className="h-5 w-5" />
                {revisionSummary?.totalDue > 0 && (
                  <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-amber-500" />
                )}
              </Link>
              <button
                onClick={toggleDarkMode}
                className="p-2.5 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title={darkMode ? 'Light mode' : 'Dark mode'}
              >
                {darkMode ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </button>

              {/* Separator */}
              <div className="hidden lg:block h-6 w-px bg-gray-200 dark:bg-gray-700" />

              {/* User info (desktop) */}
              <div className="hidden lg:flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {user?.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {user?.email}
                  </p>
                </div>
              </div>

              {/* Logout */}
              <button
                onClick={logout}
                className="p-2.5 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                title="Logout"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Page content */}
        {showRevisionNotice && (
          <div className="fixed top-20 right-4 z-50 w-[min(calc(100vw-2rem),24rem)] card border-l-4 border-amber-500 shadow-xl">
            <div className="flex items-start gap-3">
              <Bell className="w-5 h-5 mt-0.5 text-amber-500 shrink-0" />
              <div className="flex-1">
                <p className="font-semibold text-gray-900 dark:text-white">Today's revision</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {revisionSummary.due} due today
                  {revisionSummary.overdue > 0 && ` · ${revisionSummary.overdue} overdue`}
                </p>
                <Link to="/app/revision" onClick={dismissRevisionNotice} className="inline-block mt-3 btn-primary text-sm py-2 px-3">
                  Start revision
                </Link>
              </div>
              <button onClick={dismissRevisionNotice} className="text-gray-400 hover:text-gray-600" aria-label="Dismiss revision notification">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
        <main className="py-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
