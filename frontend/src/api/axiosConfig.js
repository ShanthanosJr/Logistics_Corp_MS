import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8081',
});

// Add a request interceptor
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add a response interceptor to handle token expiration
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response && error.response.status === 401) {
            // Token expired or invalid, clear localStorage and redirect to login
            localStorage.removeItem('token');
            localStorage.removeItem('userId');
            localStorage.removeItem('userRole');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;