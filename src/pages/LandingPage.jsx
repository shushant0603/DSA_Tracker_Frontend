import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';
import { Link } from "react-router-dom";
import { 
  Sun, Moon, Code2, ArrowRight, Github, Target, BarChart3, RotateCcw, 
  Sparkles, CheckCircle, Play, Zap, Trophy, Brain, Clock, TrendingUp,
  ChevronRight, Star, Users, BookOpen, Terminal, Layers
} from 'lucide-react';

// Animated background with floating elements
const AnimatedBackground = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary-500/20 rounded-full blur-[120px] animate-pulse" />
    <div className="absolute top-1/2 -left-40 w-96 h-96 bg-cyan-500/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
    <div className="absolute -bottom-40 right-1/3 w-96 h-96 bg-purple-500/15 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
    
    {/* Grid pattern */}
    <div className="absolute inset-0 bg-[linear-gradient(rgba(99,102,241,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.03)_1px,transparent_1px)] bg-[size:64px_64px]" />
  </div>
);

// Floating code snippets
const FloatingCode = () => {
  const snippets = [
    { code: 'def solve():', top: '20%', left: '5%', delay: 0 },
    { code: 'while(left<right)', top: '30%', right: '8%', delay: 0.3 },
    { code: 'return dp[n]', top: '55%', left: '3%', delay: 0.6 },
    { code: 'node.next', top: '65%', right: '6%', delay: 0.9 },
    { code: 'O(log n)', top: '45%', left: '7%', delay: 1.2 },
  ];

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {snippets.map((s, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 0.5, y: 0 }}
          transition={{ delay: s.delay + 0.5, duration: 0.8 }}
          className="absolute hidden lg:block"
          style={{ top: s.top, left: s.left, right: s.right }}
        >
          <code className="text-xs font-mono text-primary-500/40 dark:text-primary-400/30 bg-primary-500/5 px-3 py-1.5 rounded-lg border border-primary-500/10">
            {s.code}
          </code>
        </motion.div>
      ))}
    </div>
  );
};

// --- Header ---
const Header = ({ darkMode, toggleDarkMode, scrolled }) => {
  return (
    <motion.header 
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-lg shadow-gray-200/10 dark:shadow-gray-900/20' 
          : 'bg-transparent'
      }`}
    >
      <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-cyan-500 rounded-xl blur-lg opacity-40 group-hover:opacity-70 transition-opacity" />
            <div className="relative p-2.5 rounded-xl bg-gradient-to-br from-primary-500 to-cyan-500">
              <Code2 className="h-6 w-6 text-white" />
            </div>
          </div>
          <span className="text-xl font-bold text-gray-900 dark:text-white">
            DSA<span className="bg-gradient-to-r from-primary-500 to-cyan-500 bg-clip-text text-transparent">Tracker</span>
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <button
            onClick={toggleDarkMode}
            className="p-2.5 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all hover:scale-105"
          >
            {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
          <Link 
            to="/login"
            className="hidden sm:block px-5 py-2.5 text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors"
          >
            Sign in
          </Link>
          <Link 
            to="/register"
            className="group relative px-6 py-2.5 bg-gradient-to-r from-primary-500 to-cyan-500 text-white font-semibold rounded-xl overflow-hidden transition-all hover:shadow-xl hover:shadow-primary-500/25 hover:scale-105"
          >
            <span className="relative z-10 flex items-center gap-2">
              Get Started
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>
        </div>
      </nav>
    </motion.header>
  );
};

// --- Hero Section ---
const HeroSection = ({ darkMode }) => {
  const [currentWord, setCurrentWord] = useState(0);
  const words = ['Confidence', 'Success', 'Excellence'];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWord((prev) => (prev + 1) % words.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center pt-20">
      <AnimatedBackground />
      <FloatingCode />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-5xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-primary-500/10 to-cyan-500/10 border border-primary-500/20 text-primary-700 dark:text-primary-300 px-5 py-2 rounded-full text-sm font-medium mb-8"
          >
            <Sparkles className="w-4 h-4" />
            <span>Trusted by 500+ developers</span>
            <div className="flex -space-x-2 ml-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className={`w-6 h-6 rounded-full border-2 border-white dark:border-gray-900 bg-gradient-to-br ${
                  ['from-blue-400 to-blue-600', 'from-green-400 to-green-600', 'from-purple-400 to-purple-600', 'from-orange-400 to-orange-600'][i]
                }`} />
              ))}
            </div>
          </motion.div>

          {/* Main heading with animated word */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-5xl md:text-7xl lg:text-8xl font-bold leading-[1.1] mb-8"
          >
            <span className="text-gray-900 dark:text-white">Master DSA with</span>
            <br />
            <span className="relative inline-block mt-2">
              <span className="bg-gradient-to-r from-primary-500 via-purple-500 to-cyan-500 bg-clip-text text-transparent">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={currentWord}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="inline-block"
                  >
                    {words[currentWord]}
                  </motion.span>
                </AnimatePresence>
              </span>
              <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 12" fill="none">
                <path d="M2 10C50 4 150 4 198 10" stroke="url(#gradient)" strokeWidth="3" strokeLinecap="round"/>
                <defs>
                  <linearGradient id="gradient" x1="0" y1="0" x2="200" y2="0">
                    <stop stopColor="#6366f1"/>
                    <stop offset="0.5" stopColor="#a855f7"/>
                    <stop offset="1" stopColor="#06b6d4"/>
                  </linearGradient>
                </defs>
              </svg>
            </span>
          </motion.h1>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-12 leading-relaxed"
          >
            Track your progress, organize problems by topics, 
            <span className="text-primary-600 dark:text-primary-400 font-medium"> connect LeetCode & GitHub</span>, 
            and crack your dream job interviews.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
          >
            <Link 
              to="/register" 
              className="group relative px-8 py-4 bg-gradient-to-r from-primary-500 to-cyan-500 text-white font-semibold text-lg rounded-2xl overflow-hidden transition-all hover:shadow-2xl hover:shadow-primary-500/30 hover:scale-105"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-cyan-600 opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="relative flex items-center justify-center gap-2">
                Start Free Today
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
            <Link 
              to="/login" 
              className="group px-8 py-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-semibold text-lg rounded-2xl border-2 border-gray-200 dark:border-gray-700 hover:border-primary-500 dark:hover:border-primary-500 transition-all hover:shadow-xl"
            >
              <span className="flex items-center justify-center gap-2">
                <Play className="w-5 h-5" />
                Watch Demo
              </span>
            </Link>
          </motion.div>

          {/* Stats Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto"
          >
            {[
              { icon: BookOpen, value: '10K+', label: 'Problems Tracked' },
              { icon: Users, value: '500+', label: 'Active Users' },
              { icon: Trophy, value: '95%', label: 'Success Rate' },
              { icon: Star, value: '4.9', label: 'User Rating' },
            ].map((stat, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.05, y: -5 }}
                className="text-center p-5 rounded-2xl bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-lg shadow-gray-200/20 dark:shadow-gray-900/20"
              >
                <stat.icon className="w-6 h-6 text-primary-500 mx-auto mb-2" />
                <p className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="w-6 h-10 rounded-full border-2 border-gray-400 dark:border-gray-600 flex justify-center pt-2"
        >
          <div className="w-1.5 h-3 bg-gray-400 dark:bg-gray-600 rounded-full" />
        </motion.div>
      </motion.div>
    </section>
  );
};

// --- Features Section ---
const features = [
  { 
    icon: Target, 
    title: 'Smart Question Bank', 
    description: 'Organize problems by topic, difficulty, and platform. Never lose track of what you\'ve solved.',
    color: 'from-blue-500 to-indigo-500',
    bg: 'bg-blue-500/10'
  },
  { 
    icon: TrendingUp, 
    title: 'Platform Integration', 
    description: 'Connect LeetCode & GitHub to automatically sync your stats and showcase your progress.',
    color: 'from-emerald-500 to-teal-500',
    bg: 'bg-emerald-500/10'
  },
  { 
    icon: Brain, 
    title: 'Spaced Repetition', 
    description: 'Our smart revision system reminds you to practice problems at optimal intervals.',
    color: 'from-purple-500 to-pink-500',
    bg: 'bg-purple-500/10'
  },
  { 
    icon: Terminal, 
    title: 'Code Playground', 
    description: 'Write, run and test your code directly in the browser with multi-language support.',
    color: 'from-orange-500 to-red-500',
    bg: 'bg-orange-500/10'
  },
  { 
    icon: BarChart3, 
    title: 'Analytics Dashboard', 
    description: 'Visualize your progress with beautiful charts and insights to stay motivated.',
    color: 'from-cyan-500 to-blue-500',
    bg: 'bg-cyan-500/10'
  },
  { 
    icon: Zap, 
    title: 'Quick Actions', 
    description: 'Add problems in seconds with smart URL parsing and auto-fill features.',
    color: 'from-yellow-500 to-orange-500',
    bg: 'bg-yellow-500/10'
  },
];

const FeaturesSection = ({ darkMode }) => (
  <section className="py-24 md:py-32 relative overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-900" />
    
    <div className="container mx-auto px-6 relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center mb-16"
      >
        <span className="inline-block px-4 py-2 bg-primary-500/10 text-primary-600 dark:text-primary-400 rounded-full text-sm font-medium mb-4">
          Features
        </span>
        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
          Everything You Need to
          <span className="block bg-gradient-to-r from-primary-500 to-cyan-500 bg-clip-text text-transparent">
            Succeed in DSA
          </span>
        </h2>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Powerful tools designed to help you track, organize, and master data structures & algorithms.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -8 }}
              className="group relative p-8 bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 hover:border-primary-500/50 dark:hover:border-primary-500/50 transition-all shadow-lg shadow-gray-200/50 dark:shadow-gray-900/50 hover:shadow-2xl hover:shadow-primary-500/10"
            >
              <div className={`inline-flex p-4 rounded-2xl ${feature.bg} mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <Icon className={`w-8 h-8 bg-gradient-to-r ${feature.color}`} style={{ color: feature.color.includes('blue') ? '#3b82f6' : feature.color.includes('emerald') ? '#10b981' : feature.color.includes('purple') ? '#a855f7' : feature.color.includes('orange') ? '#f97316' : feature.color.includes('cyan') ? '#06b6d4' : '#eab308' }} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{feature.title}</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{feature.description}</p>
              
              <div className="mt-6 flex items-center text-primary-600 dark:text-primary-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                <span>Learn more</span>
                <ChevronRight className="w-4 h-4 ml-1" />
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  </section>
);

// --- How It Works Section ---
const HowItWorksSection = ({ darkMode }) => {
  const steps = [
    { step: '01', title: 'Create Account', description: 'Sign up in seconds with email. No credit card required.' },
    { step: '02', title: 'Connect Platforms', description: 'Link your LeetCode and GitHub to auto-import stats.' },
    { step: '03', title: 'Track & Grow', description: 'Add problems, mark revisions, watch your skills improve.' },
  ];

  return (
    <section className="py-24 md:py-32 bg-gradient-to-br from-primary-500 to-cyan-600 relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.05%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-50" />
      
      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-2 bg-white/20 text-white rounded-full text-sm font-medium mb-4">
            How It Works
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Get Started in Minutes
          </h2>
          <p className="text-xl text-primary-100 max-w-2xl mx-auto">
            Three simple steps to supercharge your DSA preparation
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className="relative"
            >
              <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 text-center border border-white/20 hover:bg-white/20 transition-all">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white text-primary-600 text-3xl font-bold mb-6 shadow-xl">
                  {item.step}
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">{item.title}</h3>
                <p className="text-primary-100 leading-relaxed">{item.description}</p>
              </div>
              
              {/* Connector line */}
              {index < 2 && (
                <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-white/30" />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// --- Testimonials Section ---
const TestimonialsSection = () => {
  const testimonials = [
    {
      name: 'Rahul Sharma',
      role: 'SDE at Google',
      avatar: 'RS',
      content: 'DSA Tracker helped me organize my preparation. The spaced repetition feature is a game-changer!',
      color: 'from-blue-500 to-indigo-500'
    },
    {
      name: 'Priya Patel',
      role: 'SDE at Amazon',
      avatar: 'PP',
      content: 'Finally, a tool that syncs with LeetCode! Tracking 500+ problems has never been easier.',
      color: 'from-purple-500 to-pink-500'
    },
    {
      name: 'Arjun Kumar',
      role: 'SDE at Microsoft',
      avatar: 'AK',
      content: 'The analytics dashboard motivated me to stay consistent. Cracked my dream job in 3 months!',
      color: 'from-emerald-500 to-teal-500'
    },
  ];

  return (
    <section className="py-24 md:py-32 bg-gray-50 dark:bg-gray-800/50">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-2 bg-primary-500/10 text-primary-600 dark:text-primary-400 rounded-full text-sm font-medium mb-4">
            Testimonials
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Loved by Developers
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={{ y: -5 }}
              className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-xl shadow-gray-200/50 dark:shadow-gray-900/50"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${t.color} flex items-center justify-center text-white font-bold text-lg`}>
                  {t.avatar}
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white">{t.name}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{t.role}</p>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">"{t.content}"</p>
              <div className="flex gap-1">
                {[...Array(5)].map((_, j) => (
                  <Star key={j} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// --- CTA Section ---
const CTASection = ({ darkMode }) => (
  <section className="py-24 md:py-32">
    <div className="container mx-auto px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden rounded-[3rem] bg-gradient-to-br from-gray-900 to-gray-800 dark:from-gray-800 dark:to-gray-900 p-12 md:p-20"
      >
        {/* Background glow effects */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500/30 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-500/30 rounded-full blur-[100px]" />
        
        <div className="relative z-10 text-center">
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Ready to Crack Your
            <span className="block bg-gradient-to-r from-primary-400 to-cyan-400 bg-clip-text text-transparent">
              Dream Job?
            </span>
          </h2>
          <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
            Join thousands of developers who are mastering DSA and landing offers at top tech companies.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/register" 
              className="group px-10 py-5 bg-gradient-to-r from-primary-500 to-cyan-500 text-white font-semibold text-lg rounded-2xl hover:shadow-2xl hover:shadow-primary-500/30 hover:scale-105 transition-all"
            >
              <span className="flex items-center justify-center gap-2">
                Get Started Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
          </div>
          <p className="text-gray-500 mt-6 text-sm">
            No credit card required • Free forever for basic features
          </p>
        </div>
      </motion.div>
    </div>
  </section>
);

// --- Footer ---
const Footer = ({ darkMode }) => (
  <footer className="py-12 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
    <div className="container mx-auto px-6">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-primary-500 to-cyan-500">
            <Code2 className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold text-gray-900 dark:text-white">DSA Tracker</span>
        </div>
        <div className="flex items-center gap-6">
          <a href="#" className="text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">About</a>
          <a href="#" className="text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">Privacy</a>
          <a href="#" className="text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">Terms</a>
        </div>
        <p className="text-gray-500 text-sm">
          © {new Date().getFullYear()} DSA Tracker. Built with ❤️
        </p>
      </div>
    </div>
  </footer>
);

// --- Main LandingPage ---
function LandingPage() {
  const { darkMode, toggleDarkMode } = useTheme();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
      <Header darkMode={darkMode} toggleDarkMode={toggleDarkMode} scrolled={scrolled} />
      <main>
        <HeroSection darkMode={darkMode} />
        <FeaturesSection darkMode={darkMode} />
        <HowItWorksSection darkMode={darkMode} />
        <TestimonialsSection />
        <CTASection darkMode={darkMode} />
      </main>
      <Footer darkMode={darkMode} />
    </div>
  );
}

export default LandingPage;
