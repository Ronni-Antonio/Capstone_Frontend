import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api';

const DataContext = createContext();

const normalizeRewards = (rawRewards) => {
  if (!Array.isArray(rawRewards)) {
    return [];
  }

  return rawRewards.map((reward) => ({
    id: reward.reward_id || reward.id,
    name: reward.reward_name || reward.name || 'Unnamed Reward',
    points:
      Number(
        reward.points_cost ?? reward.points ?? reward.points_required ?? 0
      ) || 0,
    stock: Number(reward.stock_quantity ?? reward.stock ?? 0) || 0,
    status: reward.status || 'Active',
    createdAt: reward.created_at || reward.createdAt || null,
  }));
};

const buildStudentName = (student) => {
  if (!student) {
    return null;
  }

  if (student.name) {
    return student.name;
  }

  const fullName = [student.first_name, student.last_name]
    .filter(Boolean)
    .join(' ')
    .trim();

  return fullName || null;
};

const normalizeRedemptions = (rawRedemptions, students = [], rewards = []) => {
  if (!Array.isArray(rawRedemptions)) {
    return [];
  }

  return rawRedemptions.map((redemption) => {
    const studentId =
      redemption.student_id ??
      redemption.student?.id ??
      redemption.student?.student_id ??
      null;
    const rewardId =
      redemption.reward_id ??
      redemption.reward?.reward_id ??
      redemption.reward?.id ??
      null;

    const matchedStudent = students.find(
      (student) => (student.id || student.student_id) === studentId
    );
    const matchedReward = rewards.find((reward) => reward.id === rewardId);

    return {
      id: redemption.redemption_id || redemption.id,
      studentId,
      rewardId,
      student:
        redemption.student_name ||
        buildStudentName(redemption.student) ||
        buildStudentName(matchedStudent) ||
        'Unknown Student',
      reward:
        redemption.reward_name ||
        redemption.reward?.reward_name ||
        redemption.reward?.name ||
        matchedReward?.name ||
        'Unknown Reward',
      points:
        Number(
          redemption.points_cost ??
            redemption.points ??
            redemption.reward_points ??
            redemption.reward?.points_cost ??
            matchedReward?.points ??
            0
        ) || 0,
      date:
        redemption.redeemed_at ||
        redemption.created_at ||
        redemption.redemption_date ||
        null,
    };
  });
};

export const DataProvider = ({ children }) => {
  const [data, setData] = useState({
    students: [],
    transactions: [],
    rewards: [],
    redemptions: [],
    sections: [],
    sectionsRanking: [],
    notifications: [],
    settings: {},
    isLoading: true,
    error: null
  });
  
  // Add redemption function
  const addRedemption = async (redemptionData) => {
    try {
      // Call API to add redemption
      const response = await api.addRedemption(redemptionData);
      
      // Refresh data
      await refreshRedemptions();
      await refreshStudents();
      await refreshRewards();
      
      return response;
    } catch (error) {
      console.error('Error adding redemption:', error);
      throw error;
    }
  };

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        // Fetch core data first that's critical
        const [studentsRes, transactionsRes, rewardsRes, redemptionsRes, sectionsRes, settingsRes] = await Promise.all([
          api.getStudents().catch(() => ({ data: [] })),
          api.getTransactions().catch(() => ({ data: [] })),
          api.getRewards().catch(() => ({ data: [] })),
          api.getRedemptions().catch(() => ({ data: [] })),
          api.getSectionsList().catch(() => ({ data: [] })),
          api.getSettings().catch(() => ({ data: {} }))
        ]);

        const studentsData = Array.isArray(studentsRes.data) ? studentsRes.data : [];
        const rewardsData = normalizeRewards(
          rewardsRes.data?.rewards || rewardsRes.data?.data || rewardsRes.data || []
        );

        // Fetch optional data (with fallbacks)
        let rankingData = [];
        let notificationsData = [];
        try {
          const rankingRes = await api.getSectionsRanking();
          rankingData = Array.isArray(rankingRes.data) ? rankingRes.data : [];
        } catch (err) {
          console.log('Sections ranking API not available, using calculated ranking');
        }
        try {
          const notificationsRes = await api.getNotifications();
          notificationsData = Array.isArray(notificationsRes.data) ? notificationsRes.data : [];
        } catch (err) {
          console.log('Notifications API not available, using fallback data');
        }

        setData({
          students: studentsData,
          transactions: Array.isArray(transactionsRes.data) ? transactionsRes.data : [],
          rewards: rewardsData,
          redemptions: normalizeRedemptions(
            redemptionsRes.data?.redemptions || redemptionsRes.data?.data || redemptionsRes.data || [],
            studentsData,
            rewardsData
          ),
          sections: Array.isArray(sectionsRes.data) ? sectionsRes.data : (typeof sectionsRes.data === 'object' ? Object.values(sectionsRes.data) : []),
          sectionsRanking: rankingData,
          notifications: notificationsData,
          settings: Array.isArray(settingsRes.data) ? settingsRes.data[0] : settingsRes.data,
          isLoading: false,
          error: null
        });
      } catch (err) {
        console.error('Error fetching app data:', err);
        setData(prev => ({
          ...prev,
          isLoading: false,
          error: err.message || 'Failed to load data'
        }));
      }
    };

    fetchAllData();
  }, []);

  // Refresh all data (use sparingly)
  const refreshData = async () => {
    try {
      const [studentsRes, transactionsRes, rewardsRes, redemptionsRes, sectionsRes, rankingRes, notificationsRes, settingsRes] = await Promise.all([
        api.getStudents(),
        api.getTransactions(),
        api.getRewards(),
        api.getRedemptions(),
        api.getSectionsList(),
        api.getSectionsRanking().catch(() => ({ data: [] })),
        api.getNotifications().catch(() => ({ data: [] })),
        api.getSettings()
      ]);

      const studentsData = Array.isArray(studentsRes.data) ? studentsRes.data : [];
      const rewardsData = normalizeRewards(
        rewardsRes.data?.rewards || rewardsRes.data?.data || rewardsRes.data || []
      );

      setData(prev => ({
        ...prev,
        students: studentsData,
        transactions: Array.isArray(transactionsRes.data) ? transactionsRes.data : [],
        rewards: rewardsData,
        redemptions: normalizeRedemptions(
          redemptionsRes.data?.redemptions || redemptionsRes.data?.data || redemptionsRes.data || [],
          studentsData,
          rewardsData
        ),
        sections: Array.isArray(sectionsRes.data) ? sectionsRes.data : (typeof sectionsRes.data === 'object' ? Object.values(sectionsRes.data) : []),
        sectionsRanking: Array.isArray(rankingRes.data) ? rankingRes.data : [],
        notifications: Array.isArray(notificationsRes.data) ? notificationsRes.data : [],
        settings: Array.isArray(settingsRes.data) ? settingsRes.data[0] : settingsRes.data
      }));
    } catch (err) {
      console.error('Error refreshing app data:', err);
      throw err;
    }
  };

  // Refresh specific data parts
  const refreshStudents = async () => {
    try {
      const res = await api.getStudents();
      setData(prev => ({
        ...prev,
        students: Array.isArray(res.data) ? res.data : []
      }));
    } catch (err) {
      console.error('Error refreshing students:', err);
      throw err;
    }
  };

  const refreshTransactions = async () => {
    try {
      const res = await api.getTransactions();
      setData(prev => ({
        ...prev,
        transactions: Array.isArray(res.data) ? res.data : []
      }));
    } catch (err) {
      console.error('Error refreshing transactions:', err);
      throw err;
    }
  };

  const refreshRewards = async () => {
    try {
      const res = await api.getRewards();
      setData(prev => ({
        ...prev,
        rewards: normalizeRewards(res.data?.rewards || res.data?.data || res.data || [])
      }));
    } catch (err) {
      console.error('Error refreshing rewards:', err);
      throw err;
    }
  };

  const refreshRedemptions = async () => {
    try {
      const res = await api.getRedemptions();
      setData(prev => ({
        ...prev,
        redemptions: normalizeRedemptions(
          res.data?.redemptions || res.data?.data || res.data || [],
          prev.students,
          prev.rewards
        )
      }));
    } catch (err) {
      console.error('Error refreshing redemptions:', err);
      throw err;
    }
  };

  const refreshSections = async () => {
    try {
      const res = await api.getSectionsList();
      setData(prev => ({
        ...prev,
        sections: Array.isArray(res.data) ? res.data : (typeof res.data === 'object' ? Object.values(res.data) : [])
      }));
    } catch (err) {
      console.error('Error refreshing sections:', err);
      throw err;
    }
  };

  const refreshSectionsRanking = async () => {
    try {
      const res = await api.getSectionsRanking();
      setData(prev => ({
        ...prev,
        sectionsRanking: Array.isArray(res.data) ? res.data : []
      }));
    } catch (err) {
      console.error('Error refreshing sections ranking:', err);
      throw err;
    }
  };

  const refreshNotifications = async () => {
    try {
      const res = await api.getNotifications();
      setData(prev => ({
        ...prev,
        notifications: Array.isArray(res.data) ? res.data : []
      }));
    } catch (err) {
      console.error('Error refreshing notifications:', err);
      throw err;
    }
  };

  const refreshSettings = async () => {
    try {
      const res = await api.getSettings();
      setData(prev => ({
        ...prev,
        settings: Array.isArray(res.data) ? res.data[0] : res.data
      }));
    } catch (err) {
      console.error('Error refreshing settings:', err);
      throw err;
    }
  };

  // Notification state modifiers with API calls
  const markNotificationRead = async (notificationId) => {
    // Optimistic update
    setData(prev => ({
      ...prev,
      notifications: prev.notifications.map(n =>
        (n.id || n.notification_id) === notificationId ? { ...n, read: true } : n
      )
    }));
    try {
      await api.markNotificationRead(notificationId);
    } catch (err) {
      console.error('Error marking notification as read:', err);
      // Rollback if API call fails
      refreshNotifications();
      throw err;
    }
  };

  const markAllNotificationsRead = async () => {
    // Optimistic update
    setData(prev => ({
      ...prev,
      notifications: prev.notifications.map(n => ({ ...n, read: true }))
    }));
    try {
      await api.markAllNotificationsRead();
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
      // Rollback if API call fails
      refreshNotifications();
      throw err;
    }
  };

  const deleteNotification = async (notificationId) => {
    // Optimistic update
    setData(prev => ({
      ...prev,
      notifications: prev.notifications.filter(n =>
        (n.id || n.notification_id) !== notificationId
      )
    }));
    try {
      await api.deleteNotification(notificationId);
    } catch (err) {
      console.error('Error deleting notification:', err);
      // Rollback if API call fails
      refreshNotifications();
      throw err;
    }
  };

  // Direct state setters for optimistic updates
  const addStudent = (newStudent) => {
    setData(prev => ({
      ...prev,
      students: [...prev.students, newStudent]
    }));
  };

  const updateStudent = async (studentId, updatedData) => {
    console.log('[updateStudent] Starting update:', { studentId, updatedData });
    
    // Optimistic update
    setData(prev => {
      console.log('[updateStudent] Current students in prev:', prev.students);
      return {
        ...prev,
        students: prev.students.map(s => {
          const currentId = s.id || s.student_id;
          console.log('[updateStudent] Checking student:', { studentId, currentId, matches: currentId === studentId });
          return currentId === studentId ? { ...s, ...updatedData } : s;
        })
      };
    });
    try {
      console.log('[updateStudent] Calling API updateStudent with:', { id: studentId, data: updatedData });
      const response = await api.updateStudent(studentId, updatedData);
      console.log('[updateStudent] API response:', response);
    } catch (err) {
      console.error('[updateStudent] Error updating student:', err);
      // Rollback if API call fails
      refreshStudents();
      throw err;
    }
  };

  const activateStudent = async (studentId) => {
    console.log('[activateStudent] Starting activation for studentId:', studentId);
    
    // Optimistic update
    setData(prev => ({
      ...prev,
      students: prev.students.map(s =>
        (s.id || s.student_id) === studentId ? { ...s, status: 'Active' } : s
      )
    }));
    try {
      console.log('[activateStudent] Calling API activateStudent with id:', studentId);
      const response = await api.activateStudent(studentId);
      console.log('[activateStudent] API response:', response);
    } catch (err) {
      console.error('[activateStudent] Error activating student:', err);
      // Rollback if API call fails
      refreshStudents();
      throw err;
    }
  };

  const removeStudent = (studentId) => {
    setData(prev => ({
      ...prev,
      students: prev.students.filter(s => (s.id || s.student_id) !== studentId)
    }));
  };

  const addSection = (newSection) => {
    setData(prev => ({
      ...prev,
      sections: [...prev.sections, newSection]
    }));
  };

  const updateSection = (sectionId, updatedData) => {
    setData(prev => ({
      ...prev,
      sections: prev.sections.map(s =>
        (s.id || s.section_id || s.name) === sectionId ? { ...s, ...updatedData } : s
      )
    }));
  };

  const removeSection = (sectionId) => {
    setData(prev => ({
      ...prev,
      sections: prev.sections.filter(s => (s.id || s.section_id || s.name) !== sectionId)
    }));
  };

  const addTransaction = (newTransaction) => {
    setData(prev => ({
      ...prev,
      transactions: [...prev.transactions, newTransaction]
    }));
  };

  const updateSettings = (newSettings) => {
    setData(prev => ({
      ...prev,
      settings: { ...prev.settings, ...newSettings }
    }));
  };

  return (
    <DataContext.Provider value={{
      ...data,
      refreshData,
      refreshStudents,
      refreshTransactions,
      refreshRewards,
      refreshRedemptions,
      refreshSections,
      refreshSectionsRanking,
      refreshNotifications,
      refreshSettings,
      addStudent,
      updateStudent,
      activateStudent,
      removeStudent,
      addSection,
      updateSection,
      removeSection,
      addTransaction,
      addRedemption,
      updateSettings,
      markNotificationRead,
      markAllNotificationsRead,
      deleteNotification
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
