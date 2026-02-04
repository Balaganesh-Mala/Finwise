import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // API URL - Adjust based on your environment
    const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const API_URL = `${BASE_URL}/api/trainer`;

    useEffect(() => {
        const checkUser = async () => {
            const token = localStorage.getItem('trainerToken');
            if (token) {
                try {
                    const res = await axios.get(`${API_URL}/auth/me`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    setUser(res.data);
                } catch (error) {
                    console.error("Auth Check Failed", error);
                    localStorage.removeItem('trainerToken');
                }
            }
            setLoading(false);
        };
        checkUser();
    }, []);

    // Axios Interceptor to handle 401/403 (Forced Logout)
    useEffect(() => {
        const interceptor = axios.interceptors.response.use(
            (response) => response,
            (error) => {
                if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                    // Ignore 401 on login page itself to avoid loops (though login is POST)
                    // But for general protection:
                    if (localStorage.getItem('trainerToken')) {
                        logout();
                        window.location.href = '/login';
                    }
                }
                return Promise.reject(error);
            }
        );

        return () => {
            axios.interceptors.response.eject(interceptor);
        };
    }, []);

    const login = async (email, password) => {
        try {
            const res = await axios.post(`${API_URL}/auth/login`, { email, password });
            if (res.data.success) {
                localStorage.setItem('trainerToken', res.data.token);
                setUser(res.data);
                return { success: true };
            }
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Login failed'
            };
        }
    };

    const logout = () => {
        localStorage.removeItem('trainerToken');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading, API_URL }}>
            {children}
        </AuthContext.Provider>
    );
};
