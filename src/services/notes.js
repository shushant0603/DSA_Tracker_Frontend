import api from './api';

export const listNotes = (params = {}) => api.get('/notes', { params });
export const getNote = (noteId) => api.get(`/notes/${noteId}`);
export const createNote = (data = {}) => api.post('/notes', data);
export const updateNote = (noteId, data) => api.patch(`/notes/${noteId}`, data);
export const deleteNote = (noteId) => api.delete(`/notes/${noteId}`);
export const restoreNote = (noteId) => api.post(`/notes/${noteId}/restore`);
export const searchQuestions = (q) => api.get('/notes/questions/search', { params: { q } });
export const getDueNoteRevisions = () => api.get('/notes/revision/due');
export const reviewNote = (noteId, result) => api.post(`/notes/revision/${noteId}/review`, { result });
export const listFolders = () => api.get('/notes/folders');
export const createFolder = (data) => api.post('/notes/folders', data);
export const updateFolder = (folderId, data) => api.patch(`/notes/folders/${folderId}`, data);
export const deleteFolder = (folderId) => api.delete(`/notes/folders/${folderId}`);
