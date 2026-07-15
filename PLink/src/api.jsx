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
api.activateStudent = (id) => api.post(`/students/${id}/activate`);
api.getActivationStatus = (id) => api.get(`/students/${id}/activate/status`);
api.cancelActivation = (id) => api.post(`/students/${id}/activate/cancel`);
api.identifyCard = () => api.post('/students/identify-card');
api.getActiveScanSession = () => api.get('/students/active-scan-session');
api.clearScanSession = () => api.post('/students/clear-scan-session');
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
api.getSectionsRanking = () => api.get('/sections/ranking');
api.addSection = (data) => api.post('/sections', data);
api.updateSection = (id, data) => api.put(`/sections/${id}`, data);
api.deleteSection = (id) => api.delete(`/sections/${id}`);

//Redemptions API Methods
api.getRedemptions = () => api.get('/redemptions');
api.initiateRedemption = (studentId, rewardId) => api.post(`/redemptions/initiate/${studentId}/${rewardId}`);
api.getRedemptionStatus = (studentId, rewardId) => api.get(`/redemptions/initiate/${studentId}/${rewardId}/status`); // Assuming you add this status endpoint
api.cancelRedemption = (studentId, rewardId) => api.post(`/redemptions/initiate/${studentId}/${rewardId}/cancel`); // Optional cancel endpoint
api.addRedemption = (data) => api.post('/redemptions', data);
api.updateRedemption = (id, data) => api.put(`/redemptions/${id}`, data);
api.deleteRedemption = (id) => api.delete(`/redemptions/${id}`);

//Notifications API Methods
api.getNotifications = () => api.get('/notifications');
api.markNotificationRead = (id) => api.put(`/notifications/${id}/read`);
api.markAllNotificationsRead = () => api.put('/notifications/mark-all-read');
api.deleteNotification = (id) => api.delete(`/notifications/${id}`);

export default api;
