import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api`,
    headers: { 'Content-Type': 'application/json' },
});

axiosInstance.interceptors.request.use((config) => {
    const token = sessionStorage.getItem('token');
    if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Don't wipe state or redirect — let the app show a re-login modal instead
            window.dispatchEvent(new CustomEvent('session-expired'));
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;