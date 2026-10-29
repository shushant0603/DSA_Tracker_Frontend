import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowRight, BarChart3, BookOpen, Brain, CheckCircle, ChevronRight, Code2,
  Layers, Moon, Play, Sparkles, Star, Sun, Target,
  Terminal, TrendingUp, Trophy, Users, Zap,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';

const GridBackground = () => (
  <div className="landing-grid absolute inset-0 pointer-events-none" aria-hidden="true" />
);

const Header = ({ darkMode, toggleDarkMode, scrolled }) => (
  <motion.header
    initial={{ y: -80, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    className={`landing-header fixed top-0 left-0 right-0 z-50 ${scrolled ? 'is-scrolled' : ''}`}
  >
    <nav className="container mx-auto px-6 py-4 flex items-center justify-between">
      <Link to="/" className="flex items-center gap-3" aria-label="DSA Tracker home">
        <span className="brand-mark"><Code2 className="h-5 w-5" /></span>
        <span className="text-xl font-bold tracking-tight">DSA<span className="brand-accent">Tracker</span></span>
      </Link>
      <div className="flex items-center gap-2 sm:gap-4">
        <button
          type="button"
          onClick={toggleDarkMode}
          className="theme-toggle"
          aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>
        <Link to="/login" className="nav-link hidden sm:block">Sign in</Link>
        <Link to="/register" className="button button-primary button-small">
          Get started <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </nav>
  </motion.header>
);

const HeroSection = () => {
  const [currentWord, setCurrentWord] = useState(0);
  const words = ['confidence', 'consistency', 'excellence'];

  useEffect(() => {
    const interval = setInterval(() => setCurrentWord((word) => (word + 1) % words.length), 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center pt-24 pb-16 overflow-hidden">
      <GridBackground />
      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-5xl mx-auto text-center">
          <div className="eyebrow mb-8"><Sparkles className="h-4 w-4" /> A calmer way to prepare</div>
          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            className="display-heading mb-8"
          >
            Master DSA with
            <span className="block brand-accent">
              <AnimatePresence mode="wait">
                <motion.span
                  key={words[currentWord]}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.25 }}
                  className="inline-block"
                >
                  {words[currentWord]}
                </motion.span>
              </AnimatePresence>
            </span>
          </motion.h1>
          <p className="hero-copy max-w-2xl mx-auto mb-10">
            Track your progress, organize problems by topic, connect LeetCode and GitHub,
            and build the practice habit that gets you ready for the interview.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-16">
            <Link to="/register" className="button button-primary button-large">
              Start free today <ArrowRight className="h-5 w-5" />
            </Link>
            <Link to="/login" className="button button-secondary button-large">
              <Play className="h-4 w-4" /> Watch demo
            </Link>
          </div>
          <DashboardPreview />
        </div>
      </div>
    </section>
  );
};

const DashboardPreview = () => (
  <div className="dashboard-preview mx-auto text-left">
    <div className="preview-toolbar">
      <div className="flex gap-1.5"><span /><span /><span /></div>
      <span className="preview-label">YOUR PROGRESS / THIS WEEK</span>
      <span className="preview-status"><CheckCircle className="h-3.5 w-3.5" /> On track</span>
    </div>
    <div className="grid md:grid-cols-[1.4fr_0.8fr] gap-5 p-5 md:p-7">
      <div>
        <div className="flex items-end justify-between mb-5">
          <div><p className="muted-label">Problems solved</p><p className="preview-number">128 <span>+18%</span></p></div>
          <BarChart3 className="h-5 w-5 text-accent" />
        </div>
        <div className="chart" aria-label="Weekly problems solved chart">
          {[32, 45, 37, 59, 48, 73, 63, 84, 76, 96, 86, 100].map((height, index) => (
            <span key={index} style={{ height: `${height}%` }} />
          ))}
        </div>
        <div className="flex justify-between muted-label mt-2"><span>Mon</span><span>Sun</span></div>
      </div>
      <div className="preview-side">
        <p className="muted-label mb-4">Study streak</p>
        <p className="preview-number">12 <small>days</small></p>
        <div className="streak-row">{[1, 1, 1, 1, 1, 1, 0].map((active, index) => <span className={active ? 'active' : ''} key={index} />)}</div>
        <p className="muted-label mt-5">Next revision</p>
        <p className="text-sm font-semibold mt-1">Binary Search <ChevronRight className="inline h-4 w-4 text-accent" /></p>
      </div>
    </div>
  </div>
);

const stats = [
  { icon: BookOpen, value: '10K+', label: 'Problems tracked' },
  { icon: Users, value: '500+', label: 'Active learners' },
  { icon: Trophy, value: '95%', label: 'Success rate' },
  { icon: Star, value: '4.9', label: 'User rating' },
];

const StatsRow = () => (
  <section className="border-y border-token py-8">
    <div className="container mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-5">
      {stats.map(({ icon: Icon, value, label }) => (
        <div className="stat-item" key={label}><Icon className="h-5 w-5 text-accent" /><strong>{value}</strong><span>{label}</span></div>
      ))}
    </div>
  </section>
);

const features = [
  { icon: Target, title: 'Smart question bank', description: 'Organize problems by topic, difficulty, and platform. Never lose track of what you have solved.' },
  { icon: TrendingUp, title: 'Platform integration', description: 'Connect LeetCode and GitHub to sync your stats and showcase your progress in one place.' },
  { icon: Brain, title: 'Spaced repetition', description: 'Get timely revision reminders so important concepts stay fresh when it matters.' },
  { icon: Terminal, title: 'Code playground', description: 'Write, run, and test code directly in the browser with a focused practice workflow.' },
  { icon: BarChart3, title: 'Useful analytics', description: 'See patterns in your practice and make each study session more intentional.' },
  { icon: Zap, title: 'Quick actions', description: 'Add problems in seconds with smart URL parsing and helpful auto-fill features.' },
];

const FeaturesSection = () => (
  <section className="section-space surface-section">
    <div className="container mx-auto px-6">
      <SectionIntro eyebrow="The toolkit" title={<>Everything you need to<br /><span className="brand-accent">succeed in DSA</span></>} copy="A focused set of tools designed to help you track, organize, and master data structures and algorithms." />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {features.map(({ icon: Icon, title, description }, index) => (
          <motion.article whileHover={{ y: -5 }} transition={{ duration: 0.2 }} className="feature-card" key={title}>
            <div className="feature-icon"><Icon className="h-6 w-6" /></div>
            <p className="feature-number">0{index + 1}</p>
            <h3>{title}</h3>
            <p>{description}</p>
            <span className="feature-link">Explore <ChevronRight className="h-4 w-4" /></span>
          </motion.article>
        ))}
      </div>
    </div>
  </section>
);

const SectionIntro = ({ eyebrow, title, copy }) => (
  <div className="section-intro text-center mb-14">
    <span className="eyebrow">{eyebrow}</span>
    <h2 className="section-heading">{title}</h2>
    <p>{copy}</p>
  </div>
);

const HowItWorksSection = () => {
  const steps = [
    { step: '01', title: 'Create your account', description: 'Sign up in seconds and start with a clean, focused workspace.' },
    { step: '02', title: 'Connect your platforms', description: 'Link LeetCode and GitHub to bring your practice into one view.' },
    { step: '03', title: 'Track and grow', description: 'Add problems, revise deliberately, and watch your skills compound.' },
  ];
  return (
    <section className="section-space">
      <div className="container mx-auto px-6">
        <SectionIntro eyebrow="A simple rhythm" title={<>Make progress<br /><span className="brand-accent">you can see</span></>} copy="Turn scattered practice into a repeatable routine with just three small steps." />
        <div className="steps-grid">
          {steps.map(({ step, title, description }) => (
            <div className="step-card" key={step}><span className="step-number">{step}</span><div><h3>{title}</h3><p>{description}</p></div></div>
          ))}
        </div>
      </div>
    </section>
  );
};

const TestimonialsSection = () => (
  <section className="section-space surface-section">
    <div className="container mx-auto px-6">
      <SectionIntro eyebrow="In their words" title={<>Built for the<br /><span className="brand-accent">long game</span></>} copy="A little structure makes the daily work feel lighter." />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {[
          ['AS', 'Ananya Shah', 'SDE at Google', 'The simple revision flow helped me stay consistent without feeling overwhelmed.'],
          ['PP', 'Priya Patel', 'SDE at Amazon', 'Finally, a place where my LeetCode progress and study plan live together.'],
          ['AK', 'Arjun Kumar', 'SDE at Microsoft', 'The analytics made my weak areas obvious. I knew exactly what to practice next.'],
        ].map(([avatar, name, role, content]) => (
          <article className="testimonial-card" key={name}>
            <div className="flex items-center gap-3 mb-6"><span className="avatar">{avatar}</span><div><h3>{name}</h3><p>{role}</p></div></div>
            <p className="quote">“{content}”</p>
            <div className="flex gap-1 mt-6">{[1, 2, 3, 4, 5].map((star) => <Star className="h-4 w-4 fill-current text-terracotta" key={star} />)}</div>
          </article>
        ))}
      </div>
    </div>
  </section>
);

const CTASection = () => (
  <section className="section-space">
    <div className="container mx-auto px-6">
      <div className="cta-panel">
        <div className="cta-mark"><Layers className="h-6 w-6" /></div>
        <h2>Make your next<br /><span>breakthrough</span> count.</h2>
        <p>Join learners building a steady practice habit and preparing with purpose.</p>
        <Link to="/register" className="button button-light button-large">Get started free <ArrowRight className="h-5 w-5" /></Link>
        <small>No credit card required · Free forever for basic features</small>
      </div>
    </div>
  </section>
);

const Footer = () => (
  <footer className="landing-footer">
    <div className="container mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-5">
      <Link to="/" className="flex items-center gap-2 font-bold"><span className="brand-mark small"><Code2 className="h-4 w-4" /></span>DSA Tracker</Link>
      <div className="flex gap-6 text-sm"><a href="#features">About</a><a href="#privacy">Privacy</a><a href="#terms">Terms</a></div>
      <p>© {new Date().getFullYear()} DSA Tracker</p>
    </div>
  </footer>
);

function LandingPage() {
  const { darkMode, toggleDarkMode } = useTheme();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="landing-page min-h-screen">
      <Header darkMode={darkMode} toggleDarkMode={toggleDarkMode} scrolled={scrolled} />
      <main><HeroSection /><StatsRow /><div id="features"><FeaturesSection /></div><HowItWorksSection /><TestimonialsSection /><CTASection /></main>
      <Footer />
    </div>
  );
}

export default LandingPage;
