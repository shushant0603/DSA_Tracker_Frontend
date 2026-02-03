import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Play, 
  Save, 
  Loader2, 
  ChevronLeft,
  ChevronRight,
  Check,
  Copy,
  CheckCircle,
  RotateCcw,
  Maximize2,
  Minimize2,
  Sun,
  Moon,
  Settings,
  FileCode,
  Terminal as TerminalIcon,
  Code2,
  Zap
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';

// Language configs
const LANGUAGES = {
  cpp: { name: 'C++', version: '10.2.0', ext: 'cpp', icon: '⚡' },
  python: { name: 'Python', version: '3.10.0', ext: 'py', icon: '🐍' },
  java: { name: 'Java', version: '15.0.2', ext: 'java', icon: '☕' },
  javascript: { name: 'JavaScript', version: '18.15.0', ext: 'js', icon: '💛' }
};

const TEMPLATES = {
  cpp: `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

int main() {
    cout << "Hello World!" << endl;
    return 0;
}`,
  python: `def main():
    print("Hello World!")

if __name__ == "__main__":
    main()`,
  java: `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello World!");
    }
}`,
  javascript: `function main() {
    console.log("Hello World!");
}
main();`
};

const CodePlayground = () => {
  const navigate = useNavigate();
  
  // State
  const [questions, setQuestions] = useState([]);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [code, setCode] = useState(TEMPLATES.cpp);
  const [language, setLanguage] = useState('cpp');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [copied, setCopied] = useState(false);
  const [executionTime, setExecutionTime] = useState(null);
  const [activePanel, setActivePanel] = useState('input'); // input | output
  const [theme, setTheme] = useState('dark');

  // Fetch questions
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await api.get('/questions?limit=100');
        setQuestions(res.data.questions || []);
      } catch (e) {
        toast.error('Failed to load questions');
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, []);

  // Select question
  const selectQuestion = (q) => {
    setSelectedQuestion(q);
    if (q.savedSolution?.code) {
      setCode(q.savedSolution.code);
      setLanguage(q.savedSolution.language || 'cpp');
    } else {
      setCode(TEMPLATES[language]);
    }
    setOutput('');
    setExecutionTime(null);
  };

  // Change language
  const changeLanguage = (lang) => {
    setLanguage(lang);
    if (!selectedQuestion?.savedSolution?.code) {
      setCode(TEMPLATES[lang]);
    }
  };

  // Run code
  const runCode = async () => {
    if (!code.trim()) return toast.error('Write some code first!');
    
    setIsRunning(true);
    setActivePanel('output');
    setOutput('');
    const start = Date.now();

    try {
      const res = await fetch('https://emkc.org/api/v2/piston/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language,
          version: LANGUAGES[language].version,
          files: [{ name: language === 'java' ? 'Main.java' : `main.${LANGUAGES[language].ext}`, content: code }],
          stdin: input
        })
      });
      const data = await res.json();
      setExecutionTime(Date.now() - start);
      
      if (data.run) {
        setOutput(data.run.output || data.run.stderr || 'No output');
        toast.success(data.run.stderr ? 'Compiled with errors' : 'Success!');
      } else {
        setOutput(data.message || 'Error');
        toast.error('Execution failed');
      }
    } catch (e) {
      setOutput('Error: ' + e.message);
      toast.error('Failed to run');
    } finally {
      setIsRunning(false);
    }
  };

  // Save solution
  const saveSolution = async () => {
    if (!selectedQuestion) return toast.error('Select a question first!');
    
    setIsSaving(true);
    try {
      await api.patch(`/questions/${selectedQuestion._id}/solution`, { code, language });
      setQuestions(qs => qs.map(q => 
        q._id === selectedQuestion._id 
          ? { ...q, savedSolution: { code, language, lastUpdated: new Date() } } 
          : q
      ));
      setSelectedQuestion(prev => ({ ...prev, savedSolution: { code, language } }));
      toast.success('Saved!');
    } catch (e) {
      toast.error('Failed to save');
    } finally {
      setIsSaving(false);
    }
  };

  // Copy code
  const copyCode = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') { e.preventDefault(); runCode(); }
      if ((e.metaKey || e.ctrlKey) && e.key === 's') { e.preventDefault(); saveSolution(); }
      if ((e.metaKey || e.ctrlKey) && e.key === 'b') { e.preventDefault(); setSidebarOpen(p => !p); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [code, language, selectedQuestion, input]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-[#0d1117] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-blue-500 animate-spin mx-auto" />
          <p className="text-gray-400 mt-4">Loading Playground...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-[#0d1117] flex flex-col overflow-hidden">
      {/* Top Bar */}
      <header className="h-14 bg-[#161b22] border-b border-[#30363d] flex items-center justify-between px-4 flex-shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/app/dashboard')}
            className="flex items-center gap-2 px-3 py-1.5 text-gray-400 hover:text-white hover:bg-[#30363d] rounded-lg transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back to App</span>
          </button>
          
          <div className="h-6 w-px bg-[#30363d]" />
          
          <div className="flex items-center gap-2">
            <Code2 className="w-5 h-5 text-blue-500" />
            <span className="text-white font-semibold">Code Playground</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Language Selector */}
          <div className="flex bg-[#21262d] rounded-lg p-1">
            {Object.entries(LANGUAGES).map(([key, lang]) => (
              <button
                key={key}
                onClick={() => changeLanguage(key)}
                className={`px-3 py-1.5 text-sm rounded-md transition-all ${
                  language === key 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <span className="mr-1.5">{lang.icon}</span>
                {lang.name}
              </button>
            ))}
          </div>

          <div className="h-6 w-px bg-[#30363d] mx-2" />

          {/* Actions */}
          <button
            onClick={saveSolution}
            disabled={isSaving || !selectedQuestion}
            className="flex items-center gap-2 px-4 py-1.5 bg-[#21262d] text-gray-300 hover:text-white rounded-lg transition-all disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span className="text-sm">Save</span>
          </button>

          <button
            onClick={runCode}
            disabled={isRunning}
            className="flex items-center gap-2 px-4 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all disabled:opacity-50"
          >
            {isRunning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            <span className="text-sm font-medium">Run</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Questions */}
        <aside className={`${sidebarOpen ? 'w-72' : 'w-0'} bg-[#161b22] border-r border-[#30363d] flex flex-col transition-all duration-300 overflow-hidden flex-shrink-0`}>
          <div className="p-3 border-b border-[#30363d] flex items-center justify-between">
            <span className="text-sm font-medium text-gray-300">Questions</span>
            <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">{questions.length}</span>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {questions.map(q => (
              <button
                key={q._id}
                onClick={() => selectQuestion(q)}
                className={`w-full text-left p-3 border-b border-[#30363d] transition-all ${
                  selectedQuestion?._id === q._id 
                    ? 'bg-blue-600/20 border-l-2 border-l-blue-500' 
                    : 'hover:bg-[#21262d]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-medium truncate ${selectedQuestion?._id === q._id ? 'text-blue-400' : 'text-gray-300'}`}>
                    {q.title}
                  </span>
                  {q.savedSolution?.code && (
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-xs px-1.5 py-0.5 rounded ${
                    q.difficulty === 'Easy' ? 'bg-green-500/20 text-green-400' :
                    q.difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {q.difficulty}
                  </span>
                  <span className="text-xs text-gray-500">{q.platform}</span>
                </div>
              </button>
            ))}
          </div>
        </aside>

        {/* Sidebar Toggle */}
        <button
          onClick={() => setSidebarOpen(p => !p)}
          className="w-5 bg-[#161b22] border-r border-[#30363d] flex items-center justify-center hover:bg-[#21262d] transition-colors flex-shrink-0"
        >
          {sidebarOpen ? <ChevronLeft className="w-4 h-4 text-gray-500" /> : <ChevronRight className="w-4 h-4 text-gray-500" />}
        </button>

        {/* Editor Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Question Info Bar */}
          {selectedQuestion && (
            <div className="h-10 bg-[#161b22] border-b border-[#30363d] flex items-center px-4 gap-3 flex-shrink-0">
              <FileCode className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-300 font-medium">{selectedQuestion.title}</span>
              <span className={`text-xs px-1.5 py-0.5 rounded ${
                selectedQuestion.difficulty === 'Easy' ? 'bg-green-500/20 text-green-400' :
                selectedQuestion.difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                'bg-red-500/20 text-red-400'
              }`}>
                {selectedQuestion.difficulty}
              </span>
              <a 
                href={selectedQuestion.link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-blue-400 hover:text-blue-300 ml-auto"
              >
                View Problem →
              </a>
            </div>
          )}

          {/* Code Editor */}
          <div className="flex-1 flex flex-col min-h-0">
            {/* Editor Header */}
            <div className="h-9 bg-[#21262d] border-b border-[#30363d] flex items-center px-3 gap-2 flex-shrink-0">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
                <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                <div className="w-3 h-3 rounded-full bg-[#27ca40]" />
              </div>
              <span className="text-xs text-gray-500 ml-2">
                {LANGUAGES[language].icon} main.{LANGUAGES[language].ext}
              </span>
              <div className="ml-auto flex items-center gap-2">
                <button onClick={copyCode} className="p-1 hover:bg-[#30363d] rounded transition-colors">
                  {copied ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-gray-500" />}
                </button>
                <button onClick={() => setCode(TEMPLATES[language])} className="p-1 hover:bg-[#30363d] rounded transition-colors">
                  <RotateCcw className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            </div>

            {/* Editor */}
            <div className="flex-1 min-h-0">
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full h-full p-4 bg-[#0d1117] text-gray-200 font-mono text-sm resize-none focus:outline-none leading-6"
                spellCheck={false}
                style={{ tabSize: 4 }}
              />
            </div>
          </div>

          {/* Bottom Panel - Input/Output */}
          <div className="h-48 border-t border-[#30363d] flex flex-col flex-shrink-0">
            {/* Panel Tabs */}
            <div className="h-9 bg-[#161b22] flex items-center gap-1 px-2 flex-shrink-0">
              <button
                onClick={() => setActivePanel('input')}
                className={`px-3 py-1 text-xs font-medium rounded transition-all ${
                  activePanel === 'input' ? 'bg-[#0d1117] text-white' : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                Input
              </button>
              <button
                onClick={() => setActivePanel('output')}
                className={`px-3 py-1 text-xs font-medium rounded transition-all flex items-center gap-2 ${
                  activePanel === 'output' ? 'bg-[#0d1117] text-white' : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                Output
                {executionTime && (
                  <span className="text-xs text-green-500">{executionTime}ms</span>
                )}
              </button>
            </div>

            {/* Panel Content */}
            <div className="flex-1 bg-[#0d1117] overflow-auto">
              {activePanel === 'input' ? (
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Enter input here..."
                  className="w-full h-full p-3 bg-transparent text-gray-300 font-mono text-sm resize-none focus:outline-none"
                />
              ) : (
                <pre className="p-3 text-gray-300 font-mono text-sm whitespace-pre-wrap">
                  {isRunning ? (
                    <span className="text-gray-500 flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" /> Running...
                    </span>
                  ) : output || <span className="text-gray-600">Output will appear here...</span>}
                </pre>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <footer className="h-6 bg-[#161b22] border-t border-[#30363d] flex items-center justify-between px-4 text-xs text-gray-500 flex-shrink-0">
        <div className="flex items-center gap-4">
          <span>⌘+Enter to Run</span>
          <span>⌘+S to Save</span>
          <span>⌘+B Toggle Sidebar</span>
        </div>
        <div className="flex items-center gap-4">
          <span>{LANGUAGES[language].name} v{LANGUAGES[language].version}</span>
          {selectedQuestion && <span className="text-green-500">● {selectedQuestion.title}</span>}
        </div>
      </footer>
    </div>
  );
};

export default CodePlayground;
