import React, { useState, useEffect } from 'react';
import api from '../api';

/* ===================== DASHBOARD DATA ===================== */
const stats = [
  {
    title: 'Total Incentives Distributed',
    value: '1,248',
    sub: 'vs. last month',
    icon: 'fa-gift',
    badge: '+15%',
  },
  {
    title: 'Active Rewards',
    value: '12',
    sub: '',
    icon: 'fa-star',
  },
  {
    title: 'Pending Redemptions',
    value: '2',
    sub: '',
    icon: 'fa-ticket',
  },
  {
    title: 'Points Redeemed (MTD)',
    value: '45,200',
    sub: 'vs. last month',
    icon: 'fa-arrow-trend-up',
    badge: '+8%',
  },
];

const popularRewards = [
    { name: 'Extra Recess Time', count: 92 },
    { name: 'Eco-Warrior Badge', count: 60 },
    { name: 'Homework Pass', count: 42 },
    { name: 'Cafeteria Voucher', count: 28 },
];

const trendData = [12, 18, 15, 22, 30, 5, 8];

/* ===================== REWARDS TAB ===================== */
function RewardsTab() {
  const [rewards, setRewards] = useState([]);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [newReward, setNewReward] = useState({
    reward_name: '',
    points_cost: '',
    stock_quantity: ''
  });
  const [modalError, setModalError] = useState(null);
  const [modalSuccess, setModalSuccess] = useState(null);

  const fetchRewards = async () => {
    try {
      setError(null);
      const res = await api.getRewards();
      
      // Try to get data from common response structures
      let rawRewards = res.data?.rewards || res.data?.data || res.data || [];
      
      // Make sure it's an array
      if (!Array.isArray(rawRewards)) {
        rawRewards = [];
      }
      
      // Map the API fields to the UI fields
      const rewardsData = rawRewards.map(r => ({
        id: r.reward_id || r.id,
        name: r.reward_name || r.name,
        points: r.points_cost || r.points || r.points_required,
        stock: r.stock_quantity || r.stock,
        status: r.status || 'Active' // Default to Active if no status
      }));
      
      setRewards(rewardsData);
    } catch (error) {
      setError(error.response?.data?.message || error.message || 'Failed to load rewards');
    }
  };

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
        fetchRewards(); // Refresh the list
      }, 1500);
    } catch (error) {
      console.error('❌ Error creating reward:', error);
      setModalError(error.response?.data?.message || error.message || 'Failed to create reward');
    }
  };

  useEffect(() => {
    fetchRewards();
  }, []);

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

      {error && (
        <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-xl">
          ❌ {error}
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
          {rewards.length === 0 && !error && (
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

/* ===================== PROGRAMS TAB ===================== */
function ProgramsTab() {
  const programs = [
    {
      name: 'Perfect Attendance Challenge',
      status: 'Active',
      criteria: 'No absences for 30 days',
      reward: 'Extra Recess Time',
      end: 'July 30, 2026',
    },
    {
      name: 'Reading Mastery Program',
      status: 'Inactive',
      criteria: 'Read 10 books per month',
      reward: 'Homework Pass',
      end: 'August 15, 2026',
    },
    {
      name: 'Eco Warriors Campaign',
      status: 'Active',
      criteria: 'Bring recyclable materials weekly',
      reward: 'Eco-Warrior Badge',
      end: 'September 10, 2026',
    },
  ];

  return (
    <div className="bg-white rounded-3xl p-6 border border-[#dbe6db] shadow-sm">

      <div className="flex justify-end mb-6">
        <button className="bg-[#3e5f44] text-white px-5 py-2 rounded-xl text-sm font-semibold">
          + Create Program
        </button>
      </div>

      <div className="grid grid-cols-3 gap-5">
        {programs.map((p, idx) => (
          <div
            key={idx}
            className="relative bg-[#f7f8f3] border border-[#dbe6db] rounded-3xl p-5 shadow-sm"
          >
            <div className="absolute top-4 right-4 flex gap-2">
              <button className="text-xs px-2 py-1 rounded-lg bg-blue-100 text-blue-700">
                Edit
              </button>
              <button className="text-xs px-2 py-1 rounded-lg bg-red-100 text-red-700">
                Delete
              </button>
            </div>

            <h3 className="text-lg font-bold text-[#3e5f44] pr-16">
              {p.name}
            </h3>

            <div className="mt-2 mb-4">
              <span
                className={`text-xs px-3 py-1 rounded-full font-semibold ${
                  p.status === 'Active'
                    ? 'bg-[#e8f5bd] text-[#3e5f44]'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {p.status}
              </span>
            </div>

            <div className="space-y-2 text-sm text-[#6f876f]">
              <p><b className="text-[#3e5f44]">Criteria:</b> {p.criteria}</p>
              <p><b className="text-[#3e5f44]">Reward:</b> {p.reward}</p>
              <p><b className="text-[#3e5f44]">Ends:</b> {p.end}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ===================== REDEMPTIONS TAB ===================== */
function RedemptionsTab() {
  const requests = [
    {
      student: 'Juan Dela Cruz',
      reward: 'Extra Recess Time',
      points: 50,
      date: '2026-06-10',
      status: 'Pending',
    },
    {
      student: 'Maria Santos',
      reward: 'Homework Pass',
      points: 100,
      date: '2026-06-12',
      status: 'Approved',
    },
    {
      student: 'Miguel Reyes',
      reward: 'Cafeteria Voucher',
      points: 75,
      date: '2026-06-13',
      status: 'Rejected',
    },
  ];

  return (
    <div className="bg-white rounded-3xl p-6 border border-[#dbe6db] shadow-sm">

      <h2 className="text-xl font-bold text-[#3e5f44] mb-6">
        Redemption Requests
      </h2>

      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-[#6f876f] border-b">
            <th className="py-3">Student</th>
            <th>Reward</th>
            <th>Points</th>
            <th>Date</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {requests.map((r, idx) => (
            <tr key={idx} className="border-b">

              <td className="py-3 text-[#3e5f44] font-medium">
                {r.student}
              </td>

              <td>{r.reward}</td>
              <td>{r.points}</td>
              <td>{r.date}</td>

              <td>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    r.status === 'Approved'
                      ? 'bg-[#e8f5bd] text-[#3e5f44]'
                      : r.status === 'Rejected'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}
                >
                  {r.status}
                </span>
              </td>

              <td className="space-x-2">
                {r.status === 'Pending' ? (
                  <>
                    <button className="text-xs px-3 py-1 rounded-lg bg-green-100 text-green-700">
                      Approve
                    </button>
                    <button className="text-xs px-3 py-1 rounded-lg bg-red-100 text-red-700">
                      Reject
                    </button>
                  </>
                ) : (
                  <span className="text-xs px-3 py-1 rounded-full bg-gray-200 text-gray-600 font-semibold">
                    Processed
                  </span>
                )}
              </td>

            </tr>
          ))}
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

/* ===================== MAIN COMPONENT ===================== */
export default function IncentivesRewards() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const max = Math.max(...trendData);

  return (
    <div className="space-y-6">

      {/* Tabs */}
      <div className="bg-white rounded-2xl p-2 inline-flex gap-2 shadow-sm border border-[#dbe6db]">
        {['dashboard', 'rewards', 'programs', 'redemptions', 'reports'].map(
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
            {stats.map((card) => (
              <div
                key={card.title}
                className="bg-white rounded-3xl p-6 shadow-sm border border-[#dbe6db]"
              >
                <div className="flex justify-between items-center mb-4">
                  <div className="w-11 h-11 rounded-2xl bg-[#e8f5bd] flex items-center justify-center">
                    <i className={`fa-solid ${card.icon} text-[#3e5f44]`} />
                  </div>

                  {card.badge && (
                    <div className="bg-[#e8f5bd] px-2 py-1 rounded-full text-xs font-bold text-[#3e5f44]">
                      {card.badge}
                    </div>
                  )}
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
                Redemption Trend
              </h3>
              <p className="text-sm text-[#8da28e] mb-8">
                Daily reward redemptions this week
              </p>

              <div className="h-[280px] flex items-end justify-between gap-4">
                {trendData.map((value, index) => (
                  <div key={index} className="flex flex-col items-center flex-1">
                    <div
                      className="w-full bg-[#7faa72] rounded-t-xl"
                      style={{ height: `${(value / max) * 220}px` }}
                    />
                    <span className="mt-3 text-xs text-[#6f876f]">
                      {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][index]}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-[#dbe6db] shadow-sm">
              <h3 className="text-xl font-bold text-[#3e5f44]">
                Most Popular Rewards
              </h3>
              <p className="text-sm text-[#8da28e] mb-8">
                Top redeemed items all-time
              </p>

              <div className="space-y-6">
                {popularRewards.map((reward) => (
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
                        style={{ width: `${reward.count}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === 'rewards' && <RewardsTab />}
      {activeTab === 'programs' && <ProgramsTab />}
      {activeTab === 'redemptions' && <RedemptionsTab />}
      {activeTab === 'reports' && <ReportsTab />}

    </div>
  );
}