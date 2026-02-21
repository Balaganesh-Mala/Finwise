import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const BASE = `${API_URL}/api/typing`;

/**
 * Submit a completed typing result.
 * @param {Object} data - { studentId, mode, lessonTitle, wpm, accuracy, duration, correctChars, incorrectChars, errors }
 */
export const submitResult = async (data) => {
  const res = await axios.post(`${BASE}/submit`, data);
  return res.data;
};

/**
 * Get paginated typing history for a student (from TypingHistory model).
 * Returns: { sessions: [], summary: { totalSessions, avgWpm, avgAccuracy, bestWpm } }
 */
export const getHistory = async (studentId, { limit = 50, mode } = {}) => {
  const params = { limit };
  if (mode) params.mode = mode;
  const res = await axios.get(`${BASE}/sessions/${studentId}`, { params });
  return res.data;
};

/**
 * Get the last typing session + personal best for a student.
 * Returns: { last: {...}, best: {...} }
 */
export const getLastResult = async (studentId) => {
  const res = await axios.get(`${BASE}/last/${studentId}`);
  return res.data;
};

/**
 * Get the full lesson library from the server.
 * Returns: [{ id, category, title, content }, ...]
 */
export const fetchLessons = async () => {
  const res = await axios.get(`${BASE}/lessons`);
  return res.data;
};

/**
 * Get a single lesson by its id (format: "beginner-0").
 */
export const fetchLesson = async (id) => {
  const res = await axios.get(`${BASE}/lesson/${id}`);
  return res.data;
};
