import { useMemo, useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  SearchIcon,
  EyeIcon,
  XIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CalendarIcon,
  ScrollTextIcon,
} from 'lucide-react'
import { logEntries } from '../data/logs'
import { useData } from '../context/DataContext.jsx';

const PAGE_SIZE = 8

const categories = [
  'All',
  'Redemption',
  'User Activity',
  'Collection',
  'Inventory',
  'System',
]

const statusStyle = {
  Completed: 'bg-[#c7eabb]/60 text-[#3e5f44]',
  Pending: 'bg-amber-100 text-amber-800',
  Rejected: 'bg-red-100 text-red-700',
  Info: 'bg-[#e8f5bd] text-[#3e5f44]',
}

const formatDate = (iso) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

/* ===================== ACTIVITY LOGS TAB ===================== */
function ActivityLogsTab() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [page, setPage] = useState(1)
  const [viewing, setViewing] = useState(null)

  const filtered = useMemo(
    () =>
      logEntries.filter((log) => {
        const matchesCategory = category === 'All' || log.category === category
        const haystack = [
          log.actor,
          log.description,
          log.reward ?? '',
          log.section ?? '',
          log.processedBy,
        ]
          .join(' ')
          .toLowerCase()
        const matchesSearch = haystack.includes(search.toLowerCase())
        const matchesFrom = !from || log.date >= from
        const matchesTo = !to || log.date <= to
        return matchesCategory && matchesSearch && matchesFrom && matchesTo
      }),
    [search, category, from, to],
  )

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const pageData = filtered.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  )

  const resetPage = () => setPage(1)
  const clearDates = () => {
    setFrom('')
    setTo('')
    resetPage()
  }

  const countFor = (c) =>
    c === 'All'
      ? logEntries.length
      : logEntries.filter((l) => l.category === c).length

  return (
    <div className="space-y-6">
      {/* Category summary */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {categories
          .filter((c) => c !== 'All')
          .map((c) => (
            <button
              key={c}
              onClick={() => {
                setCategory(c)
                resetPage()
              }}
              className={`text-left bg-white rounded-3xl p-5 border transition-colors ${category === c ? 'border-[#5a7c61] bg-[#fcfcf7]' : 'border-[#c7eabb]/40 hover:bg-[#fcfcf7]'}`}
              style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}
            >
              <div className="w-9 h-9 rounded-xl bg-[#c7eabb]/60 flex items-center justify-center mb-3">
                <ScrollTextIcon className="w-4 h-4 text-[#3e5f44]" />
              </div>
              <div className="text-2xl font-bold text-[#3e5f44] leading-none">
                {countFor(c)}
              </div>
              <div className="text-xs font-semibold text-[#3e5f44]/80 mt-1.5">
                {c} Logs
              </div>
            </button>
          ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-3xl p-5 border border-[#c7eabb]/40 space-y-4" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          <div className="flex items-center gap-2 bg-[#fcfcf7] rounded-2xl px-4 py-2.5 flex-1 max-w-md border border-[#c7eabb]/50 focus-within:border-[#5a7c61] transition-colors">
            <SearchIcon className="w-4 h-4 text-[#3e5f44]/50" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                resetPage()
              }}
              placeholder="Search logs by user, reward, or activity…"
              className="bg-transparent outline-none text-sm flex-1 placeholder:text-[#3e5f44]/40 text-[#3e5f44]"
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => {
                  setCategory(c)
                  resetPage()
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${category === c ? 'bg-[#3e5f44] text-white' : 'bg-[#e8f5bd]/60 text-[#3e5f44] hover:bg-[#c7eabb]'}`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-end gap-3 pt-1 border-t border-[#c7eabb]/40">
          <div className="pt-3">
            <label className="text-xs font-semibold text-[#3e5f44] mb-1.5 flex items-center gap-1.5">
              <CalendarIcon className="w-3.5 h-3.5" /> From
            </label>
            <input
              type="date"
              value={from}
              onChange={(e) => {
                setFrom(e.target.value)
                resetPage()
              }}
              className="bg-[#fcfcf7] border border-[#c7eabb]/50 rounded-xl px-3.5 py-2 text-sm text-[#3e5f44] focus:outline-none focus:border-[#5a7c61]"
            />
          </div>
          <div className="pt-3">
            <label className="text-xs font-semibold text-[#3e5f44] mb-1.5 flex items-center gap-1.5">
              <CalendarIcon className="w-3.5 h-3.5" /> To
            </label>
            <input
              type="date"
              value={to}
              onChange={(e) => {
                setTo(e.target.value)
                resetPage()
              }}
              className="bg-[#fcfcf7] border border-[#c7eabb]/50 rounded-xl px-3.5 py-2 text-sm text-[#3e5f44] focus:outline-none focus:border-[#5a7c61]"
            />
          </div>
          {(from || to) && (
            <button
              onClick={clearDates}
              className="mt-3 px-4 py-2 rounded-xl bg-[#e8f5bd]/60 text-[#3e5f44] font-semibold text-xs hover:bg-[#c7eabb] transition-colors"
            >
              Clear dates
            </button>
          )}
        </div>
      </div>

      {/* Log table */}
      <div className="bg-white rounded-3xl border border-[#c7eabb]/40 overflow-hidden" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#e8f5bd]/50 text-[#3e5f44]">
              <tr>
                <th className="text-left text-xs font-semibold uppercase tracking-wider px-6 py-4">
                  Date & Time
                </th>
                <th className="text-left text-xs font-semibold uppercase tracking-wider px-6 py-4">
                  Category
                </th>
                <th className="text-left text-xs font-semibold uppercase tracking-wider px-6 py-4">
                  User / Item
                </th>
                <th className="text-left text-xs font-semibold uppercase tracking-wider px-6 py-4">
                  Activity
                </th>
                <th className="text-right text-xs font-semibold uppercase tracking-wider px-6 py-4">
                  Points
                </th>
                <th className="text-left text-xs font-semibold uppercase tracking-wider px-6 py-4">
                  Status
                </th>
                <th className="text-left text-xs font-semibold uppercase tracking-wider px-6 py-4">
                  Processed By
                </th>
                <th className="text-right text-xs font-semibold uppercase tracking-wider px-6 py-4">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#c7eabb]/40">
              {pageData.map((log) => (
                <tr
                  key={log.id}
                  className="hover:bg-[#fcfcf7] transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-[#3e5f44]">
                      {formatDate(log.date)}
                    </div>
                    <div className="text-xs text-[#3e5f44]/50">{log.time}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#fcfcf7] text-[#3e5f44] whitespace-nowrap">
                      {log.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-semibold text-[#3e5f44] whitespace-nowrap">
                      {log.actor}
                    </div>
                    {log.section && (
                      <div className="text-xs text-[#3e5f44]/50">
                        {log.section}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-[#3e5f44]/80 max-w-xs">
                      {log.description}
                    </div>
                    {log.quantity !== undefined && (
                      <div className="text-xs text-[#3e5f44]/50 mt-0.5">
                        Qty: {log.quantity}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-bold whitespace-nowrap">
                    {log.pointsUsed !== undefined ? (
                      <span className="text-[#5a7c61]">
                        {log.pointsUsed.toLocaleString()}
                      </span>
                    ) : (
                      <span className="text-[#3e5f44]/30">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${statusStyle[log.status]}`}
                    >
                      {log.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-[#3e5f44]/70 whitespace-nowrap">
                    {log.processedBy}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end">
                      <button
                        onClick={() => setViewing(log)}
                        className="w-8 h-8 rounded-lg bg-[#e8f5bd]/60 text-[#3e5f44] hover:bg-[#c7eabb] flex items-center justify-center transition-colors"
                        aria-label={`View log for ${log.actor}`}
                        title="View log details"
                      >
                        <EyeIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {pageData.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-12 text-center text-[#3e5f44]/60 text-sm"
                  >
                    No logs found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-t border-[#c7eabb]/40 bg-[#fcfcf7]">
          <div className="text-xs text-[#3e5f44]/60">
            Showing{' '}
            <span className="font-semibold text-[#3e5f44]">
              {filtered.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1}
            </span>
            –
            <span className="font-semibold text-[#3e5f44]">
              {Math.min(safePage * PAGE_SIZE, filtered.length)}
            </span>{' '}
            of{' '}
            <span className="font-semibold text-[#3e5f44]">
              {filtered.length}
            </span>{' '}
            log entries
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage === 1}
              className="w-8 h-8 rounded-lg bg-white border border-[#c7eabb]/50 text-[#3e5f44] hover:bg-[#e8f5bd] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
              aria-label="Previous page"
            >
              <ChevronLeftIcon className="w-4 h-4" />
            </button>
            <span className="text-sm font-semibold text-[#3e5f44] px-2">
              Page {safePage} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages}
              className="w-8 h-8 rounded-lg bg-white border border-[#c7eabb]/50 text-[#3e5f44] hover:bg-[#e8f5bd] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
              aria-label="Next page"
            >
              <ChevronRightIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Log detail modal */}
      <AnimatePresence>
        {viewing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#3e5f44]/40 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setViewing(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-3xl p-7 max-w-md w-full"
              style={{ boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between mb-5">
                <div>
                  <h3 className="font-bold text-[#3e5f44] text-xl">
                    {viewing.category} Log
                  </h3>
                  <p className="text-sm text-[#3e5f44]/60 mt-1">
                    {formatDate(viewing.date)} · {viewing.time}
                  </p>
                </div>
                <button
                  onClick={() => setViewing(null)}
                  className="w-8 h-8 rounded-lg hover:bg-[#e8f5bd] flex items-center justify-center text-[#3e5f44]"
                  aria-label="Close"
                >
                  <XIcon className="w-4 h-4" />
                </button>
              </div>

              <div className="bg-[#e8f5bd]/40 rounded-2xl p-4 mb-5">
                <div className="text-xs text-[#3e5f44]/60">Activity</div>
                <div className="text-sm font-semibold text-[#3e5f44] mt-1">
                  {viewing.description}
                </div>
              </div>

              <dl className="space-y-3 text-sm">
                {[
                  ['User / Item', viewing.actor],
                  ...(viewing.section ? [['Section', viewing.section]] : []),
                  ...(viewing.reward ? [['Reward', viewing.reward]] : []),
                  ...(viewing.quantity !== undefined
                    ? [['Quantity', String(viewing.quantity)]]
                    : []),
                  ...(viewing.pointsUsed !== undefined
                    ? [['Points Used', viewing.pointsUsed.toLocaleString()]]
                    : []),
                  ['Status', viewing.status],
                  ['Processed By', viewing.processedBy],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="flex items-center justify-between gap-4 border-b border-[#c7eabb]/30 pb-2 last:border-0"
                  >
                    <dt className="text-[#3e5f44]/60 shrink-0">{label}</dt>
                    <dd className="font-semibold text-[#3e5f44] text-right">
                      {value}
                    </dd>
                  </div>
                ))}
              </dl>

              <button
                onClick={() => setViewing(null)}
                className="w-full mt-6 py-2.5 rounded-xl bg-[#3e5f44] text-white font-semibold text-sm hover:bg-[#5a7c61] transition-colors"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ===================== REDEMPTIONS TAB (REDEMPTION) ===================== */
function RedemptionsTab() {
  const { redemptions } = useData();

  // Helper to format date nicely
  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-[#dbe6db]" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>

      <h2 className="text-xl font-bold text-[#3e5f44] mb-6">
        Redemption Logs
      </h2>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[#6f876f] border-b">
              <th className="py-3">Student</th>
              <th>Reward</th>
              <th>Points</th>
              <th>Date</th>
            </tr>
          </thead>

          <tbody>
            {redemptions.length === 0 ? (
              <tr>
                <td colSpan="4" className="py-6 text-center text-[#6f876f]">
                  No redemptions found
                </td>
              </tr>
            ) : (
              redemptions.map((r, idx) => (
                <tr key={r.id || idx} className="border-b">

                  <td className="py-3 text-[#3e5f44] font-medium">
                    {r.student}
                  </td>

                  <td>{r.reward}</td>
                  <td>{r.points}</td>
                  <td>{formatDate(r.date)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ===================== REDEMPTION FLOW (REDEMPTION TAB) ===================== */
function RedemptionFlow() {
  const {
    students,
    rewards,
    startStudentIdentify,
    clearStudentIdentify,
    initiateRedemption,
    getRedemptionStatus,
    cancelRedemption,
    refreshStudents,
    refreshRewards,
    refreshRedemptions
  } = useData();

  // State variables
  const [isScanning, setIsScanning] = useState(false); // Step 1: Identify
  const [isConfirmingRedeem, setIsConfirmingRedeem] = useState(false); // Step 2: Confirm
  const [activeStudent, setActiveStudent] = useState(null);
  const [selectedReward, setSelectedReward] = useState(null);
  const [error, setError] = useState(null);
  const [successToast, setSuccessToast] = useState(false);

  // Refs to hold interval IDs
  const identifyIntervalRef = useRef(null);
  const confirmIntervalRef = useRef(null);

  // Helper to get student's full name
  const getStudentFullName = (student) => {
    if (!student) return 'Unknown Student';
    if (student.name) return student.name;
    return `${student.first_name || ''} ${student.last_name || ''}`.trim() || 'Unknown Student';
  };

  // Helper to get student's initials
  const getStudentInitials = (student) => {
    if (!student) return 'S';
    if (student.initials) return student.initials;
    const fullName = getStudentFullName(student);
    if (fullName && fullName !== 'Unknown Student') {
      const nameParts = fullName.split(' ');
      if (nameParts.length >= 2) {
        return (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase();
      }
      return fullName[0].toUpperCase();
    }
    return 'S';
  };

  // Calculate total points for a student
  const calculateStudentPoints = (student) => {
    if (!student) return 0;
    return student.points_balance || student.points || 0;
  };

  // Helper to get actual student ID
  const getStudentId = (student) => {
    if (!student) return null;
    return student.student_id || student.id;
  };

  // Helper to get actual reward ID
  const getRewardId = (reward) => {
    if (!reward) return null;
    return reward.reward_id || reward.id;
  };

  // Step 1: Start scanning for student identification
  const startIdentifyScan = async () => {
    setError(null);
    setIsScanning(true);
    setActiveStudent(null);
    try {
      await clearStudentIdentify(); // Clear old cache
    } catch (err) {
      console.error('Error clearing scan session:', err);
    }

    // Start polling every 2 seconds
    identifyIntervalRef.current = setInterval(async () => {
      try {
        const result = await startStudentIdentify();
        console.log('🔍 Scan session check result:', result);

        let foundStudent = null;

        // Handle both possible API response formats:
        // 1. { student_found: true, student: { ... } }
        if (result.student_found === true && result.student) {
          foundStudent = result.student;
        }
        // 2. { success: true, student_id: 1, ... }
        else if (result.success === true && result.student_id) {
          const studentFromContext = students.find(s =>
            getStudentId(s) === result.student_id
          );
          foundStudent = studentFromContext || {
            student_id: result.student_id,
            name: result.name,
            points_balance: result.points_balance
          };
        }

        if (foundStudent) {
          // Stop polling
          clearInterval(identifyIntervalRef.current);
          identifyIntervalRef.current = null;

          setActiveStudent(foundStudent);
          setIsScanning(false);
        }
      } catch (err) {
        console.error('Polling error:', err);
        // Don't show error for polling failures
      }
    }, 2000);
  };

  // Step 2: Handle reward selection and start confirmation
  const handleSelectReward = async (reward) => {
    const studentId = getStudentId(activeStudent);
    const rewardId = getRewardId(reward);
    const studentPoints = calculateStudentPoints(activeStudent);
    const rewardPoints = reward.points || reward.points_cost || reward.points_required;

    console.log('🎁 handleSelectReward called:', { studentId, rewardId, activeStudent, reward });

    if (studentPoints < rewardPoints) {
      setError('Insufficient points');
      return;
    }

    setSelectedReward(reward);
    setError(null);
    setIsConfirmingRedeem(true);

    try {
      await initiateRedemption(studentId, rewardId);

      // Start polling for redemption completion using getRedemptionStatus
      confirmIntervalRef.current = setInterval(async () => {
        try {
          const redemptionStatus = await getRedemptionStatus(studentId, rewardId);
          console.log('🔄 Redemption status check:', redemptionStatus);

          if (redemptionStatus.completed === true || redemptionStatus.success === true) {
            clearInterval(confirmIntervalRef.current);
            confirmIntervalRef.current = null;

            setIsConfirmingRedeem(false);
            setSuccessToast(true);

            await refreshRedemptions();
            await refreshStudents();
            await refreshRewards();

            setTimeout(() => {
              setSuccessToast(false);
              resetFlow();
            }, 3000);
          }
        } catch (err) {
          console.error('Redemption polling error:', err);
        }
      }, 2000);
    } catch (err) {
      console.error('❌ Error initiating redemption:', err);
      setError(err.response?.data?.message || 'Failed to initiate redemption');
      setIsConfirmingRedeem(false);
    }
  };

  // Cancel the redemption process
  const handleCancelRedemption = async () => {
    if (confirmIntervalRef.current) {
      clearInterval(confirmIntervalRef.current);
      confirmIntervalRef.current = null;
    }
    if (selectedReward && activeStudent) {
      try {
        await cancelRedemption(getStudentId(activeStudent), getRewardId(selectedReward));
      } catch (err) {
        console.error('Error canceling redemption:', err);
      }
    }
    setIsConfirmingRedeem(false);
    setSelectedReward(null);
  };

  // Reset flow completely
  const resetFlow = () => {
    if (identifyIntervalRef.current) {
      clearInterval(identifyIntervalRef.current);
      identifyIntervalRef.current = null;
    }
    if (confirmIntervalRef.current) {
      clearInterval(confirmIntervalRef.current);
      confirmIntervalRef.current = null;
    }
    setIsScanning(false);
    setIsConfirmingRedeem(false);
    setActiveStudent(null);
    setSelectedReward(null);
    setError(null);
  };

  // Cleanup intervals on unmount
  useEffect(() => {
    return () => {
      if (identifyIntervalRef.current) clearInterval(identifyIntervalRef.current);
      if (confirmIntervalRef.current) clearInterval(confirmIntervalRef.current);
    };
  }, []);

  return (
    <div className="bg-white rounded-3xl p-6 border border-[#dbe6db]" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-[#3e5f44]">
          Redemption Terminal
        </h2>
        {(isScanning || activeStudent || isConfirmingRedeem) && !successToast && (
          <button
            onClick={isConfirmingRedeem ? handleCancelRedemption : resetFlow}
            className="bg-[#e8f5bd] text-[#3e5f44] px-4 py-2 rounded-xl text-sm font-semibold"
          >
            ← Cancel
          </button>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-xl">
          ❌ {error}
        </div>
      )}

      {/* Success Toast */}
      {successToast && (
        <div className="mb-6 p-4 bg-green-100 text-green-700 rounded-xl">
          ✅ Redemption processed successfully!
        </div>
      )}

      {/* Step 1: Idle / Tap to Identify */}
      {!isScanning && !activeStudent && !isConfirmingRedeem && !successToast && (
        <div className="text-center py-12">
          <div className="w-40 h-40 mx-auto bg-[#e8f5bd] rounded-full flex items-center justify-center mb-8">
            <i className="fa-solid fa-credit-card text-7xl text-[#3e5f44]" />
          </div>
          <h3 className="text-2xl font-bold text-[#3e5f44] mb-4">
            Tap Student Card to Begin
          </h3>
          <p className="text-[#6f876f] mb-8 max-w-md mx-auto">
            Have the student tap their RFID card on the reader to start the redemption process
          </p>
          <button
            onClick={startIdentifyScan}
            className="bg-[#3e5f44] text-white px-12 py-6 rounded-2xl font-semibold text-xl"
          >
            <i className="fa-solid fa-credit-card mr-2" />
            Tap Card
          </button>
        </div>
      )}

      {/* Step 1: Identifying (Scanning) */}
      {isScanning && !activeStudent && (
        <div className="text-center py-12">
          <div className="w-40 h-40 mx-auto bg-[#e8f5bd] rounded-full flex items-center justify-center mb-8">
            <i className="fa-solid fa-spinner fa-spin text-7xl text-[#3e5f44]" />
          </div>
          <h3 className="text-2xl font-bold text-[#3e5f44] mb-4">
            Waiting for student card tap on reader...
          </h3>
        </div>
      )}

      {/* Step 2: Select Reward */}
      {activeStudent && !isConfirmingRedeem && !successToast && (
        <div>
          {/* Student Info Card */}
          <div className="bg-[#e8f5bd] rounded-2xl p-6 mb-8">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-2xl font-bold text-[#3e5f44]">
                {getStudentInitials(activeStudent)}
              </div>
              <div>
                <h4 className="text-lg font-bold text-[#3e5f44]">
                  {getStudentFullName(activeStudent)}
                </h4>
                <p className="text-sm text-[#6f876f]">
                  Grade {activeStudent.grade_level || '3'} • {activeStudent.section || 'N/A'}
                </p>
              </div>
              <div className="ml-auto text-right">
                <div className="text-2xl font-bold text-[#3e5f44]">
                  {calculateStudentPoints(activeStudent)} points
                </div>
                <div className="text-xs text-[#6f876f]">Available Balance</div>
              </div>
            </div>
          </div>

          <h3 className="text-xl font-bold text-[#3e5f44] mb-4">Select a Reward</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rewards
              .filter(r => r.status === 'Active' && r.stock > 0)
              .map((reward) => {
                const studentPoints = calculateStudentPoints(activeStudent);
                const rewardPoints = reward.points || reward.points_cost || reward.points_required;
                const canAfford = studentPoints >= rewardPoints;

                return (
                  <div
                    key={reward.id || reward.reward_id}
                    onClick={() => canAfford && handleSelectReward(reward)}
                    className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${!canAfford
                      ? 'border-[#e0e0e0] bg-gray-50 opacity-60 cursor-not-allowed'
                      : 'border-[#dbe6db] hover:border-[#3e5f44]'
                    }`}
                  >
                    <h4 className="font-bold text-[#3e5f44] mb-1">{reward.name}</h4>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-[#6f876f]">
                        <i className="fa-solid fa-coins mr-1" /> {rewardPoints} points
                      </span>
                      <span className="text-xs text-[#6f876f]">
                        Stock: {reward.stock}
                      </span>
                    </div>
                    {!canAfford && (
                      <div className="mt-2 text-xs text-red-600">
                        Insufficient points
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Step 3: Confirming (Second Tap) Modal */}
      {isConfirmingRedeem && activeStudent && selectedReward && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl">
            <div className="text-center py-4">
              <div className="w-40 h-40 mx-auto bg-[#e8f5bd] rounded-full flex items-center justify-center mb-6">
                <i className="fa-solid fa-spinner fa-spin text-7xl text-[#3e5f44]" />
              </div>
              <h3 className="text-2xl font-bold text-[#3e5f44] mb-4">
                Confirming transaction for {selectedReward.name}
              </h3>
              <p className="text-[#6f876f] mb-8">
                Cost: {selectedReward.points || selectedReward.points_cost || selectedReward.points_required} Points. Please have the student tap their card a SECOND time on the reader to complete purchase.
              </p>
              <button
                onClick={handleCancelRedemption}
                className="w-full py-3 rounded-xl border border-[#3e5f44] text-[#3e5f44] font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 4: Success (Handled by success toast and auto-reset) */}
      {successToast && (
        <div className="text-center py-12">
          <div className="w-32 h-32 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-6">
            <i className="fa-solid fa-check text-5xl text-green-700" />
          </div>
          <h3 className="text-2xl font-bold text-[#3e5f44] mb-3">
            Redemption Complete!
          </h3>
          <p className="text-[#6f876f] mb-8">
            {getStudentFullName(activeStudent)} has redeemed {selectedReward?.name}
          </p>
        </div>
      )}
    </div>
  );
}

/* ===================== MAIN LOGS COMPONENT ===================== */
export function Logs() {
  const [activeTab, setActiveTab] = useState('activity');
  const { refreshRedemptions, refreshStudents, refreshRewards } = useData();

  useEffect(() => {
    Promise.allSettled([refreshRedemptions(), refreshStudents(), refreshRewards()]);
  }, []);

  return (
    <div className="space-y-6">

      {/* Tabs */}
      <div className="bg-white rounded-2xl p-2 inline-flex gap-2 border border-[#dbe6db]" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        {[
          { key: 'activity', label: 'Activity Logs' },
          { key: 'redeem', label: 'Redemption Terminal' },
          { key: 'redemptions', label: 'Redemptions' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-5 py-2 text-sm rounded-xl ${activeTab === tab.key
              ? 'bg-[#3e5f44] text-white font-semibold'
              : 'text-[#6f876f]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'activity' && <ActivityLogsTab />}
      {activeTab === 'redeem' && <RedemptionFlow />}
      {activeTab === 'redemptions' && <RedemptionsTab />}

    </div>
  );
}

export default Logs;
