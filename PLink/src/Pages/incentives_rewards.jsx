import React, { useState } from 'react';
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
              <td colSpan="6" className="py-6 text-center text-[#6f876f]">
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
              <td>{r.redemption_date}</td>
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
  const distribution = [
    { name: 'Extra Recess Time', value: 145 },
    { name: 'Eco-Warrior Badge', value: 89 },
    { name: 'Homework Pass', value: 64 },
    { name: 'Cafeteria Voucher', value: 42 },
    { name: 'Plant-a-Tree Cert.', value: 28 },
  ];

  const maxDist = Math.max(...distribution.map(d => d.value));

  const monthlyTrend = [15000, 18000, 22000, 26000, 32000, 40000];
  const maxTrend = Math.max(...monthlyTrend);

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
            {distribution.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center">
                <span className="text-sm text-[#3e5f44]">
                  {item.name}
                </span>

                <div className="flex items-center gap-3 w-1/2">
                  <div className="flex-1 h-3 bg-[#edf2ea] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#7faa72]"
                      style={{ width: `${(item.value / maxDist) * 100}%` }}
                    />
                  </div>

                  <span className="text-xs font-semibold text-[#3e5f44] w-10 text-right">
                    {item.value}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Trend */}
        <div className="bg-white p-6 rounded-3xl border border-[#dbe6db] shadow-sm">
          <h3 className="text-lg font-bold text-[#3e5f44] mb-4">
            Redemption Statistics
          </h3>

          <div className="h-[220px] flex items-end justify-between gap-3">
            {monthlyTrend.map((value, idx) => (
              <div key={idx} className="flex flex-col items-center flex-1">
                <div
                  className="w-full bg-[#7faa72] rounded-t-xl"
                  style={{
                    height: `${(value / maxTrend) * 200}px`,
                  }}
                />
                <span className="text-xs text-[#6f876f] mt-2">
                  {['Jan','Feb','Mar','Apr','May','Jun'][idx]}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Chart */}
      <div className="bg-white p-6 rounded-3xl border border-[#dbe6db] shadow-sm">
        <h3 className="text-lg font-bold text-[#3e5f44] mb-4">
          Incentive Performance Metrics
        </h3>

        <div className="h-[260px] flex items-end justify-between gap-4">
          {monthlyTrend.map((value, idx) => (
            <div key={idx} className="flex flex-col items-center flex-1">
              <div
                className="w-full bg-[#3e5f44] rounded-t-xl"
                style={{
                  height: `${(value / maxTrend) * 240}px`,
                }}
              />
              <span className="text-xs text-[#6f876f] mt-2">
                {['Jan','Feb','Mar','Apr','May','Jun'][idx]}
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
  const { students, rewards, addRedemption, refreshStudents, refreshRewards } = useData();
  const [step, setStep] = useState(1); // 1: Scan student, 2: Select reward, 3: Confirm
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedReward, setSelectedReward] = useState(null);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('info');
  const [scanning, setScanning] = useState(false);

  // Calculate total points for a student
  const calculateStudentPoints = (student) => {
    return student.points_balance || student.points || 0;
  };

  // Simulate RFID scan - in real setup, this would receive data from ESP32
  const simulateScan = () => {
    setScanning(true);
    setMessage('Scanning RFID card...');
    setMessageType('info');
    
    setTimeout(() => {
      const randomStudent = students.length > 0 
        ? students[Math.floor(Math.random() * students.length)] 
        : null;
      
      if (randomStudent) {
        setSelectedStudent(randomStudent);
        setStep(2);
        setMessage(`Student found: ${randomStudent.first_name || ''} ${randomStudent.last_name || ''}`);
        setMessageType('success');
      } else {
        setMessage('No students found. Please add students first.');
        setMessageType('error');
      }
      setScanning(false);
    }, 1500);
  };

  // Simulate confirmation scan
  const confirmRedemption = () => {
    setScanning(true);
    setMessage('Confirming redemption...');
    
    setTimeout(async () => {
      try {
        // Submit redemption to API
        await addRedemption({
          student_id: selectedStudent.id || selectedStudent.student_id,
          reward_id: selectedReward.id || selectedReward.reward_id,
          points: selectedReward.points || selectedReward.points_cost || selectedReward.points_required
        });
        
        // Refresh data
        await refreshStudents();
        await refreshRewards();
        
        setStep(4);
        setMessage('Redemption successful!');
        setMessageType('success');
      } catch (error) {
        console.error('Redemption error:', error);
        setMessage('Redemption failed. Please try again.');
        setMessageType('error');
      }
      setScanning(false);
    }, 1500);
  };

  // Reset flow
  const resetFlow = () => {
    setStep(1);
    setSelectedStudent(null);
    setSelectedReward(null);
    setMessage('');
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-[#dbe6db] shadow-sm">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-[#3e5f44]">
          Redemption Terminal
        </h2>
        {step !== 1 && (
          <button
            onClick={resetFlow}
            className="bg-[#e8f5bd] text-[#3e5f44] px-4 py-2 rounded-xl text-sm font-semibold"
          >
            ← Back to Start
          </button>
        )}
      </div>

      {/* Status Message */}
      {message && (
        <div className={`mb-6 p-4 rounded-xl ${
          messageType === 'success' ? 'bg-green-100 text-green-700' :
          messageType === 'error' ? 'bg-red-100 text-red-700' :
          'bg-blue-100 text-blue-700'
        }`}>
          {message}
        </div>
      )}

      {/* Step 1: Scan Student */}
      {step === 1 && (
        <div className="text-center py-12">
          <div className="w-32 h-32 mx-auto bg-[#e8f5bd] rounded-full flex items-center justify-center mb-6">
            <i className="fa-solid fa-id-card-clip text-5xl text-[#3e5f44]" />
          </div>
          <h3 className="text-xl font-bold text-[#3e5f44] mb-3">
            Scan Student RFID Card
          </h3>
          <p className="text-[#6f876f] mb-8 max-w-md mx-auto">
            Hold the student's RFID card near the scanner to begin
          </p>
          <button
            onClick={simulateScan}
            disabled={scanning}
            className={`px-8 py-4 rounded-2xl text-white font-semibold text-lg ${
              scanning 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-[#3e5f44] hover:bg-[#4a6e50]'
            }`}
          >
            {scanning ? (
              <span><i className="fa-solid fa-spinner fa-spin mr-2" /> Scanning...</span>
            ) : (
              <span><i className="fa-solid fa-walkie-talkie mr-2" /> Start Scan</span>
            )}
          </button>
        </div>
      )}

      {/* Step 2: Select Reward */}
      {step === 2 && selectedStudent && (
        <div>
          {/* Student Info Card */}
          <div className="bg-[#e8f5bd] rounded-2xl p-6 mb-8">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-2xl font-bold text-[#3e5f44]">
                {(selectedStudent.first_name?.[0] || 'S') + (selectedStudent.last_name?.[0] || '')}
              </div>
              <div>
                <h4 className="text-lg font-bold text-[#3e5f44]">
                  {selectedStudent.first_name || ''} {selectedStudent.last_name || ''}
                </h4>
                <p className="text-sm text-[#6f876f]">
                  Grade {selectedStudent.grade_level || '3'} • {selectedStudent.section || 'N/A'}
                </p>
              </div>
              <div className="ml-auto text-right">
                <div className="text-2xl font-bold text-[#3e5f44]">
                  {calculateStudentPoints(selectedStudent)} points
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
                const studentPoints = calculateStudentPoints(selectedStudent);
                const rewardPoints = reward.points || reward.points_cost || reward.points_required;
                const canAfford = studentPoints >= rewardPoints;
                
                return (
                  <div
                    key={reward.id || reward.reward_id}
                    onClick={() => canAfford && setSelectedReward(reward)}
                    className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                      selectedReward?.id === reward.id || selectedReward?.reward_id === reward.reward_id
                        ? 'border-[#3e5f44] bg-[#e8f5bd]'
                        : canAfford
                          ? 'border-[#dbe6db] hover:border-[#3e5f44]'
                          : 'border-[#e0e0e0] bg-gray-50 opacity-60 cursor-not-allowed'
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

          {selectedReward && (
            <div className="mt-8 flex justify-center">
              <button
                onClick={() => setStep(3)}
                className="bg-[#3e5f44] text-white px-8 py-3 rounded-xl font-semibold"
              >
                Continue →
              </button>
            </div>
          )}
        </div>
      )}

      {/* Step 3: Confirm Redemption */}
      {step === 3 && selectedStudent && selectedReward && (
        <div className="text-center py-8">
          <div className="bg-[#e8f5bd] rounded-2xl p-8 max-w-lg mx-auto mb-8">
            <h4 className="text-lg font-bold text-[#3e5f44] mb-4">Confirm Redemption</h4>
            <div className="space-y-3 text-left">
              <div className="flex justify-between">
                <span className="text-[#6f876f]">Student:</span>
                <span className="font-semibold text-[#3e5f44]">
                  {selectedStudent.first_name || ''} {selectedStudent.last_name || ''}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6f876f]">Reward:</span>
                <span className="font-semibold text-[#3e5f44]">{selectedReward.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6f876f]">Points to deduct:</span>
                <span className="font-semibold text-[#3e5f44]">
                  {selectedReward.points || selectedReward.points_cost || selectedReward.points_required}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-[#3e5f44]/20">
                <span className="text-[#6f876f]">Remaining balance:</span>
                <span className="font-bold text-[#3e5f44]">
                  {(calculateStudentPoints(selectedStudent) - (selectedReward.points || selectedReward.points_cost || selectedReward.points_required))} points
                </span>
              </div>
            </div>
          </div>
          
          <p className="text-[#6f876f] mb-6">
            Scan the card again to confirm redemption
          </p>
          
          <button
            onClick={confirmRedemption}
            disabled={scanning}
            className={`px-8 py-4 rounded-2xl text-white font-semibold text-lg ${
              scanning 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-[#3e5f44] hover:bg-[#4a6e50]'
            }`}
          >
            {scanning ? (
              <span><i className="fa-solid fa-spinner fa-spin mr-2" /> Processing...</span>
            ) : (
              <span><i className="fa-solid fa-check mr-2" /> Confirm & Redeem</span>
            )}
          </button>
        </div>
      )}

      {/* Step 4: Success */}
      {step === 4 && (
        <div className="text-center py-12">
          <div className="w-32 h-32 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-6">
            <i className="fa-solid fa-check text-5xl text-green-700" />
          </div>
          <h3 className="text-2xl font-bold text-[#3e5f44] mb-3">
            Redemption Complete!
          </h3>
          <p className="text-[#6f876f] mb-8">
            {selectedStudent?.first_name || 'Student'} has redeemed {selectedReward?.name}
          </p>
          <button
            onClick={resetFlow}
            className="bg-[#3e5f44] text-white px-8 py-4 rounded-2xl font-semibold text-lg"
          >
            Start New Redemption
          </button>
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
