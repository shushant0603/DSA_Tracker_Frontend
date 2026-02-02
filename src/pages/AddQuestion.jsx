import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, X } from 'lucide-react';
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
  });
  const [newTag, setNewTag] = useState('');

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
      const submitData = {
        ...formData,
        timeSpent: formData.timeSpent ? parseInt(formData.timeSpent) : undefined,
        rating: formData.rating ? parseInt(formData.rating) : undefined,
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
    <div className="max-w-2xl mx-auto">
      {/* --- Heading --- */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Add New Question</h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Track your DSA progress by adding solved questions
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* --- Basic Information --- */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Basic Information
          </h3>
          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Question Title *
              </label>
              <input type="text" id="title" name="title" required value={formData.title} onChange={handleChange} className="input-field mt-1" placeholder="e.g., Two Sum"/>
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Description
              </label>
              <textarea id="description" name="description" rows={3} value={formData.description} onChange={handleChange} className="input-field mt-1" placeholder="Short notes, hints, or logic..."/>
            </div>
            <div>
              <label htmlFor="link" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Problem Link *
              </label>
              <input type="url" id="link" name="link" required value={formData.link} onChange={handleChange} className="input-field mt-1" placeholder="https://leetcode.com/problems/two-sum/"/>
            </div>
          </div>
        </div>

        {/* --- Classification --- */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Classification
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="platform" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Platform *
              </label>
              <select id="platform" name="platform" required value={formData.platform} onChange={handleChange} className="input-field mt-1">
                {platforms.map(platform => (<option key={platform} value={platform}>{platform}</option>))}
              </select>
            </div>

            <div className="col-span-1 md:col-span-2">
              <label htmlFor="topic" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
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
                className="mt-1"
                placeholder="Select or create topics..."
                styles={customSelectStyles}
                formatCreateLabel={(inputValue) => `Create new topic: "${inputValue}"`}
              />
            </div>

            <div>
              <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Difficulty *
              </label>
              <select id="difficulty" name="difficulty" required value={formData.difficulty} onChange={handleChange} className="input-field mt-1">
                {difficulties.map(d => (<option key={d} value={d}>{d}</option>))}
              </select>
            </div>
          </div>
        </div>
        
        {/* --- Additional Details and Submit Button (No changes here) --- */}
         <div className="card">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Additional Details
          </h3>
          <div className="space-y-4">
            {/* Tags, Notes, TimeSpent, Rating fields... */}
            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Tags
              </label>
              <div className="mt-1 flex flex-wrap gap-2 mb-2">
                {formData.tags.map((tag, index) => (
                  <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200">
                    {tag}
                    <button type="button" onClick={() => handleRemoveTag(tag)} className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-primary-400 hover:bg-primary-200 hover:text-primary-500 dark:hover:bg-primary-800 dark:hover:text-primary-300">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <form onSubmit={handleAddTag} className="flex gap-2">
                <input type="text" value={newTag} onChange={(e) => setNewTag(e.target.value)} className="input-field flex-1" placeholder="Add a tag..." />
                <button type="submit" className="btn-primary flex items-center">
                  <Plus className="w-4 h-4" />
                </button>
              </form>
            </div>
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Personal Notes
              </label>
              <textarea id="notes" name="notes" rows={4} value={formData.notes} onChange={handleChange} className="input-field mt-1" placeholder="Your insights, approach, or key learnings..."/>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="timeSpent" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Time Spent (minutes)
                </label>
                <input type="number" id="timeSpent" name="timeSpent" min="0" value={formData.timeSpent} onChange={handleChange} className="input-field mt-1" placeholder="e.g., 45"/>
              </div>
              <div>
                <label htmlFor="rating" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Rating (1-5)
                </label>
                <select id="rating" name="rating" value={formData.rating} onChange={handleChange} className="input-field mt-1">
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
        
        <div className="flex justify-end space-x-3">
          <button type="button" onClick={() => navigate('/questions')} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="btn-primary flex items-center">
            {loading ? (<><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>Adding...</>) : (<><Plus className="w-4 h-4 mr-2" />Add Question</>)}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddQuestion;