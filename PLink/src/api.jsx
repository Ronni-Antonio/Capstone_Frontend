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
api.importStudentsCsv = (file) => {
  const formData = new FormData();
  formData.append('csv_file', file);
  return api.post('/students/import-csv', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

// Bottles deposited per student API methods
api.getTransactions = (id) => api.get(`/transactions`);
api.updateTransaction = (id, data) => api.put(`/transactions/${id}`, data);

//Rewards API Methods
api.getRewards = () => api.get('/rewards');
api.addReward = (data) => api.post('/rewards', data);
api.updateReward = (id, data) => api.put(`/rewards/${id}`, data);
api.deleteReward = (id) => api.delete(`/rewards/${id}`);

//Settings API Methods
api.getSettings = () => api.get('/settings');
api.updateSettings = (data) => api.post('/settings', data);

//Sections API Methods
api.getSections = () => api.get('/sections');
api.getSectionsList = () => api.get('/sections/list');
api.addSection = (data) => api.post('/sections', data);
api.updateSection = (id, data) => api.put(`/sections/${id}`, data);
api.deleteSection = (id) => api.delete(`/sections/${id}`);

export default api;
