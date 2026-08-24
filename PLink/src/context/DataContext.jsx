import { createContext, useContext, useEffect, useState } from 'react';
import api from '../api';

const DataContext = createContext(null);

const arrayFrom = (value) => {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.data)) return value.data;
  if (Array.isArray(value?.ranking)) return value.ranking;
  if (Array.isArray(value?.notifications)) return value.notifications;
  if (Array.isArray(value?.redemptions)) return value.redemptions;
  if (value && typeof value === 'object') return Object.values(value);
  return [];
};

const buildStudentName = (student) =>
  student?.name || [student?.first_name, student?.last_name].filter(Boolean).join(' ').trim() || 'Unknown Student';

const gradeLabel = (grade) => {
  if (!grade) return 'N/A';
  if (typeof grade === 'object') return grade.name || 'N/A';
  const text = String(grade);
  return /^grade\s/i.test(text) ? text : `Grade ${text}`;
};

const normalizeStudent = (student) => {
  const grade = student.gradeLevel || student.grade_level_relation || student.grade_level;
  const section = student.section || student.section_relation;
  const rfidCards = student.rfidCards || student.rfid_cards || [];
  const activeCard = rfidCards.find((card) => card.status === 'active') || rfidCards[0] || null;
  const id = student.student_id ?? student.id;
  const gradeName = gradeLabel(grade);
  const sectionName = typeof section === 'object' ? section?.name : section;

  return {
    ...student,
    id,
    student_id: id,
    name: buildStudentName(student),
    grade_level: gradeName,
    grade_level_id: student.grade_level_id ?? grade?.grade_level_id ?? null,
    section: sectionName || 'No Section',
    section_id: student.section_id ?? section?.section_id ?? null,
    points_balance: Number(student.points_balance ?? 0),
    points: Number(student.points_balance ?? 0),
    status: student.status || 'inactive',
    rfid_cards: rfidCards,
    active_rfid_card: activeCard,
  };
};

const normalizeTransaction = (tx) => {
  const items = tx.items || tx.recycling_items || [];
  const accepted = items.filter((item) => ['accepted', 'valid'].includes(item.status)).length;
  const rejected = items.filter((item) => ['rejected', 'failed'].includes(item.status)).length;

  return {
    ...tx,
    id: tx.transaction_id ?? tx.id,
    transaction_id: tx.transaction_id ?? tx.id,
    transaction_code: tx.transaction_code || null,
    student_id: tx.student_id ?? tx.student?.student_id ?? null,
    student: tx.student || null,
    smart_bin_id: tx.smart_bin_id ?? tx.smartBin?.smart_bin_id ?? null,
    smart_bin: tx.smartBin || tx.smart_bin || null,
    rfid_card_id: tx.rfid_card_id ?? tx.rfidCard?.rfid_card_id ?? null,
    status: tx.status || 'pending',
    total_items: Number(tx.total_items ?? items.length ?? 0),
    total_points: Number(tx.total_points ?? 0),
    total_weight_kg: Number(tx.total_weight_kg ?? 0),
    items,
    // UI aliases kept at the presentation boundary so existing cards/charts remain readable.
    bottles_deposited: Number(tx.total_items ?? items.length ?? 0),
    bottle_qty: Number(tx.total_items ?? items.length ?? 0),
    points_earned: Number(tx.total_points ?? 0),
    valid_qty: Number(tx.valid_qty ?? accepted),
    rejected_qty: Number(tx.rejected_qty ?? rejected),
    transaction_date: tx.started_at || tx.created_at || null,
  };
};

const normalizeReward = (reward) => ({
  ...reward,
  id: reward.reward_id ?? reward.id,
  reward_id: reward.reward_id ?? reward.id,
  name: reward.reward_name || reward.name || 'Unnamed Reward',
  points: Number(reward.points_cost ?? 0),
  stock: Number(reward.stock_quantity ?? 0),
  status: reward.is_active === false ? 'Inactive' : 'Active',
  /* PRICE ADD START - preserve price field through normalization so inventory tab can use it */
  price: reward.price !== undefined && reward.price !== null ? Number(reward.price) : null,
  /* PRICE ADD END */
});

const normalizePlasticType = (item) => ({
  ...item,
  id: item.plastic_type_id ?? item.id,
  plastic_type_id: item.plastic_type_id ?? item.id,
  name: item.name || item.plastic_type || 'Unnamed Type',
  code: item.code || '',
  points: Number(item.points_value ?? 0),
  points_value: Number(item.points_value ?? 0),
  is_accepted: Boolean(item.is_accepted),
  is_active: item.is_active !== false,
  raw: item,
});

const normalizeSection = (section) => ({
  ...section,
  id: section.section_id ?? section.id,
  section_id: section.section_id ?? section.id,
  name: section.name || section.section_name || 'Unnamed Section',
});

// Smart Bin presentation model. Fullness is calculated from HC-SR04 distance
// in the monitoring page; these values are normalized here so the frontend
// consistently understands the revised backend schema.
const normalizeCompartment = (compartment) => ({
  ...compartment,
  id: compartment.compartment_id ?? compartment.id,
  compartment_id: compartment.compartment_id ?? compartment.id,
  name: compartment.name || 'Compartment',
  material_category: compartment.material_category || 'other',
  status: compartment.status || 'offline',
  current_distance_cm:
    compartment.current_distance_cm === null || compartment.current_distance_cm === undefined
      ? null
      : Number(compartment.current_distance_cm),
  current_fill_percentage: Number(compartment.current_fill_percentage ?? 0),
  full_threshold_cm: Number(compartment.full_threshold_cm ?? 20),
  empty_threshold_cm: Number(compartment.empty_threshold_cm ?? 80),
  fill_state: compartment.fill_state || 'normal',
  last_active_at: compartment.last_active_at || null,
});

const normalizeSmartBin = (bin) => ({
  ...bin,
  id: bin.smart_bin_id ?? bin.machine_id ?? bin.id,
  smart_bin_id: bin.smart_bin_id ?? bin.machine_id ?? bin.id,
  name: bin.name || 'Smart Recycling Bin',
  location: bin.location || 'Unknown location',
  status: bin.status || 'offline',
  current_distance_cm: Number(
    bin.current_distance_cm ?? bin.distance_cm ?? 0
  ),
  current_fill_percentage:
    bin.current_fill_percentage === null || bin.current_fill_percentage === undefined
      ? null
      : Number(bin.current_fill_percentage),
  full_threshold_cm: Number(bin.full_threshold_cm ?? 20),
  empty_threshold_cm: Number(bin.empty_threshold_cm ?? 80),
  compartments: Array.isArray(bin.compartments)
    ? bin.compartments.map(normalizeCompartment)
    : [],
  last_active_at: bin.last_active_at || null,
  last_maintenance_at: bin.last_maintenance_at || null,
});

const formatRelativeTime = (dateString) => {
  if (!dateString) return 'Just now';
  const date = new Date(dateString);
  const diffMins = Math.floor((Date.now() - date.getTime()) / 60000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} hr ago`;
  const diffDays = Math.floor(diffHours / 24);
  return diffDays === 1 ? 'Yesterday' : `${diffDays} days ago`;
};

const notificationGroup = (dateString) => {
  if (!dateString) return 'today';
  const date = new Date(dateString);
  const today = new Date();
  const startToday = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const startDate = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  const oneDay = 24 * 60 * 60 * 1000;
  if (startDate === startToday) return 'today';
  if (startDate === startToday - oneDay) return 'yesterday';
  return 'earlier';
};

const normalizeNotification = (item) => {
  const type = item.notification_type || item.type || 'info';
  const title = item.title || 'Notification';
  const lower = `${type} ${title}`.toLowerCase();
  const severity = lower.includes('full') || lower.includes('offline') ? 'warning' : lower.includes('error') ? 'critical' : 'info';
  return {
    ...item,
    id: item.notification_id ?? item.id,
    notification_id: item.notification_id ?? item.id,
    smart_bin_id: item.smart_bin_id ?? item.smartBin?.smart_bin_id ?? null,
    severity,
    title,
    message: item.message || '',
    time: formatRelativeTime(item.created_at),
    group: notificationGroup(item.created_at),
    read: Boolean(item.is_read || item.read_at),
    type,
  };
};

const normalizeRedemption = (redemption, students, rewards) => {
  const studentId = redemption.student_id ?? redemption.student?.student_id;
  const rewardId = redemption.reward_id ?? redemption.reward?.reward_id;
  const student = students.find((s) => s.student_id === studentId);
  const reward = rewards.find((r) => r.reward_id === rewardId);
  return {
    ...redemption,
    id: redemption.redemption_id ?? redemption.id,
    redemption_id: redemption.redemption_id ?? redemption.id,
    studentId,
    rewardId,
    student: buildStudentName(redemption.student || student),
    reward: redemption.reward?.reward_name || reward?.reward_name || reward?.name || 'Unknown Reward',
    points: Number(redemption.points_spent ?? redemption.points_cost ?? reward?.points_cost ?? 0),
    date: redemption.redeemed_at || redemption.created_at || null,
  };
};

const normalizeSettings = (payload) => payload?.data || payload || {};

export const DataProvider = ({ children }) => {
  const [data, setData] = useState({
    students: [],
    transactions: [],
    rewards: [],
    /* INVENTORY TAB START - dedicated inventory list fed from /rewards/inventory */
    inventory: [],
    /* INVENTORY TAB END */
    redemptions: [],
    sections: [],
    sectionsRanking: [],
    notifications: [],
    settings: {},
    plasticTypes: [],
    smartBins: [],
    dashboard: null,
    isLoading: true,
    error: null,
  });

  const refreshDashboard = async () => {
    const res = await api.getDashboard();
    setData((prev) => ({ ...prev, dashboard: res.data }));
    return res;
  };

  const refreshStudents = async () => {
    const res = await api.getStudents();
    setData((prev) => ({ ...prev, students: arrayFrom(res.data).map(normalizeStudent) }));
    return res;
  };

  const refreshTransactions = async () => {
    const res = await api.getTransactions();
    setData((prev) => ({ ...prev, transactions: arrayFrom(res.data).map(normalizeTransaction) }));
    return res;
  };

  const refreshRewards = async () => {
    const res = await api.getRewards();
    setData((prev) => ({ ...prev, rewards: arrayFrom(res.data).map(normalizeReward) }));
    return res;
  };

  /* INVENTORY TAB START - refreshInventory calls /rewards/inventory and normalizes numbers for UI */
  const refreshInventory = async () => {
    const res = await api.getInventory();
    const rows = arrayFrom(res.data).map((item) => ({
      ...item,
      id: item.reward_id ?? item.id,
      reward_id: item.reward_id ?? item.id,
      name: item.reward_name || item.name || 'Unnamed Item',
      item_price: Number(item.item_price ?? item.price ?? 0),
      purchased_item: Number(item.purchased_item ?? item.purchased_item_count ?? item.purchased_count ?? 0),
      date_purchased: item.date_purchased ?? item.created_at ?? null,
      remaining_stocks: Number(item.remaining_stocks ?? item.stock_quantity ?? item.stock ?? 0),
      total_stocks_on_hand: Number(item.total_stocks_on_hand ?? item.total_stocks ?? 0),
      total_price: Number(item.total_price ?? (
        (Number(item.total_stocks_on_hand ?? item.total_stocks ?? 0)) *
        (Number(item.item_price ?? item.price ?? 0))
      )),
      variance: Number(item.variance ?? 0),
    }));
    setData((prev) => ({ ...prev, inventory: rows }));
    return res;
  };
  /* INVENTORY TAB END */

  const refreshRedemptions = async () => {
    const res = await api.getRedemptions();
    setData((prev) => ({
      ...prev,
      redemptions: arrayFrom(res.data).map((r) => normalizeRedemption(r, prev.students, prev.rewards)),
    }));
    return res;
  };

  const refreshSections = async () => {
    const res = await api.getSectionsList();
    setData((prev) => ({ ...prev, sections: arrayFrom(res.data).map(normalizeSection) }));
    return res;
  };

  const refreshSectionsRanking = async () => {
    const res = await api.getSectionsRanking();
    setData((prev) => ({ ...prev, sectionsRanking: arrayFrom(res.data).map((s) => ({
      ...s,
      name: s.section_name || s.name,
      students: Number(s.student_count ?? s.students ?? 0),
      bottles: Number(s.total_bottles ?? s.bottles ?? 0),
      points: Number(s.total_points ?? s.points ?? 0),
      rank: s.points_rank || s.rank,
    })) }));
    return res;
  };

  const refreshNotifications = async () => {
    const res = await api.getNotifications();
    setData((prev) => ({ ...prev, notifications: arrayFrom(res.data).map(normalizeNotification) }));
    return res;
  };

  const refreshSettings = async () => {
    const res = await api.getSettings();
    setData((prev) => ({ ...prev, settings: normalizeSettings(res.data) }));
    return res;
  };

  const refreshPlasticTypes = async () => {
    const res = await api.getPlasticTypes();
    setData((prev) => ({ ...prev, plasticTypes: arrayFrom(res.data).map(normalizePlasticType) }));
    return res;
  };

  const refreshSmartBins = async () => {
    const res = await api.getSmartBins();
    setData((prev) => ({ ...prev, smartBins: arrayFrom(res.data).map(normalizeSmartBin) }));
    return res;
  };

  const refreshData = async () => {
    setData((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      // Only the lightweight dashboard payload blocks the first render.
      // Every other page fetches its own data when the admin opens that page.
      const res = await api.getDashboard();
      setData((prev) => ({
        ...prev,
        dashboard: res.data,
        isLoading: false,
        error: null,
      }));
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setData((prev) => ({ ...prev, isLoading: false, error: error?.message || 'Failed to load dashboard' }));
    }
  };

  useEffect(() => { refreshData(); }, []);

  const addStudent = (student) => setData((prev) => ({ ...prev, students: [...prev.students, normalizeStudent(student)] }));
  const removeStudent = (id) => setData((prev) => ({ ...prev, students: prev.students.filter((s) => s.student_id !== id) }));

  const updateStudent = async (id, payload) => {
    const res = await api.updateStudent(id, payload);
    const updated = normalizeStudent(res.data);
    setData((prev) => ({ ...prev, students: prev.students.map((s) => s.student_id === id ? updated : s) }));
    return res;
  };

  const activateStudent = (id) => api.activateStudent(id);
  const getActivationStatus = async (id) => (await api.getActivationStatus(id)).data;
  const cancelActivation = (id) => api.cancelActivation(id);

  const identifyCard = async (cardUid) => (await api.identifyCard(cardUid)).data;
  const startStudentIdentify = async () => (await api.getActiveScanSession()).data;
  const clearStudentIdentify = () => api.clearScanSession();

  const addSection = (section) => setData((prev) => ({ ...prev, sections: [...prev.sections, normalizeSection(section)] }));
  const updateSection = (id, section) => setData((prev) => ({ ...prev, sections: prev.sections.map((s) => s.section_id === id ? normalizeSection({ ...s, ...section }) : s) }));
  const removeSection = (id) => setData((prev) => ({ ...prev, sections: prev.sections.filter((s) => s.section_id !== id) }));
  const addTransaction = (tx) => setData((prev) => ({ ...prev, transactions: [normalizeTransaction(tx), ...prev.transactions] }));
  const updateSettings = (settings) => setData((prev) => ({ ...prev, settings: { ...prev.settings, ...settings } }));

  const addRedemption = async (payload) => {
    const res = await api.addRedemption(payload);
    await Promise.all([refreshRedemptions(), refreshStudents(), refreshRewards()]);
    return res;
  };
  const initiateRedemption = (studentId, rewardId) => api.initiateRedemption(studentId, rewardId);
  const getRedemptionStatus = async (studentId, rewardId) => (await api.getRedemptionStatus(studentId, rewardId)).data;
  const cancelRedemption = (studentId, rewardId) => api.cancelRedemption(studentId, rewardId);

  const markNotificationRead = async (id) => {
    await api.markNotificationRead(id);
    setData((prev) => ({ ...prev, notifications: prev.notifications.map((n) => n.notification_id === id ? { ...n, read: true } : n) }));
  };
  const markAllNotificationsRead = async () => {
    await api.markAllNotificationsRead(data.notifications);
    setData((prev) => ({ ...prev, notifications: prev.notifications.map((n) => ({ ...n, read: true })) }));
  };
  const deleteNotification = async (id) => {
    await api.deleteNotification(id);
    setData((prev) => ({ ...prev, notifications: prev.notifications.filter((n) => n.notification_id !== id) }));
  };

  return (
    <DataContext.Provider value={{
      ...data,
      refreshData,
      refreshDashboard,
      refreshStudents,
      refreshTransactions,
      refreshRewards,
      /* INVENTORY TAB START - expose inventory data + refresh fn to pages */
      refreshInventory,
      /* INVENTORY TAB END */
      refreshRedemptions,
      refreshSections,
      refreshSectionsRanking,
      refreshNotifications,
      refreshSettings,
      refreshPlasticTypes,
      refreshSmartBins,
      addStudent,
      updateStudent,
      removeStudent,
      activateStudent,
      getActivationStatus,
      cancelActivation,
      identifyCard,
      startStudentIdentify,
      clearStudentIdentify,
      addSection,
      updateSection,
      removeSection,
      addTransaction,
      addRedemption,
      initiateRedemption,
      getRedemptionStatus,
      cancelRedemption,
      updateSettings,
      markNotificationRead,
      markAllNotificationsRead,
      deleteNotification,
    }}>
      {children}
    </DataContext.Provider>
  );
};

// Shared context hook intentionally co-located to avoid changing existing imports.
// eslint-disable-next-line react-refresh/only-export-components
export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within a DataProvider');
  return context;
};
