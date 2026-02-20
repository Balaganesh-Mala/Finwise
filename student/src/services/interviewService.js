import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
    baseURL: `${API_URL}/api/voice` 
});

export const startInterview = async (studentId, name) => {
    const res = await api.post('/start-interview', { studentId, name });
    return res.data;
};

export const getHistory = async (studentId) => {
    const res = await api.get(`/history/${studentId}`);
    return res.data;
};
