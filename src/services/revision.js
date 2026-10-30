import api from './api';

export const getDueRevisions = () => api.get('/revision/due');
export const getUpcomingRevisions = () => api.get('/revision/upcoming');
export const getRevisionSummary = () => api.get('/revision/summary');
export const addRevision = (questionKey, schedule = {}) =>
  api.post(`/revision/${encodeURIComponent(questionKey)}`, schedule);
export const updateRevision = (revisionId, schedule) =>
  api.patch(`/revision/${revisionId}`, schedule);
export const reviewRevision = (revisionId, result) =>
  api.post(`/revision/${revisionId}/review`, { result });
export const removeRevision = (revisionId) => api.delete(`/revision/${revisionId}`);
export const removeQuestionRevision = (questionKey) =>
  api.delete(`/revision/question/${encodeURIComponent(questionKey)}`);
