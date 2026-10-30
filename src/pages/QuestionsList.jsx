import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  Search, 
  CheckCircle2, 
  Circle, 
  HelpCircle, 
  ExternalLink, 
  Code2, 
  ChevronDown, 
  ChevronRight, 
  ChevronLeft,
  Filter, 
  Layers, 
  GitCommit, 
  GitFork, 
  Share2, 
  Cpu, 
  Target, 
  Sparkles, 
  Check, 
  Bookmark, 
  RotateCcw,
  BookMarked,
  BarChart3,
  ArrowLeft,
  Sun,
  Moon,
  User,
  Home,
  CalendarClock,
  X
} from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { addRevision, removeQuestionRevision } from '../services/revision';

// Icon mapper for books
const getBookIcon = (iconName) => {
  switch (iconName) {
    case 'Layers': return Layers;
    case 'GitCommit': return GitCommit;
    case 'GitFork': return GitFork;
    case 'Share2': return Share2;
    case 'Cpu': return Cpu;
    case 'Target': return Target;
    case 'Search': return Search;
    default: return BookOpen;
  }
};

const QuestionsList = () => {
  const navigate = useNavigate();
  const { darkMode, toggleDarkMode } = useTheme();
  const { user } = useAuth();
  const statusStorageKey = `dsa_user_question_statuses:${user?.id || user?._id || 'anonymous'}`;

  const [books, setBooks] = useState([]);
  const [selectedBookId, setSelectedBookId] = useState('book-1');
  const [selectedChapterName, setSelectedChapterName] = useState('all');
  const [bookData, setBookData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookLoading, setBookLoading] = useState(true);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all, solved, revision, unsolved
  const [collapsedSections, setCollapsedSections] = useState({});
  const [revisionQuestion, setRevisionQuestion] = useState(null);
  const [revisionInterval, setRevisionInterval] = useState('3');
  const [revisionDate, setRevisionDate] = useState('');
  const [revisionTime, setRevisionTime] = useState('18:00');
  const [repeatRevision, setRepeatRevision] = useState(true);
  const [revisionRepeatCount, setRevisionRepeatCount] = useState('');
  const [savingRevision, setSavingRevision] = useState(false);

  const getToday = () => {
    const now = new Date();
    const offset = now.getTimezoneOffset() * 60000;
    return new Date(now.getTime() - offset).toISOString().slice(0, 10);
  };

  // Local storage for user overrides (solved, revision)
  const [userStatuses, setUserStatuses] = useState(() => {
    try {
      const saved = localStorage.getItem(statusStorageKey);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    try {
      // Remove the legacy shared key so statuses from another account cannot be reused.
      localStorage.removeItem('dsa_user_question_statuses');
      const saved = localStorage.getItem(statusStorageKey);
      setUserStatuses(saved ? JSON.parse(saved) : {});
    } catch (error) {
      console.error('Error loading user question statuses:', error);
      setUserStatuses({});
    }
  }, [statusStorageKey]);

  // Save overrides to localStorage
  const handleStatusChange = async (questionId, currentStatus, e) => {
    e.stopPropagation();
    if (currentStatus === 'solved') {
      const question = bookData?.chapters
        .flatMap((chapter) => chapter.sections.flatMap((section) => section.questions))
        .find((item) => item._serial === questionId);
      setRevisionQuestion(question);
      setRevisionInterval('3');
      setRevisionDate(getToday());
      setRevisionTime('18:00');
      setRepeatRevision(true);
      setRevisionRepeatCount('');
      return;
    }

    const nextStatus = currentStatus === 'revision' ? 'unsolved' : 'solved';
    try {
      if (currentStatus === 'revision') {
        await removeQuestionRevision(questionId);
      }
      const updated = { ...userStatuses, [questionId]: nextStatus };
      setUserStatuses(updated);
      localStorage.setItem(statusStorageKey, JSON.stringify(updated));
      window.dispatchEvent(new Event('question-status-updated'));
      toast.success(nextStatus === 'solved' ? 'Marked as Solved! 🎉' : 'Marked as Unsolved', { duration: 1500 });
      window.dispatchEvent(new Event('revision-updated'));
    } catch (error) {
      console.error('Error updating question status:', error);
      toast.error(error.response?.data?.message || 'Could not update question');
    }
  };

  const confirmRevision = async () => {
    const intervalDays = Number(revisionInterval);
    if (!revisionQuestion || !revisionDate || !revisionTime ||
      !Number.isInteger(intervalDays) || intervalDays < 1 || intervalDays > 365) {
      toast.error('Enter a valid date, time and interval');
      return;
    }
    if (repeatRevision && revisionRepeatCount &&
      (!Number.isInteger(Number(revisionRepeatCount)) ||
        Number(revisionRepeatCount) < 1 || Number(revisionRepeatCount) > 365)) {
      toast.error('Repeat count must be between 1 and 365');
      return;
    }

    try {
      setSavingRevision(true);
      await addRevision(revisionQuestion._serial, {
        intervalDays,
        preferredTime: revisionTime,
        repeatEnabled: repeatRevision,
        repeatCount: repeatRevision && revisionRepeatCount ? Number(revisionRepeatCount) : null,
        nextRevisionDate: new Date(`${revisionDate}T${revisionTime}`).toISOString()
      });
      const updated = { ...userStatuses, [revisionQuestion._serial]: 'revision' };
      setUserStatuses(updated);
      localStorage.setItem(statusStorageKey, JSON.stringify(updated));
      window.dispatchEvent(new Event('question-status-updated'));
      window.dispatchEvent(new Event('revision-updated'));
      setRevisionQuestion(null);
      toast('Added to revision schedule 🧐', { icon: '🧐', duration: 1800 });
    } catch (error) {
      console.error('Error saving revision:', error);
      toast.error(error.response?.data?.message || 'Could not save revision');
    } finally {
      setSavingRevision(false);
    }
  };

  // Fetch all books metadata
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true);
        const res = await api.get('/questions/books');
        setBooks(res.data || []);
        if (res.data && res.data.length > 0 && !selectedBookId) {
          setSelectedBookId(res.data[0].id);
        }
      } catch (err) {
        console.error('Error fetching books:', err);
        toast.error('Failed to load books list');
      } finally {
        setLoading(false);
      }
    };
    fetchBooks();
  }, []);

  // Fetch selected book hierarchy data
  useEffect(() => {
    if (!selectedBookId) return;
    const fetchBookHierarchy = async () => {
      try {
        setBookLoading(true);
        const res = await api.get(`/questions/book/${selectedBookId}`);
        setBookData(res.data);
        setSelectedChapterName('all');
        setCollapsedSections({});
      } catch (err) {
        console.error('Error fetching book data:', err);
        toast.error('Failed to load book content');
      } finally {
        setBookLoading(false);
      }
    };
    fetchBookHierarchy();
  }, [selectedBookId]);

  // Compute live question status
  const getQuestionStatus = (q) => {
    if (userStatuses[q._serial] !== undefined) return userStatuses[q._serial];
    if (userStatuses[`${selectedBookId}-${q.id}`] !== undefined) return userStatuses[`${selectedBookId}-${q.id}`];
    return 'unsolved';
  };

  // Toggle section collapse
  const toggleSection = (sectionName) => {
    setCollapsedSections(prev => ({
      ...prev,
      [sectionName]: !prev[sectionName]
    }));
  };

  const expandAllSections = () => setCollapsedSections({});
  const collapseAllSections = () => {
    if (!bookData) return;
    const allSecs = {};
    bookData.chapters.forEach(ch => {
      ch.sections.forEach(sec => {
        allSecs[sec.name] = true;
      });
    });
    setCollapsedSections(allSecs);
  };

  // Active book info
  const activeBookMeta = useMemo(() => {
    return books.find(b => b.id === selectedBookId) || bookData?.book || {};
  }, [books, selectedBookId, bookData]);

  // Filtered Chapters & Sections
  const filteredChapters = useMemo(() => {
    if (!bookData || !bookData.chapters) return [];

    return bookData.chapters
      .filter(ch => selectedChapterName === 'all' || ch.name === selectedChapterName)
      .map(ch => {
        const filteredSections = ch.sections.map(sec => {
          const filteredQuestions = sec.questions.filter(q => {
            const status = getQuestionStatus(q);
            
            // Status filter
            if (statusFilter === 'solved' && status !== 'solved') return false;
            if (statusFilter === 'revision' && status !== 'revision') return false;
            if (statusFilter === 'unsolved' && status !== 'unsolved') return false;

            // Search query
            if (searchQuery.trim()) {
              const query = searchQuery.toLowerCase().trim();
              const matchTitle = q.title.toLowerCase().includes(query);
              const matchId = String(q.id).includes(query);
              const matchSection = q.section.toLowerCase().includes(query);
              const matchNote = q.note ? q.note.toLowerCase().includes(query) : false;
              if (!matchTitle && !matchId && !matchSection && !matchNote) return false;
            }

            return true;
          });

          const solvedCount = filteredQuestions.filter(q => getQuestionStatus(q) === 'solved').length;

          return {
            ...sec,
            questions: filteredQuestions,
            filteredTotal: filteredQuestions.length,
            filteredSolved: solvedCount
          };
        }).filter(sec => sec.questions.length > 0);

        const totalQ = filteredSections.reduce((acc, s) => acc + s.questions.length, 0);
        const solvedQ = filteredSections.reduce((acc, s) => acc + s.filteredSolved, 0);

        return {
          ...ch,
          sections: filteredSections,
          filteredTotal: totalQ,
          filteredSolved: solvedQ
        };
      }).filter(ch => ch.sections.length > 0);
  }, [bookData, selectedChapterName, statusFilter, searchQuery, userStatuses]);

  // Overall book live statistics
  const currentBookStats = useMemo(() => {
    if (!bookData || !bookData.chapters) return { total: 0, solved: 0, revision: 0, percent: 0 };
    let total = 0;
    let solved = 0;
    let revision = 0;

    bookData.chapters.forEach(ch => {
      ch.sections.forEach(sec => {
        sec.questions.forEach(q => {
          total++;
          const st = getQuestionStatus(q);
          if (st === 'solved') solved++;
          if (st === 'revision') revision++;
        });
      });
    });

    const percent = total > 0 ? Math.round((solved / total) * 100) : 0;
    return { total, solved, revision, percent };
  }, [bookData, userStatuses]);

  // Navigation handlers for chapters
  const currentChapterIndex = useMemo(() => {
    if (!bookData || selectedChapterName === 'all') return -1;
    return bookData.chapters.findIndex(c => c.name === selectedChapterName);
  }, [bookData, selectedChapterName]);

  const goToPrevChapter = () => {
    if (!bookData || currentChapterIndex <= 0) return;
    setSelectedChapterName(bookData.chapters[currentChapterIndex - 1].name);
    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  const goToNextChapter = () => {
    if (!bookData || currentChapterIndex >= bookData.chapters.length - 1) return;
    setSelectedChapterName(bookData.chapters[currentChapterIndex + 1].name);
    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="questions-page min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 dark:text-gray-400 font-medium">Loading DSA Books...</p>
        </div>

      </div>
    );
  }

  return (
    <div className="questions-page min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex flex-col">
      
      {/* 🌟 TOP NAVIGATION BAR (LIKE PLAYGROUND) */}
      <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40 px-4 flex items-center justify-between shadow-sm">
        {/* Left: Back button + Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (window.history.length > 2) {
                navigate(-1);
              } else {
                navigate('/app/dashboard');
              }
            }}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-gray-700 dark:text-gray-200 hover:text-white hover:bg-violet-600 dark:hover:bg-violet-600 bg-gray-100 dark:bg-gray-700/80 border border-gray-200 dark:border-gray-600 rounded-xl transition-all shadow-sm group"
            title="Go Back"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Back</span>
          </button>

          <div className="h-6 w-px bg-gray-200 dark:bg-gray-700" />

          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-primary-600 text-white shadow-sm">
              <BookMarked className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-black tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
                DSA Practice Books
                <span className="hidden md:inline text-[10px] px-2 py-0.5 rounded-full bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 font-bold uppercase tracking-wider">
                  Interactive Reader
                </span>
              </h1>
            </div>
          </div>
        </div>

        {/* Right: Actions (Theme Toggle, Profile) */}
        <div className="flex items-center gap-2.5">
          {/* Dark / Light Mode */}
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-xl text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Profile Shortcut */}
          <button
            onClick={() => navigate('/app/profile')}
            className="p-1.5 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-violet-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 transition-all flex items-center gap-1.5"
            title="Profile & Settings"
          >
            <div className="w-6 h-6 rounded-lg bg-primary-600 flex items-center justify-center text-white text-xs font-bold">
              {user?.name ? user.name[0].toUpperCase() : <User className="w-3.5 h-3.5" />}
            </div>
          </button>
        </div>
      </header>

      {/* 📚 SUB-HEADER: BOOK SELECTOR CAROUSEL */}
      <div className="bg-white/80 dark:bg-gray-800/80 border-b border-gray-200 dark:border-gray-700 px-4 py-3 backdrop-blur-md sticky top-16 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* Books List (Horizontal Scroll) */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 flex-1">
            {books.map((b) => {
              const isSelected = selectedBookId === b.id;
              const IconComponent = getBookIcon(b.icon);

              return (
                <button
                  key={b.id}
                  onClick={() => setSelectedBookId(b.id)}
                  className={`flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl border text-left transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? 'bg-primary-600 text-white border-primary-600 shadow-md scale-[1.02]'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-violet-400 dark:hover:border-violet-500 hover:bg-violet-50/50 dark:hover:bg-violet-950/20'
                  }`}
                >
                  <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-white/20 text-white' : 'bg-gray-100 dark:bg-gray-700 text-violet-600 dark:text-violet-400'}`}>
                    <IconComponent className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold whitespace-nowrap">
                        {b.shortTitle || b.name}
                      </span>
                    </div>
                    <div className={`text-[9px] font-medium flex items-center gap-1.5 ${isSelected ? 'text-violet-100' : 'text-gray-400 dark:text-gray-500'}`}>
                      <span>{b.chaptersCount} Ch</span>
                      <span>•</span>
                      <span>{b.totalQuestions} Qs</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Quick Progress Badge */}
          <div className="hidden lg:flex items-center gap-3 bg-gray-50 dark:bg-gray-700/50 px-3.5 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 flex-shrink-0">
            <div className="text-right">
              <span className="text-[10px] text-gray-500 dark:text-gray-400 block">Progress</span>
              <p className="text-xs font-bold text-gray-900 dark:text-white">
                {currentBookStats.solved} <span className="text-[10px] font-normal text-gray-400">/ {currentBookStats.total}</span>
              </p>
            </div>
            <div className="w-8 h-8 flex items-center justify-center rounded-full bg-violet-600/10 dark:bg-violet-400/10 border-2 border-violet-500 text-violet-600 dark:text-violet-400 font-black text-[10px]">
              {currentBookStats.percent}%
            </div>
          </div>
        </div>
      </div>

      {/* 📖 MAIN BOOK BODY */}
      <div className="max-w-7xl mx-auto px-4 py-6 flex-1 w-full">
        
        {/* Book Hero Card */}
        {activeBookMeta && (
          <div className="mb-6 p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-gray-900 via-gray-800 to-indigo-950 text-white shadow-xl relative overflow-hidden border border-gray-700">
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 rounded-full bg-violet-600/20 blur-3xl pointer-events-none"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/20 border border-violet-400/30 text-violet-300 text-xs font-semibold mb-3">
                  <Sparkles className="w-3.5 h-3.5" /> Complete Practice Book
                </div>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-white mb-2">
                  {activeBookMeta.name || activeBookMeta.shortTitle}
                </h2>
                <p className="text-gray-300 text-xs sm:text-sm leading-relaxed">
                  {activeBookMeta.description || 'Master all algorithmic patterns and problem archetypes in this volume.'}
                </p>
              </div>

              {/* Progress Bar & Quick Stats */}
              <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/10 flex flex-col gap-3 min-w-[260px]">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-300 font-medium">Volume Mastery</span>
                  <span className="font-bold text-violet-300">{currentBookStats.percent}% Completed</span>
                </div>
                <div className="w-full bg-gray-700/60 rounded-full h-2.5 overflow-hidden">
                  <div 
                    className="bg-primary-400 h-full rounded-full transition-all duration-500" 
                    style={{ width: `${currentBookStats.percent}%` }}
                  />
                </div>
                <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                  <div className="bg-white/5 rounded-lg py-1 px-2">
                    <p className="text-[10px] text-gray-400">Total</p>
                    <p className="text-sm font-bold text-white">{currentBookStats.total}</p>
                  </div>
                  <div className="bg-emerald-500/20 rounded-lg py-1 px-2 border border-emerald-500/30">
                    <p className="text-[10px] text-emerald-300">Solved</p>
                    <p className="text-sm font-bold text-emerald-300">{currentBookStats.solved}</p>
                  </div>
                  <div className="bg-amber-500/20 rounded-lg py-1 px-2 border border-amber-500/30">
                    <p className="text-[10px] text-amber-300">Revision</p>
                    <p className="text-sm font-bold text-amber-300">{currentBookStats.revision}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 📑 TWO-COLUMN LAYOUT: Chapter Sidebar & Question Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* 👈 LEFT SIDEBAR: CHAPTERS / TOC */}
          <div className="lg:col-span-3 space-y-4 lg:sticky lg:top-40">
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-700 mb-3">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  <BookOpen className="w-4 h-4 text-violet-600" />
                  Table of Contents
                </div>
                <span className="text-[11px] font-semibold text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/30 px-2 py-0.5 rounded-full">
                  {bookData?.chapters?.length || 0} Chapters
                </span>
              </div>

              {/* All Chapters option */}
              <button
                onClick={() => setSelectedChapterName('all')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-xs font-semibold transition-all mb-1 ${
                  selectedChapterName === 'all'
                    ? 'bg-violet-600 text-white shadow-md shadow-violet-500/20'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/60'
                }`}
              >
                <span>📖 All Chapters (Full Book)</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${selectedChapterName === 'all' ? 'bg-white/20 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'}`}>
                  {currentBookStats.total}
                </span>
              </button>

              {/* Chapters list */}
              <div className="space-y-1 max-h-[60vh] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-700">
                {bookData?.chapters?.map((ch, idx) => {
                  const isSelected = selectedChapterName === ch.name;
                  const chapterSolved = ch.sections.reduce((acc, s) => {
                    return acc + s.questions.filter(q => getQuestionStatus(q) === 'solved').length;
                  }, 0);
                  const isCompleted = chapterSolved === ch.total && ch.total > 0;

                  return (
                    <button
                      key={ch.name}
                      onClick={() => setSelectedChapterName(ch.name)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-xs transition-all ${
                        isSelected
                          ? 'bg-violet-600 text-white font-bold shadow-md shadow-violet-500/20'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/60 font-medium'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className={`w-5 h-5 flex-shrink-0 flex items-center justify-center rounded-md text-[10px] font-bold ${
                          isSelected ? 'bg-white/20 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                        }`}>
                          {idx + 1}
                        </span>
                        <span className="truncate">{ch.name}</span>
                      </div>
                      
                      <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                        {isCompleted ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-md ${
                            isSelected ? 'bg-white/20 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                          }`}>
                            {chapterSolved}/{ch.total}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 👉 RIGHT MAIN AREA: SECTIONS & QUESTIONS */}
          <div className="lg:col-span-9 space-y-4">
            
            {/* Search & Filter Toolbar */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-3.5 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
              
              {/* Search input */}
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search problem, ID, or pattern..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                )}
              </div>

              {/* Status Filter Tabs */}
              <div className="flex items-center gap-1 w-full sm:w-auto overflow-x-auto">
                {[
                  { id: 'all', label: 'All' },
                  { id: 'solved', label: '✅ Solved' },
                  { id: 'revision', label: '🧐 Revision' },
                  { id: 'unsolved', label: '⬜ Unsolved' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setStatusFilter(tab.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                      statusFilter === tab.id
                        ? 'bg-violet-600 text-white shadow-sm'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Expand / Collapse all */}
              <div className="hidden sm:flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                <button
                  onClick={expandAllSections}
                  className="px-2.5 py-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  title="Expand all sections"
                >
                  Expand All
                </button>
                <span>•</span>
                <button
                  onClick={collapseAllSections}
                  className="px-2.5 py-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  title="Collapse all sections"
                >
                  Collapse All
                </button>
              </div>
            </div>

            {/* Questions Loader */}
            {bookLoading ? (
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-16 text-center">
                <div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-gray-500 text-sm">Organizing chapters and problem patterns...</p>
              </div>
            ) : filteredChapters.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-16 text-center">
                <BookOpen className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <h3 className="text-base font-bold text-gray-700 dark:text-gray-300 mb-1">No matching problems found</h3>
                <p className="text-xs text-gray-400 mb-4">Try clearing your search query or status filter.</p>
                <button
                  onClick={() => { setSearchQuery(''); setStatusFilter('all'); setSelectedChapterName('all'); }}
                  className="px-4 py-2 rounded-xl bg-violet-600 text-white text-xs font-semibold hover:bg-violet-700 transition-colors"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              /* CHAPTERS RENDER */
              <div className="space-y-6">
                {filteredChapters.map((chapter) => (
                  <div key={chapter.name} className="space-y-3">
                    
                    {/* Chapter Title Bar */}
                    <div className="flex items-center justify-between px-1">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-5 rounded-full bg-violet-600"></span>
                        <h3 className="text-base font-black text-gray-900 dark:text-white tracking-tight">
                          Chapter: {chapter.name}
                        </h3>
                      </div>
                      <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                        {chapter.filteredSolved} / {chapter.filteredTotal} Solved
                      </span>
                    </div>

                    {/* Sections Accordions */}
                    <div className="space-y-3">
                      {chapter.sections.map((section) => {
                        const isCollapsed = !!collapsedSections[section.name];
                        const sectionSolved = section.questions.filter(q => getQuestionStatus(q) === 'solved').length;
                        const sectionTotal = section.questions.length;

                        return (
                          <div
                            key={section.name}
                            className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm transition-all"
                          >
                            {/* Section Header Button */}
                            <button
                              onClick={() => toggleSection(section.name)}
                              className="w-full flex items-center justify-between px-4 py-3 bg-gray-50/80 dark:bg-gray-800/80 hover:bg-violet-50/50 dark:hover:bg-violet-900/10 border-b border-gray-100 dark:border-gray-700/60 transition-colors text-left"
                            >
                              <div className="flex items-center gap-2.5">
                                <span className={`p-1 rounded-lg transition-transform ${isCollapsed ? '-rotate-90' : 'rotate-0'}`}>
                                  <ChevronDown className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                                </span>
                                <h4 className="text-xs font-bold text-gray-800 dark:text-gray-200">
                                  {section.name}
                                </h4>
                              </div>

                              <div className="flex items-center gap-3">
                                <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400">
                                  {sectionSolved} of {sectionTotal} done
                                </span>
                                <div className="w-16 bg-gray-200 dark:bg-gray-700 h-1.5 rounded-full overflow-hidden hidden sm:block">
                                  <div 
                                    className="bg-emerald-500 h-full rounded-full" 
                                    style={{ width: `${sectionTotal > 0 ? (sectionSolved / sectionTotal) * 100 : 0}%` }}
                                  />
                                </div>
                              </div>
                            </button>

                            {/* Section Question Rows */}
                            {!isCollapsed && (
                              <div className="divide-y divide-gray-100 dark:divide-gray-700/50">
                                {section.questions.map((q) => {
                                  const status = getQuestionStatus(q);
                                  const isSolved = status === 'solved';
                                  const isRevision = status === 'revision';

                                  return (
                                    <div
                                      key={q._serial}
                                      className={`flex items-center justify-between px-4 py-3 transition-colors group ${
                                        isSolved 
                                          ? 'bg-emerald-50/30 dark:bg-emerald-950/10 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20' 
                                          : isRevision 
                                            ? 'bg-amber-50/30 dark:bg-amber-950/10 hover:bg-amber-50/50 dark:hover:bg-amber-950/20'
                                            : 'hover:bg-violet-50/30 dark:hover:bg-violet-950/10'
                                      }`}
                                    >
                                      {/* Left: Status Toggle + Problem # + Title + Notes */}
                                      <div className="flex items-center gap-3 flex-1 min-w-0 pr-3">
                                        
                                        {/* Status Button */}
                                        <button
                                          onClick={(e) => handleStatusChange(q._serial, status, e)}
                                          className="p-1 rounded-lg hover:scale-110 transition-transform flex-shrink-0"
                                          title={`Current: ${status.toUpperCase()} (Click to toggle: Unsolved -> Solved -> Need Revision)`}
                                        >
                                          {isSolved ? (
                                            <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-100 dark:fill-emerald-950" />
                                          ) : isRevision ? (
                                            <span className="w-5 h-5 flex items-center justify-center text-sm">🧐</span>
                                          ) : (
                                            <Circle className="w-5 h-5 text-gray-300 dark:text-gray-600 hover:text-gray-400" />
                                          )}
                                        </button>

                                        {/* LeetCode ID Pill */}
                                        <span className="font-mono text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700/70 px-2 py-0.5 rounded-md flex-shrink-0">
                                          #{q.id}
                                        </span>

                                        {/* Title + Notes */}
                                        <div className="flex items-center gap-2 flex-wrap min-w-0">
                                          <a
                                            href={q.leetcodeUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={`text-xs font-semibold hover:underline truncate ${
                                              isSolved
                                                ? 'text-emerald-700 dark:text-emerald-300'
                                                : isRevision
                                                  ? 'text-amber-700 dark:text-amber-300'
                                                  : 'text-gray-900 dark:text-gray-100'
                                            }`}
                                          >
                                            {q.title}
                                          </a>

                                          {/* Note badge */}
                                          {q.note && (
                                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 font-medium">
                                              {q.note}
                                            </span>
                                          )}
                                        </div>
                                      </div>

                                      {/* Right: Actions (LeetCode Link) */}
                                      <div className="flex items-center gap-1 flex-shrink-0">
                                        <a
                                          href={q.leetcodeUrl}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="p-1.5 rounded-lg text-gray-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-all text-xs flex items-center gap-1 font-medium"
                                          title="Open on LeetCode"
                                        >
                                          <ExternalLink className="w-4 h-4" />
                                          <span className="hidden sm:inline">LeetCode</span>
                                        </a>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}

                {/* Chapter Navigation Pagination at bottom */}
                {selectedChapterName !== 'all' && bookData && bookData.chapters.length > 1 && (
                  <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={goToPrevChapter}
                      disabled={currentChapterIndex <= 0}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-violet-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    >
                      <ChevronLeft className="w-4 h-4" /> Previous Chapter
                    </button>

                    <button
                      onClick={() => setSelectedChapterName('all')}
                      className="text-xs text-violet-600 dark:text-violet-400 font-semibold hover:underline"
                    >
                      View All Chapters
                    </button>

                    <button
                      onClick={goToNextChapter}
                      disabled={currentChapterIndex >= bookData.chapters.length - 1}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-violet-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    >
                      Next Chapter <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      {revisionQuestion && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-gray-900/50 px-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-gray-800 p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-amber-500">
                  <CalendarClock className="w-5 h-5" />
                  <span className="text-sm font-semibold">Add to revision</span>
                </div>
                <h2 className="mt-2 text-lg font-bold text-gray-900 dark:text-white">{revisionQuestion.title}</h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Choose when you want to see this question again.
                </p>
              </div>
              <button onClick={() => setRevisionQuestion(null)} className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700" aria-label="Close revision dialog">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Next revision date
                <input
                  type="date"
                  value={revisionDate}
                  onChange={(event) => setRevisionDate(event.target.value)}
                  className="input-field mt-2"
                  required
                />
              </label>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Revision time
                <input
                  type="time"
                  value={revisionTime}
                  onChange={(event) => setRevisionTime(event.target.value)}
                  className="input-field mt-2"
                  required
                />
              </label>
            </div>

            <div className="mt-4">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Repeat after
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {[1, 3, 7, 14, 30].map((days) => (
                <button
                  key={days}
                  type="button"
                  onClick={() => setRevisionInterval(String(days))}
                  className={`rounded-xl border px-3 py-3 text-sm font-semibold transition-colors ${
                    revisionInterval === String(days)
                      ? 'border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
                      : 'border-gray-200 text-gray-600 hover:border-primary-300 dark:border-gray-700 dark:text-gray-300'
                  }`}
                >
                  {days} {days === 1 ? 'day' : 'days'}
                </button>
              ))}
              <label className="rounded-xl border border-gray-200 px-3 py-2 text-xs text-gray-500 dark:border-gray-700 dark:text-gray-400">
                Custom days
                <input
                  type="number"
                  min="1"
                  max="365"
                  value={revisionInterval}
                  onChange={(event) => setRevisionInterval(event.target.value)}
                  className="mt-1 w-full bg-transparent text-sm font-semibold text-gray-900 outline-none dark:text-white"
                />
              </label>
            </div>

            <div className="mt-5 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
              <label className="flex items-center gap-3 text-sm font-semibold text-gray-800 dark:text-gray-200">
                <input
                  type="checkbox"
                  checked={repeatRevision}
                  onChange={(event) => setRepeatRevision(event.target.checked)}
                  className="h-4 w-4 accent-primary-600"
                />
                Repeat this revision
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 ml-7">
                Turn off for a one-time revision.
              </p>
              {repeatRevision && (
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mt-4">
                  Number of repetitions
                  <input
                    type="number"
                    min="1"
                    max="365"
                    placeholder="Unlimited"
                    value={revisionRepeatCount}
                    onChange={(event) => setRevisionRepeatCount(event.target.value)}
                    className="input-field mt-2"
                  />
                  <span className="text-xs font-normal text-gray-500">
                    Leave blank for unlimited repetitions.
                  </span>
                </label>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setRevisionQuestion(null)} className="btn-secondary" disabled={savingRevision}>Cancel</button>
              <button onClick={confirmRevision} className="btn-primary" disabled={savingRevision}>
                {savingRevision ? 'Saving...' : 'Add to revision'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionsList;
