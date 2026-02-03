import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, X, Link as LinkIcon, FileText, Tag, Clock, Star, Save, Loader2, ArrowLeft, RotateCcw, Calendar } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
// CHANGE 1: 'Select' ko 'CreatableSelect' se badal diya gaya hai
import CreatableSelect from 'react-select/creatable';

const AddQuestion = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    link: '',
    platform: 'LeetCode',
    topic: [],
    difficulty: 'Medium',
    tags: [],
    notes: '',
    timeSpent: '',
    rating: '',
    revisionSchedule: {
      enabled: false,
      intervalDays: 3,
    }
  });
  const [newTag, setNewTag] = useState('');

  const revisionIntervals = [
    { value: 1, label: 'Every day' },
    { value: 2, label: 'Every 2 days' },
    { value: 3, label: 'Every 3 days' },
    { value: 5, label: 'Every 5 days' },
    { value: 7, label: 'Every week' },
    { value: 14, label: 'Every 2 weeks' },
    { value: 30, label: 'Every month' },
  ];

  const platforms = [
    'LeetCode', 'Codeforces', 'GeeksforGeeks', 'HackerRank', 'CodeChef', 'AtCoder', 'Other'
  ];

  const topics = [
    'Array', 'String', 'Hash Table', 'Dynamic Programming', 'Math', 'Sorting',
    'Greedy', 'Depth-First Search', 'Breadth-First Search', 'Tree', 'Binary Search',
    'Matrix', 'Two Pointers', 'Bit Manipulation', 'Stack', 'Heap', 'Graph',
    'Design', 'Backtracking', 'Sliding Window', 'Union Find', 'Trie', 'Recursion',
    'Binary Tree', 'Binary Search Tree', 'Linked List', 'Queue', 'Other'
  ];

  const topicOptions = topics.map(topic => ({
    value: topic,
    label: topic,
  }));

  const difficulties = ['Easy', 'Medium', 'Hard'];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleTopicChange = (selectedOptions) => {
    // Extract values from selected options and update formData
    const selectedTopics = selectedOptions.map(option => option.value);
    setFormData(prevFormData => ({
      ...prevFormData,
      topic: selectedTopics,
    }));
  };

  const handleAddTag = (e) => {
    e.preventDefault();
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, newTag.trim()],
      });
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.topic.length === 0) {
      toast.error('Please select at least one topic.');
      return;
    }
    setLoading(true);
    try {
      // Prepare revision schedule with next revision date if enabled
      let revisionScheduleData = { ...formData.revisionSchedule };
      if (revisionScheduleData.enabled) {
        const nextDate = new Date();
        nextDate.setDate(nextDate.getDate() + revisionScheduleData.intervalDays);
        revisionScheduleData.nextRevisionDate = nextDate;
      }

      const submitData = {
        ...formData,
        timeSpent: formData.timeSpent ? parseInt(formData.timeSpent) : undefined,
        rating: formData.rating ? parseInt(formData.rating) : undefined,
        revisionSchedule: revisionScheduleData,
      };
     // Send the data to the backend and log the response
     const response = await api.post('/questions', submitData);
     console.log('Backend Response:', response.data); // Log the backend response
 
      toast.success('Question added successfully!');
      navigate('/app/questions');
    } catch (error)      {
      toast.error(error.response?.data?.message || 'Failed to add question');
      console.error('Error adding question:', error);
    } finally {
      setLoading(false);
    }
  };
  
// FINAL AND CORRECT STYLES
const customSelectStyles = {
  control: (provided) => ({
    ...provided,
    backgroundColor: 'var(--input-bg)',
    borderColor: 'var(--input-border)',
    color: 'var(--text-primary)',
    minHeight: '42px', // Box ki kam se kam height taaki chhota na lage
  }),
  menu: (provided) => ({
    ...provided,
    backgroundColor: 'var(--card-bg)',
    maxHeight: '90px',
    overflowY:"auto", // Aap is height ko 150px ya 250px bhi kar sakte hain
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isFocused ? 'var(--primary-hover)' : 'var(--card-bg)',
    color: 'var(--text-primary)',
  }),
  multiValue: (provided) => ({
    ...provided,
    backgroundColor: 'var(--primary-bg)',
  }),
  multiValueLabel: (provided) => ({
    ...provided,
    color: 'var(--primary-text)',
  }),
  // ==========================================================
  // YEH FINAL AUR SAHI SOLUTION HAI
  // Yahi hissa selected items ko scrollable banayega
  // ==========================================================
  valueContainer: (provided, state) => ({
    ...provided,
    maxHeight: '80px',  // Sirf selected items ke area ki max height
    overflowY: 'auto',  // Aur sirf is area ko scrollable banayega
    paddingTop: '2px',
    paddingBottom: '2px',
  }),
  // ==========================================================
};

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      {/* --- Heading --- */}
      <div className="mb-8">
        <button 
          onClick={() => navigate('/app/questions')}
          className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to questions
        </button>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Add New Question</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Track your DSA progress by adding solved questions
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* --- Basic Information --- */}
        <div className="card">
          <h3 className="section-title mb-6">
            <FileText className="w-5 h-5 text-primary-500" />
            Basic Information
          </h3>
          <div className="space-y-5">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Question Title *
              </label>
              <input type="text" id="title" name="title" required value={formData.title} onChange={handleChange} className="input-field" placeholder="e.g., Two Sum"/>
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea id="description" name="description" rows={3} value={formData.description} onChange={handleChange} className="input-field" placeholder="Short notes, hints, or logic..."/>
            </div>
            <div>
              <label htmlFor="link" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <div className="flex items-center gap-2">
                  <LinkIcon className="w-4 h-4" />
                  Problem Link *
                </div>
              </label>
              <input type="url" id="link" name="link" required value={formData.link} onChange={handleChange} className="input-field" placeholder="https://leetcode.com/problems/two-sum/"/>
            </div>
          </div>
        </div>

        {/* --- Classification --- */}
        <div className="card">
          <h3 className="section-title mb-6">
            <Tag className="w-5 h-5 text-primary-500" />
            Classification
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label htmlFor="platform" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Platform *
              </label>
              <select id="platform" name="platform" required value={formData.platform} onChange={handleChange} className="input-field">
                {platforms.map(platform => (<option key={platform} value={platform}>{platform}</option>))}
              </select>
            </div>

            <div className="col-span-1 md:col-span-2">
              <label htmlFor="topic" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Topic(s) *
              </label>
              {/* CHANGE 3: <Select> ko <CreatableSelect> se replace kiya gaya hai */}
              <CreatableSelect
                id="topic"
                isMulti
                isClearable
                name="topic"
                options={topicOptions}
                value={topicOptions.filter(option => formData.topic.includes(option.value))}
                onChange={handleTopicChange}
                placeholder="Select or create topics..."
                styles={customSelectStyles}
                formatCreateLabel={(inputValue) => `Create new topic: "${inputValue}"`}
              />
            </div>

            <div>
              <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Difficulty *
              </label>
              <div className="flex gap-2 mt-1">
                {difficulties.map(d => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setFormData({...formData, difficulty: d})}
                    className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-medium border-2 transition-all ${
                      formData.difficulty === d
                        ? d === 'Easy' 
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-700 dark:bg-emerald-900/30 dark:border-emerald-500 dark:text-emerald-300'
                          : d === 'Medium'
                          ? 'bg-amber-50 border-amber-500 text-amber-700 dark:bg-amber-900/30 dark:border-amber-500 dark:text-amber-300'
                          : 'bg-red-50 border-red-500 text-red-700 dark:bg-red-900/30 dark:border-red-500 dark:text-red-300'
                        : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-gray-300 dark:bg-gray-700/50 dark:border-gray-600 dark:text-gray-400 dark:hover:border-gray-500'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* --- Additional Details and Submit Button (No changes here) --- */}
         <div className="card">
          <h3 className="section-title mb-6">
            <Star className="w-5 h-5 text-primary-500" />
            Additional Details
          </h3>
          <div className="space-y-5">
            {/* Tags, Notes, TimeSpent, Rating fields... */}
            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Custom Tags
              </label>
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {formData.tags.map((tag, index) => (
                    <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300 border border-primary-200 dark:border-primary-700">
                      {tag}
                      <button type="button" onClick={() => handleRemoveTag(tag)} className="ml-2 inline-flex items-center justify-center w-4 h-4 rounded-full text-primary-500 hover:bg-primary-200 hover:text-primary-700 dark:hover:bg-primary-800 dark:hover:text-primary-300 transition-colors">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <form onSubmit={handleAddTag} className="flex gap-2">
                <input type="text" value={newTag} onChange={(e) => setNewTag(e.target.value)} className="input-field flex-1" placeholder="Add a custom tag..." />
                <button type="submit" className="btn-secondary px-4">
                  <Plus className="w-4 h-4" />
                </button>
              </form>
            </div>
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Personal Notes
              </label>
              <textarea id="notes" name="notes" rows={4} value={formData.notes} onChange={handleChange} className="input-field" placeholder="Your insights, approach, or key learnings..."/>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label htmlFor="timeSpent" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Time Spent (minutes)
                  </div>
                </label>
                <input type="number" id="timeSpent" name="timeSpent" min="0" value={formData.timeSpent} onChange={handleChange} className="input-field" placeholder="e.g., 45"/>
              </div>
              <div>
                <label htmlFor="rating" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4" />
                    Difficulty Rating
                  </div>
                </label>
                <select id="rating" name="rating" value={formData.rating} onChange={handleChange} className="input-field">
                  <option value="">Select rating</option>
                  <option value="1">1 - Very Easy</option>
                  <option value="2">2 - Easy</option>
                  <option value="3">3 - Medium</option>
                  <option value="4">4 - Hard</option>
                  <option value="5">5 - Very Hard</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* --- Revision Schedule --- */}
        <div className="card">
          <h3 className="section-title mb-6">
            <RotateCcw className="w-5 h-5 text-primary-500" />
            Revision Schedule
          </h3>
          <div className="space-y-5">
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">
                  Enable Scheduled Revision
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                  Automatically remind you to revise this question at regular intervals
                </p>
              </div>
              <button
                type="button"
                onClick={() => setFormData(prev => ({
                  ...prev,
                  revisionSchedule: {
                    ...prev.revisionSchedule,
                    enabled: !prev.revisionSchedule.enabled
                  }
                }))}
                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                  formData.revisionSchedule.enabled ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform ${
                    formData.revisionSchedule.enabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {formData.revisionSchedule.enabled && (
              <div className="animate-fade-in">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Revision Interval
                  </div>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {revisionIntervals.map(interval => (
                    <button
                      key={interval.value}
                      type="button"
                      onClick={() => setFormData(prev => ({
                        ...prev,
                        revisionSchedule: {
                          ...prev.revisionSchedule,
                          intervalDays: interval.value
                        }
                      }))}
                      className={`py-2.5 px-3 rounded-xl text-sm font-medium border-2 transition-all ${
                        formData.revisionSchedule.intervalDays === interval.value
                          ? 'bg-primary-50 border-primary-500 text-primary-700 dark:bg-primary-900/30 dark:border-primary-500 dark:text-primary-300'
                          : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-gray-300 dark:bg-gray-700/50 dark:border-gray-600 dark:text-gray-400 dark:hover:border-gray-500'
                      }`}
                    >
                      {interval.label}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                  📅 First revision will appear in <span className="font-semibold text-primary-600 dark:text-primary-400">{formData.revisionSchedule.intervalDays} day{formData.revisionSchedule.intervalDays > 1 ? 's' : ''}</span>
                </p>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex justify-end gap-3 pb-8">
          <button type="button" onClick={() => navigate('/app/questions')} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
            {loading ? (<><Loader2 className="w-4 h-4 animate-spin" />Adding...</>) : (<><Save className="w-4 h-4" />Add Question</>)}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddQuestion;