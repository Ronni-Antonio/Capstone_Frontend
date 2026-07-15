import React, { useState, useEffect, useRef } from 'react';
import api from '../api';
import { useData } from '../context/DataContext.jsx';

const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];

/* ===================== REWARDS TAB ===================== */
function RewardsTab() {
  const { rewards, refreshRewards } = useData();
  const [showModal, setShowModal] = useState(false);
  const [newReward, setNewReward] = useState({
    reward_name: '',
    points_cost: '',
    stock_quantity: ''
  });
  const [modalError, setModalError] = useState(null);
  const [modalSuccess, setModalSuccess] = useState(null);

  const handleCreateReward = async (e) => {
    e.preventDefault();
    try {
      setModalError(null);
      setModalSuccess(null);
      
      // Validate inputs
      if (!newReward.reward_name.trim()) {
        setModalError('Please enter a reward name');
        return;
      }
      if (!newReward.points_cost || Number(newReward.points_cost) <= 0) {
        setModalError('Please enter a valid points cost');
        return;
      }
      if (!newReward.stock_quantity || Number(newReward.stock_quantity) <= 0) {
        setModalError('Please enter a valid stock quantity');
        return;
      }
      
      // Send to API
      const rewardData = {
        reward_name: newReward.reward_name.trim(),
        points_cost: Number(newReward.points_cost),
        stock_quantity: Number(newReward.stock_quantity)
      };
      
      await api.addReward(rewardData);
      setModalSuccess('Reward created successfully!');
      
      // Reset form and close modal after a delay
      setTimeout(() => {
        setShowModal(false);
        setNewReward({ reward_name: '', points_cost: '', stock_quantity: '' });
        setModalSuccess(null);
        refreshRewards();
      }, 1500);
    } catch (error) {
      console.error('❌ Error creating reward:', error);
      setModalError(error.response?.data?.message || error.message || 'Failed to create reward');
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-[#dbe6db] shadow-sm">

      <div className="flex justify-between items-center mb-6 gap-4">
        <input
          type="text"
          placeholder="Search rewards..."
          className="border border-[#dbe6db] rounded-xl px-4 py-2 w-1/3 outline-none"
        />

        <button 
          onClick={() => setShowModal(true)}
          className="bg-[#3e5f44] text-white px-5 py-2 rounded-xl text-sm font-semibold"
        >
          + Create Reward
        </button>
      </div>

      {/* Create Reward Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl">
            <h2 className="text-2xl font-bold text-[#3e5f44] mb-6">Create New Reward</h2>
            
            {modalError && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-xl">
                ❌ {modalError}
              </div>
            )}
            
            {modalSuccess && (
              <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-xl">
                ✅ {modalSuccess}
              </div>
            )}
            
            <form onSubmit={handleCreateReward} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#6f876f] mb-1">
                  Reward Name
                </label>
                <input
                  type="text"
                  value={newReward.reward_name}
                  onChange={(e) => setNewReward({ ...newReward, reward_name: e.target.value })}
                  className="w-full border border-[#dbe6db] rounded-xl px-4 py-3 outline-none focus:border-[#3e5f44]"
                  placeholder="Enter reward name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#6f876f] mb-1">
                  Points Cost
                </label>
                <input
                  type="number"
                  min="1"
                  value={newReward.points_cost}
                  onChange={(e) => setNewReward({ ...newReward, points_cost: e.target.value })}
                  className="w-full border border-[#dbe6db] rounded-xl px-4 py-3 outline-none focus:border-[#3e5f44]"
                  placeholder="Enter points cost"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#6f876f] mb-1">
                  Stock Quantity
                </label>
                <input
                  type="number"
                  min="1"
                  value={newReward.stock_quantity}
                  onChange={(e) => setNewReward({ ...newReward, stock_quantity: e.target.value })}
                  className="w-full border border-[#dbe6db] rounded-xl px-4 py-3 outline-none focus:border-[#3e5f44]"
                  placeholder="Enter stock quantity"
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setNewReward({ reward_name: '', points_cost: '', stock_quantity: '' });
                    setModalError(null);
                    setModalSuccess(null);
                  }}
                  className="flex-1 py-3 rounded-xl border border-[#dbe6db] text-[#6f876f] font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-[#3e5f44] text-white font-semibold"
                >
                  Create Reward
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-[#6f876f] border-b">
            <th className="py-3">Reward Name</th>
            <th>Points Required</th>
            <th>Stock</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {rewards.length === 0 && (
            <tr>
              <td colSpan="5" className="py-6 text-center text-[#6f876f]">
                No rewards found
              </td>
            </tr>
          )}
          {rewards.map((r, idx) => (
            <tr key={r.id || r.reward_id || idx} className="border-b">
              <td className="py-3 text-[#3e5f44] font-medium">{r.name}</td>
              <td>{r.points || r.points_required}</td>
              <td>{r.stock}</td>

              <td>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    r.status === 'Active'
                      ? 'bg-[#e8f5bd] text-[#3e5f44]'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {r.status}
                </span>
              </td>

              <td className="space-x-2">
                <button className="text-xs px-3 py-1 rounded-lg bg-blue-100 text-blue-700">
                  Edit
                </button>

                <button className="text-xs px-3 py-1 rounded-lg bg-yellow-100 text-yellow-700">
                  {r.status === 'Active' ? 'Deactivate' : 'Activate'}
                </button>

                <button className="text-xs px-3 py-1 rounded-lg bg-red-100 text-red-700">
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ===================== REDEMPTIONS TAB ===================== */
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
    <div className="bg-white rounded-3xl p-6 border border-[#dbe6db] shadow-sm">

      <h2 className="text-xl font-bold text-[#3e5f44] mb-6">
        Redemption Logs
      </h2>

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
  );
}

/* ===================== REPORTS TAB (MATCH YOUR IMAGE) ===================== */
function ReportsTab() {
  const { rewards, redemptions } = useData();

  // 1. Reward Distribution: Count how many times each reward has been redeemed
  const getRewardDistribution = () => {
    const counts = {};
    rewards.forEach(reward => {
      counts[reward.id] = { name: reward.name, count: 0, reward };
    });
    redemptions.forEach(redemption => {
      if (counts[redemption.rewardId]) {
        counts[redemption.rewardId].count += 1;
      }
    });
    return Object.values(counts).filter(item => item.count > 0 || item.reward.status === 'Active');
  };
  const distribution = getRewardDistribution();
  const maxDist = Math.max(...distribution.map(d => d.count), 1);

  // 2. Monthly Redemption Trend
  const getMonthlyTrend = () => {
    const now = new Date();
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        key: `${date.getFullYear()}-${date.getMonth()}`,
        label: monthLabels[date.getMonth()],
        count: 0,
        points: 0
      });
    }
    redemptions.forEach(redemption => {
      if (redemption.date) {
        const date = new Date(redemption.date);
        const key = `${date.getFullYear()}-${date.getMonth()}`;
        const month = months.find(m => m.key === key);
        if (month) {
          month.count += 1;
          month.points += redemption.points;
        }
      }
    });
    return months;
  };
  const monthlyTrend = getMonthlyTrend();
  const maxTrendCount = Math.max(...monthlyTrend.map(m => m.count), 1);
  const maxTrendPoints = Math.max(...monthlyTrend.map(m => m.points), 1);

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-[#3e5f44]">
            Reports & Analytics
          </h2>
          <p className="text-sm text-[#6f876f]">
            Overview of rewards and redemption performance
          </p>
        </div>

        <button className="bg-[#3e5f44] text-white px-5 py-2 rounded-xl text-sm font-semibold">
          ⬇ Export All Data
        </button>
      </div>

      {/* Top Charts */}
      <div className="grid grid-cols-2 gap-5">

        {/* Distribution */}
        <div className="bg-white p-6 rounded-3xl border border-[#dbe6db] shadow-sm">
          <h3 className="text-lg font-bold text-[#3e5f44] mb-4">
            Reward Distribution
          </h3>

          <div className="space-y-3">
            {distribution.length === 0 ? (
              <p className="text-[#6f876f] text-sm">No redemption data yet</p>
            ) : (
              distribution.slice(0, 5).map((item, idx) => (
                <div key={idx} className="flex justify-between items-center">
                  <span className="text-sm text-[#3e5f44]">
                    {item.name}
                  </span>

                  <div className="flex items-center gap-3 w-1/2">
                    <div className="flex-1 h-3 bg-[#edf2ea] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#7faa72]"
                        style={{ width: `${(item.count / maxDist) * 100}%` }}
                      />
                    </div>

                    <span className="text-xs font-semibold text-[#3e5f44] w-10 text-right">
                      {item.count}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Trend (Redemption Count) */}
        <div className="bg-white p-6 rounded-3xl border border-[#dbe6db] shadow-sm">
          <h3 className="text-lg font-bold text-[#3e5f44] mb-4">
            Redemption Count (Monthly)
          </h3>

          <div className="h-[220px] flex items-end justify-between gap-3">
            {monthlyTrend.map((month, idx) => (
              <div key={idx} className="flex flex-col items-center flex-1">
                <div
                  className="w-full bg-[#7faa72] rounded-t-xl"
                  style={{
                    height: `${(month.count / maxTrendCount) * 200}px`,
                    minHeight: '4px'
                  }}
                />
                <span className="text-xs text-[#6f876f] mt-2">
                  {month.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Chart (Points Redeemed Monthly) */}
      <div className="bg-white p-6 rounded-3xl border border-[#dbe6db] shadow-sm">
        <h3 className="text-lg font-bold text-[#3e5f44] mb-4">
          Points Redeemed (Monthly)
        </h3>

        <div className="h-[260px] flex items-end justify-between gap-4">
          {monthlyTrend.map((month, idx) => (
            <div key={idx} className="flex flex-col items-center flex-1">
              <div
                className="w-full bg-[#3e5f44] rounded-t-xl"
                style={{
                  height: `${(month.points / maxTrendPoints) * 240}px`,
                  minHeight: '4px'
                }}
              />
              <span className="text-xs text-[#6f876f] mt-2">
                {month.label}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

/* ===================== REDEMPTION FLOW ===================== */
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
    <div className="bg-white rounded-3xl p-6 border border-[#dbe6db] shadow-sm">
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
                    className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                      !canAfford
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

/* ===================== MAIN COMPONENT ===================== */
export default function IncentivesRewards() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { rewards: dashboardRewards } = useData();

  const totalRewards = dashboardRewards.length;
  const totalStock = dashboardRewards.reduce((sum, reward) => sum + reward.stock, 0);
  const averagePoints =
    totalRewards > 0
      ? Math.round(
          dashboardRewards.reduce((sum, reward) => sum + reward.points, 0) /
            totalRewards
        )
      : 0;
  const highestPointReward = dashboardRewards.reduce(
    (highest, reward) => (reward.points > highest.points ? reward : highest),
    { name: 'None', points: 0 }
  );

  const dashboardStats = [
    {
      title: 'Total Rewards',
      value: totalRewards.toLocaleString(),
      sub: 'Preloaded from data context',
      icon: 'fa-gift',
    },
    {
      title: 'Active Rewards',
      value: dashboardRewards
        .filter((reward) => reward.status === 'Active')
        .length.toLocaleString(),
      sub: 'Currently available',
      icon: 'fa-star',
    },
    {
      title: 'Total Stock',
      value: totalStock.toLocaleString(),
      sub: 'Units in inventory',
      icon: 'fa-box-open',
    },
    {
      title: 'Average Points Cost',
      value: averagePoints.toLocaleString(),
      sub: 'Points per reward',
      icon: 'fa-arrow-trend-up',
    },
  ];

  const inventoryData = [...dashboardRewards]
    .sort((a, b) => b.stock - a.stock)
    .slice(0, 4)
    .map((reward) => ({
      name: reward.name,
      count: reward.stock,
    }));

  const rewardCreationTrend = (() => {
    const now = new Date();
    const months = [];

    for (let index = 5; index >= 0; index -= 1) {
      const date = new Date(now.getFullYear(), now.getMonth() - index, 1);
      months.push({
        key: `${date.getFullYear()}-${date.getMonth()}`,
        label: monthLabels[date.getMonth()],
        value: 0,
      });
    }

    dashboardRewards.forEach((reward) => {
      if (!reward.createdAt) {
        return;
      }

      const createdDate = new Date(reward.createdAt);
      if (Number.isNaN(createdDate.getTime())) {
        return;
      }

      const monthKey = `${createdDate.getFullYear()}-${createdDate.getMonth()}`;
      const matchedMonth = months.find((month) => month.key === monthKey);

      if (matchedMonth) {
        matchedMonth.value += 1;
      }
    });

    return months;
  })();

  const trendMax = Math.max(...rewardCreationTrend.map((item) => item.value), 1);

  return (
    <div className="space-y-6">

      {/* Tabs */}
      <div className="bg-white rounded-2xl p-2 inline-flex gap-2 shadow-sm border border-[#dbe6db]">
        {['dashboard', 'rewards', 'redeem', 'redemptions', 'reports'].map(
          (tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 text-sm rounded-xl capitalize ${
                activeTab === tab
                  ? 'bg-[#3e5f44] text-white font-semibold'
                  : 'text-[#6f876f]'
              }`}
            >
              {tab}
            </button>
          )
        )}
      </div>

      {activeTab === 'dashboard' && (
        <>
          <div className="grid grid-cols-4 gap-5">
            {dashboardStats.map((card) => (
              <div
                key={card.title}
                className="bg-white rounded-3xl p-6 shadow-sm border border-[#dbe6db]"
              >
                <div className="flex justify-between items-center mb-4">
                  <div className="w-11 h-11 rounded-2xl bg-[#e8f5bd] flex items-center justify-center">
                    <i className={`fa-solid ${card.icon} text-[#3e5f44]`} />
                  </div>
                </div>

                <p className="text-sm text-[#7a947e]">{card.title}</p>

                <h2 className="text-4xl font-bold text-[#3e5f44]">
                  {card.value}
                </h2>

                <p className="text-xs text-[#94a894] mt-2">{card.sub}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-5">
            <div className="col-span-2 bg-white rounded-3xl p-6 border border-[#dbe6db] shadow-sm">
              <h3 className="text-2xl font-bold text-[#3e5f44]">
                Reward Creation Trend
              </h3>
              <p className="text-sm text-[#8da28e] mb-8">
                Rewards created over the last 6 months
              </p>

              {totalRewards === 0 ? (
                <div className="h-[280px] flex items-center justify-center text-sm text-[#8da28e]">
                  No rewards found
                </div>
              ) : (
                <div className="h-[280px] flex items-end justify-between gap-4">
                  {rewardCreationTrend.map((item) => (
                    <div key={item.key} className="flex flex-col items-center flex-1">
                      <div
                        className="w-full bg-[#7faa72] rounded-t-xl"
                        style={{
                          height: `${item.value === 0 ? 12 : (item.value / trendMax) * 220}px`,
                        }}
                      />
                      <span className="mt-3 text-xs text-[#6f876f]">
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-3xl p-6 border border-[#dbe6db] shadow-sm">
              <h3 className="text-xl font-bold text-[#3e5f44]">
                Current Reward Inventory
              </h3>
              <p className="text-sm text-[#8da28e] mb-8">
                Rewards with the highest remaining stock
              </p>

              {inventoryData.length === 0 ? (
                <div className="text-sm text-[#8da28e]">No rewards found</div>
              ) : (
                <div className="space-y-6">
                  {inventoryData.map((reward) => (
                    <div key={reward.name}>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-[#3e5f44]">{reward.name}</span>
                        <span className="font-semibold text-[#3e5f44]">
                          {reward.count}
                        </span>
                      </div>

                      <div className="h-4 bg-[#edf2ea] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#7faa72]"
                          style={{
                            width: `${Math.max(
                              (reward.count / Math.max(...inventoryData.map((item) => item.count), 1)) * 100,
                              reward.count > 0 ? 8 : 0
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {totalRewards > 0 && (
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#dbe6db]">
              <h3 className="text-lg font-bold text-[#3e5f44]">
                Highest Points Reward
              </h3>
              <p className="text-sm text-[#8da28e] mt-2">
                {highestPointReward.name} requires {highestPointReward.points.toLocaleString()} points.
              </p>
            </div>
          )}
        </>
      )}

      {activeTab === 'redeem' && <RedemptionFlow />}
      {activeTab === 'rewards' && <RewardsTab />}
      {activeTab === 'redemptions' && <RedemptionsTab />}
      {activeTab === 'reports' && <ReportsTab />}

    </div>
  );
}
