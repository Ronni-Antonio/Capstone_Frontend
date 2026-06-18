import axios from 'axios';

const api = axios.create({
    baseURL: 'http://127.0.0.1:8000/api',
});

// User authentication
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('ACCESS_TOKEN');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Student API methods
api.getStudents = () => api.get('/students');
api.addStudent = (data) => api.post('/students', data);
api.updateStudent = (id, data) => api.put(`/students/${id}`, data);
api.deleteStudent = (id) => api.delete(`/students/${id}`);

// Bottles deposited per student API methods
api.getTransactions = (id) => api.get(`/transactions`);
api.updateTransaction = (id, data) => api.put(`/transactions/${id}`, data);

export default api;