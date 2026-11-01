import api from './api';

export const getSolvedQuestions = () => api.get('/user/solved-questions');
export const saveSolvedQuestion = (question) => api.post('/user/solved-questions', question);
export const removeSolvedQuestion = (questionKey) =>
  api.delete(`/user/solved-questions/${encodeURIComponent(questionKey)}`);
