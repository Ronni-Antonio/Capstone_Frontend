import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api',
  headers: { Accept: 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ACCESS_TOKEN');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Authentication
api.login = (data) => api.post('/auth/login', data);
api.logout = () => api.post('/auth/logout');

// Students / RFID
api.getStudents = () => api.get('/students');
api.getStudent = (id) => api.get(`/students/${id}`);
api.addStudent = (data) => api.post('/students', data);
api.updateStudent = (id, data) => api.put(`/students/${id}`, data);
api.deleteStudent = (id) => api.delete(`/students/${id}`);
api.activateStudent = (id) => api.post(`/students/${id}/activate`);
api.getActivationStatus = (id) => api.get(`/students/${id}/activate/status`);
api.cancelActivation = (id) => api.post(`/students/${id}/activate/cancel`);
api.assignCard = (data) => api.post('/students/assign-card', data);
api.identifyCard = (cardUid) => api.post('/students/identify-card', { card_uid: cardUid });
api.getActiveScanSession = () => api.get('/students/active-scan-session');
api.clearScanSession = () => api.post('/students/clear-scan-session');
api.importStudentsCsv = (file) => {
  const formData = new FormData();
  formData.append('csv_file', file);
  return api.post('/students/import-csv', formData);
};

// Recycling transactions
api.getTransactions = () => api.get('/transactions');
api.getTransaction = (id) => api.get(`/transactions/${id}`);
api.deleteTransaction = (id) => api.delete(`/transactions/${id}`);
api.startIoTTransaction = (smartBinId) =>
  api.post('/iot/transactions/start', { smart_bin_id: smartBinId });
api.addClassificationToTransaction = (transactionCode, data) =>
  api.post(`/iot/transactions/${transactionCode}/classifications`, data);
api.completeIoTTransactionWithRfid = (transactionCode, cardUid) =>
  api.post(`/iot/transactions/${transactionCode}/rfid`, { card_uid: cardUid });

// Smart bins (legacy API route is /machines)
api.getSmartBins = () => api.get('/machines');
api.getSmartBin = (id) => api.get(`/machines/${id}`);
api.addSmartBin = (data) => api.post('/machines', data);
api.updateSmartBin = (id, data) => api.put(`/machines/${id}`, data);
api.deleteSmartBin = (id) => api.delete(`/machines/${id}`);
api.getSmartBinLogs = () => api.get('/machine-logs');

// Rewards
api.getRewards = () => api.get('/rewards');
api.addReward = (data) => api.post('/rewards', data);
api.updateReward = (id, data) => api.put(`/rewards/${id}`, data);
api.deleteReward = (id) => api.delete(`/rewards/${id}`);

// Settings
api.getSettings = () => api.get('/settings');
api.updateSettings = (data) => api.put('/settings', data);

// Plastic types
api.getPlasticTypes = () => api.get('/plastictypes');
api.addPlasticType = (data) => api.post('/plastictypes', data);
api.updatePlasticType = (id, data) => api.put(`/plastictypes/${id}`, data);
api.deletePlasticType = (id) => api.delete(`/plastictypes/${id}`);

// Sections / grade levels
api.getSections = () => api.get('/sections');
api.getSectionsList = () => api.get('/sections/list');
api.getSectionsRanking = () => api.get('/sections/ranking');
api.addSection = (data) => api.post('/sections', data);
api.updateSection = (id, data) => api.put(`/sections/${id}`, data);
api.deleteSection = (id) => api.delete(`/sections/${id}`);

// Redemptions / points
api.getRedemptions = () => api.get('/redemptions');
api.addRedemption = (data) => api.post('/redemptions', data);
api.initiateRedemption = (studentId, rewardId) =>
  api.post(`/redemptions/initiate/${studentId}/${rewardId}`);
api.getRedemptionStatus = (studentId, rewardId) =>
  api.get(`/redemptions/initiate/${studentId}/${rewardId}/status`);
// The revised backend intentionally makes redemptions immutable; cancellation is local UI state only.
api.cancelRedemption = async () => ({ data: { success: true, message: 'Redemption cancelled before completion.' } });

// Notifications
api.getNotifications = () => api.get('/notifications');
api.markNotificationRead = (id) => api.put(`/notifications/${id}`, { is_read: true });
api.markAllNotificationsRead = async (notifications = []) => {
  await Promise.all(
    notifications.map((n) => api.markNotificationRead(n.notification_id || n.id))
  );
};
api.deleteNotification = (id) => api.delete(`/notifications/${id}`);

// AI / analytics
api.getAiModels = () => api.get('/ai-models');
api.getClassifications = () => api.get('/classifications');
api.getPredictions = () => api.get('/predictions');
api.getAnalyticsReports = () => api.get('/analytics-reports');

// User profile
api.getUser = (id) => api.get(`/users/${id}`);
api.updateUser = (id, data) => api.put(`/users/${id}`, data);
api.requestEmailChange = (id, email) => api.post(`/user/${id}/request-email-change`, { email });
api.verifyEmailChange = (id, data) => api.post(`/user/${id}/verify-email-change`, data);
api.changePassword = (id, data) => api.put(`/users/${id}/password`, data);

export default api;
