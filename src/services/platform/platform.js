import api from '../api';

// LeetCode service - fetch stats by username
export const leetcodeService = async (username) => {
  return api.get(`/leetcode/${username}`);
};

// Codeforces service - fetch stats by username
export const codeforcesService = async (username) => {
  return api.get(`/codeforce/${username}`);
};

// Save platform usernames (one-time)
export const savePlatformUsernames = async (data) => {
  return api.post('/user/platform-usernames', data);
};

// Update platform usernames
export const updatePlatformUsernames = async (data) => {
  return api.put('/user/platform-usernames', data);
};

// Get all platform stats
export const getPlatformStats = async () => {
  return api.get('/user/platform-stats');
};

// Get user profile (includes platform data status)
export const getUserProfile = async () => {
  return api.get('/user/profile');
};
