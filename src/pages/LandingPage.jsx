import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';
import { Link } from "react-router-dom";

// --- Icons ---
const BrainCircuitIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 5V3" />
    <path d="M12 13v-2" />
    <path d="M9 8a2.5 2.5 0 0 1 5 0" />
    <path d="M5.5 12a2.5 2.5 0 0 0 0 5" />
    <path d="M18.5 12a2.5 2.5 0 0 1 0 5" />
    <path d="M12 21v-2" />
    <path d="M20 9a2 2 0 0 0-2-2h-2" />
    <path d="M4 7h2a2 2 0 0 0 2-2" />
    <path d="M4 17h2a2 2 0 0 1 2 2" />
    <path d="M20 15a2 2 0 0 1-2 2h-2" />
  </svg>
);

const ClipboardListIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    <path d="M12 11h4" />
    <path d="M12 16h4" />
    <path d="M8 11h.01" />
    <path d="M8 16h.01" />
  </svg>
);

const TargetIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </svg>
);

// --- Header ---
const Header = ({ darkMode }) => {
  return (
    <motion.header 
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'} sticky top-0 z-50 backdrop-blur-sm`}
    >
      <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
        <div className="text-2xl font-bold text-cyan-400">
          DSA<span className={`${darkMode ? 'text-white' : 'text-gray-900'}`}>Cracker</span>
        </div>
        <div className="hidden md:flex items-center space-x-6">
          <a href="#features" className="hover:text-cyan-400 transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-cyan-400 transition-colors">How It Works</a>
          <a href="#pricing" className="hover:text-cyan-400 transition-colors">Pricing</a>
        </div>
      </nav>
      
    </motion.header>
  );
};

// --- Hero Section ---
const HeroSection = ({ darkMode }) => {
  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.3, delayChildren: 0.2 } } };
  const itemVariants = { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1, transition: { duration: 0.5 } } };

  return (
    <section className={`${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'} py-20 md:py-32`}>
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="container mx-auto px-6 text-center">
        <motion.div variants={itemVariants} className={`${darkMode ? 'bg-cyan-400/10 border-cyan-400/30' : 'bg-cyan-400/20 border-cyan-400/40'} border rounded-full px-4 py-1.5 inline-block mb-4`}>
          <p className="text-sm text-cyan-300">Unleash Your Problem-Solving Potential</p>
        </motion.div>
        <motion.h1 variants={itemVariants} className="text-4xl md:text-6xl font-extrabold leading-tight mb-4">
          Master DSA, The Smart Way.
        </motion.h1>
        <motion.p variants={itemVariants} className={`${darkMode ? 'text-gray-400' : 'text-gray-700'} text-lg md:text-xl max-w-3xl mx-auto mb-8`}>
          Your personal DSA revision hub. Store questions, get AI-powered insights, and track your progress topic-wise to crack any coding interview.
        </motion.p>
      </motion.div>
      <Link to="/login">
          <button style={{ margin: "10px", padding: "10px 20px" }}>Login</button>
        </Link>
    </section>
    
  );
};

// --- Features Section ---
const features = [
  { icon: <ClipboardListIcon className="h-10 w-10 text-cyan-400" />, title: 'Personal Question Bank', description: 'Never lose a problem again. Store and categorize every question you solve with notes, solutions, and difficulty tags.' },
  { icon: <BrainCircuitIcon className="h-10 w-10 text-cyan-400" />, title: 'AI-Powered Revision', description: 'Our AI summarizes key concepts, generates hints, and creates topic-wise revision plans to solidify your understanding.' },
  { icon: <TargetIcon className="h-10 w-10 text-cyan-400" />, title: 'Topic-wise Mastery', description: 'Track your progress across different topics. Identify your weak spots and focus your efforts where they matter most.' },
];

const FeaturesSection = ({ darkMode }) => (
  <motion.section id="features" className={`${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'} py-20`}>
    <div className="container mx-auto px-6">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold">Why Choose DSA Cracker?</h2>
        <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-2`}>Everything you need to stay ahead of the curve.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {features.map((feature, index) => (
          <motion.div key={index} className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-8 rounded-xl border transition-all duration-300 hover:border-cyan-500 hover:shadow-2xl hover:-translate-y-2`}>
            <div className="mb-4">{feature.icon}</div>
            <h3 className="text-2xl font-semibold mb-3">{feature.title}</h3>
            <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{feature.description}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </motion.section>
);

// --- How It Works Section ---
const HowItWorksSection = ({ darkMode }) => (
  <motion.section id="how-it-works" className={`${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'} py-20`}>
    <div className="container mx-auto px-6 text-center">
      <h2 className="text-3xl md:text-4xl font-bold mb-8">Get Started in 3 Simple Steps</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[1, 2, 3].map((step, index) => (
          <div key={index} className={`${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'} p-6 rounded-xl border`}>
            <div className="w-20 h-20 mx-auto rounded-full flex items-center justify-center text-3xl font-bold text-cyan-400 mb-4">{step}</div>
            <h3 className="text-xl font-semibold mb-2">{['Add a Question', 'Revise with AI', 'Track Progress'][index]}</h3>
            <p>{['Easily save any DSA problem.', 'AI assists with summaries.', 'Track skills topic-wise.'][index]}</p>
          </div>
        ))}
      </div>
    </div>
  </motion.section>
);

// --- Footer ---
const Footer = ({ darkMode }) => (
  <footer className={`${darkMode ? 'bg-gray-900 text-gray-400 border-gray-800' : 'bg-gray-50 text-gray-700 border-gray-200'} border-t py-8`}>
    <div className="container mx-auto px-6 text-center">
      <p>&copy; {new Date().getFullYear()} DSA Cracker. All rights reserved.</p>
    </div>
  </footer>
);

// --- Main LandingPage ---
function LandingPage() {
  const { darkMode, toggleDarkMode } = useTheme();

  return (
    <div className={`${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'} min-h-screen transition-colors duration-500`}>
      <Header darkMode={darkMode} />
      <main>
        <HeroSection darkMode={darkMode} />
        <FeaturesSection darkMode={darkMode} />
        <HowItWorksSection darkMode={darkMode} />
      </main>
      <Footer darkMode={darkMode} />

      {/* Dark Mode Toggle */}
      <button
        onClick={toggleDarkMode}
        className="fixed bottom-4 right-4 bg-cyan-500 hover:bg-cyan-600 text-white p-3 rounded-full shadow-lg"
      >
        {darkMode ? '☀️' : '🌙'}
      </button>
    </div>
  );
}

export default LandingPage;
