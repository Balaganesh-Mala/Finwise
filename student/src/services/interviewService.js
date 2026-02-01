import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
    baseURL: `${API_URL}/api/interview`
});

export const startInterview = async (studentId, interviewType, mode) => {
    const res = await api.post('/start', { studentId, interviewType, mode });
    return res.data;
};

export const submitAnswer = async (sessionId, answer) => {
    const res = await api.post('/evaluate', { sessionId, answer });
    return res.data;
};

export const getNextQuestion = async (sessionId) => {
    const res = await api.post('/next', { sessionId });
    return res.data;
};

export const saveInterview = async (sessionId) => {
    const res = await api.post('/save', { sessionId });
    return res.data;
};

export const getHistory = async (studentId) => {
    const res = await api.get(`/history/${studentId}`);
    return res.data;
};

export const getSessionDetails = async (sessionId) => {
    const res = await api.get(`/session/${sessionId}`);
    return res.data;
};
