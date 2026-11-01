import api from './api';

const getLocalDateKey = () => {
  const today = new Date();
  return [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, '0'),
    String(today.getDate()).padStart(2, '0'),
  ].join('-');
};

export const getProblemOfTheDay = () =>
  api.get('/questions/problem-of-the-day', { params: { date: getLocalDateKey() } });
