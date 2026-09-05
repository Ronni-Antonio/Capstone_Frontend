import { useState, useEffect } from 'react';
import api from '../api';
import { useData } from '../context/DataContext.jsx';
import {
  ListOrderedIcon,
  CircleCheckIcon,
  BellIcon,
  CircleXIcon,
  DownloadIcon,
  CoinsIcon,
  CircleDollarSignIcon,
  GiftIcon,
  StarIcon,
  BoxIcon,
  TrendingUpIcon,
  AlertCircleIcon,
  RefreshCwIcon,
  Loader2Icon,
} from 'lucide-react';

const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];

/* ===================== REWARDS TAB ===================== */
function RewardsTab() {
  const { rewards, refreshRewards } = useData();
  const [showModal, setShowModal] = useState(false);
  /* PRICE ADD START - local price field added to newReward state */
  const [newReward, setNewReward] = useState({
    reward_name: '',
    points_cost: '',
    stock_quantity: '',
    price: ''
  });
  /* PRICE ADD END */
  const [modalError, setModalError] = useState(null);
  const [modalSuccess, setModalSuccess] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2500);
  };

  /* Action button handlers */
  const handleEdit = (reward) => {
    showToast(`Edit reward: ${reward.name}`, 'info');
    console.log('Edit reward clicked:', reward);
  };

  const handleToggleStatus = async (reward) => {
    const newStatus = reward.status === 'Active' ? 'Inactive' : 'Active';
    showToast(`${reward.name} ${newStatus === 'Active' ? 'activated' : 'deactivated'}`, 'success');
    console.log('Toggle status clicked:', reward.name, '→', newStatus);
  };

  const handleDelete = (reward) => {
    const confirmed = window.confirm(`Delete reward "${reward.name}"? This cannot be undone.`);
    if (confirmed) {
      showToast(`${reward.name} deleted`, 'error');
      console.log('Delete reward confirmed:', reward);
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
      // Backend requires unit_price
      if (newReward.price === '' || newReward.price === null || newReward.price === undefined) {
        setModalError('The unit price field is required.');
        return;
      }
      if (Number(newReward.price) < 0 || Number.isNaN(Number(newReward.price))) {
        setModalError('Please enter a valid unit price');
        return;
      }

      // Send to API using backend-expected field names
      const rewardData = {
        reward_name: newReward.reward_name.trim(),
        points_cost: Number(newReward.points_cost),
        points_value: Number(newReward.points_cost),
        stock_quantity: Number(newReward.stock_quantity),
        stocks: Number(newReward.stock_quantity),
        unit_price: Number(newReward.price),
        price: Number(newReward.price),
      };

      await api.addReward(rewardData);
      setModalSuccess('Reward created successfully!');

      // Reset form and close modal after a delay
      setTimeout(() => {
        setShowModal(false);
        setNewReward({ reward_name: '', points_cost: '', stock_quantity: '', price: '' });
        setModalSuccess(null);
        refreshRewards();
      }, 1500);
    } catch (error) {
      console.error('❌ Error creating reward:', error);
      const data = error?.response?.data;
      const msg =
        data?.message ||
        (data?.errors && Object.values(data.errors).flat().join(' ')) ||
        data?.error ||
        error?.message ||
        'Failed to create reward';
      setModalError(msg);
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

              {/* PRICE ADD START - price input field (not shown in rewards table, only for inventory) */}
              <div>
                <label className="block text-sm font-medium text-[#6f876f] mb-1">
                  Price (₱)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={newReward.price}
                  onChange={(e) => setNewReward({ ...newReward, price: e.target.value })}
                  className="w-full border border-[#dbe6db] rounded-xl px-4 py-3 outline-none focus:border-[#3e5f44]"
                  placeholder="Enter item price (for inventory tracking)"
                />
              </div>
              {/* PRICE ADD END */}
              
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    /* PRICE ADD START - reset price on cancel too */
                    setNewReward({ reward_name: '', points_cost: '', stock_quantity: '', price: '' });
                    /* PRICE ADD END */
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
                <button
                  onClick={() => handleEdit(r)}
                  className="text-xs px-3 py-1 rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
                >
                  Edit
                </button>

                <button
                  onClick={() => handleToggleStatus(r)}
                  className="text-xs px-3 py-1 rounded-lg bg-yellow-100 text-yellow-700 hover:bg-yellow-200 transition-colors"
                >
                  {r.status === 'Active' ? 'Deactivate' : 'Activate'}
                </button>

                <button
                  onClick={() => handleDelete(r)}
                  className="text-xs px-3 py-1 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Toast notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-pulse">
          <div
            className={`px-5 py-3 rounded-xl shadow-lg border text-sm font-semibold ${
              toast.type === 'success'
                ? 'bg-green-50 border-green-200 text-green-800'
                : toast.type === 'error'
                ? 'bg-red-50 border-red-200 text-red-800'
                : 'bg-blue-50 border-blue-200 text-blue-800'
            }`}
          >
            {toast.message}
          </div>
        </div>
      )}
    </div>
  );
}

/* ===================== INVENTORY TAB START ===================== */
function InventoryTab() {
  const { rewards, refreshRewards } = useData();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const formatLastStock = (timestamp) => {
    if (!timestamp) return '—';
    try {
      const d = new Date(timestamp.replace(' ', 'T'));
      if (Number.isNaN(d.getTime())) return '—';
      const dateStr = d.toLocaleDateString('en-US', {
        month: 'numeric',
        day: 'numeric',
        year: 'numeric',
      });
      const timeStr = d.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
      return `${dateStr} ${timeStr}`;
    } catch {
      return '—';
    }
  };

  useEffect(() => {
    let mounted = true;
    let cancelled = false;
    const load = async () => {
      if (cancelled) return;
      setIsLoading(true);
      setError(null);
      try {
        await refreshRewards();
        if (mounted && !cancelled) {
          setIsLoading(false);
        }
      } catch (err) {
        console.error('❌ Error loading inventory data:', err);
        if (mounted && !cancelled) {
          const msg =
            err?.response?.data?.message ||
            err?.response?.data?.error ||
            err?.message ||
            'Failed to load inventory data';
          setError(msg);
          setIsLoading(false);
        }
      }
    };
    load();
    return () => { mounted = false; cancelled = true; };
  }, []);

  const inventoryItems = rewards.map((r, idx) => {
    const stocksInHand = Number(r.stock ?? r.stocks ?? r.stock_quantity ?? 0);
    const unitPrice = r.unit_price ?? r.price ?? null;
    const unitPriceNum = unitPrice !== null && unitPrice !== undefined ? Number(unitPrice) : 0;
    const totalPrice = unitPriceNum > 0 ? stocksInHand * unitPriceNum : 0;
    const pointsValue = Number(r.points_value ?? r.points_cost ?? r.points ?? 0);
    const lastStockFormatted = formatLastStock(r.last_restock ?? null);

    return {
      id: r.id || r.reward_id || idx,
      name: r.reward_name || r.name || 'Unnamed Reward',
      stocksInHand,
      unitPrice: unitPriceNum,
      unitPriceDisplay: unitPrice !== null && unitPrice !== undefined && unitPriceNum > 0
        ? `₱${unitPriceNum.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
        : '—',
      totalPrice,
      totalPriceDisplay: totalPrice > 0
        ? `₱${totalPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
        : '—',
      pointsValue,
      lastStock: r.last_restock ?? null,
      lastStockFormatted,
      status:
        stocksInHand === 0
          ? 'Out of Stock'
          : stocksInHand < 10
          ? 'Low Stock'
          : r.status === 'Active'
          ? 'In Stock'
          : 'Inactive',
    };
  });

  const lowStockCount = inventoryItems.filter(
    (i) => i.stocksInHand > 0 && i.stocksInHand < 10
  ).length;
  const outOfStockCount = inventoryItems.filter((i) => i.stocksInHand === 0).length;
  const totalStockValue = inventoryItems.reduce(
    (sum, i) => sum + i.stocksInHand * i.pointsValue,
    0
  );
  const totalMonetaryValue = inventoryItems.reduce(
    (sum, i) => sum + i.totalPrice,
    0
  );

  if (error) {
    return (
      <div className="bg-white rounded-3xl border border-[#dbe6db] shadow-sm p-12 text-center">
        <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-5">
          <AlertCircleIcon className="w-8 h-8 text-red-500" />
        </div>
        <h3 className="text-lg font-bold text-[#3e5f44] mb-2">Unable to load inventory</h3>
        <p className="text-sm text-[#8da28e] mb-5 max-w-md mx-auto">{error}</p>
        <button
          onClick={() => {
            setIsLoading(true);
            setError(null);
            refreshRewards()
              .then(() => setIsLoading(false))
              .catch((err) => {
                setError(err.response?.data?.message || err.message || 'Failed to load inventory data');
                setIsLoading(false);
              });
          }}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#3e5f44] text-white font-semibold text-sm hover:bg-[#5a7c61] transition-colors"
        >
          <RefreshCwIcon className="w-4 h-4" />
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Inventory summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white rounded-3xl p-6 border border-[#dbe6db] shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <div className="w-11 h-11 rounded-xl bg-[#EBF5E4] border-2 border-[#A2CB8B] flex items-center justify-center">
              <ListOrderedIcon className="w-5 h-5 text-[#2F5D3A]" />
            </div>
          </div>
          <p className="text-sm text-[#7a947e]">Total Items</p>
          <h2 className="text-4xl font-bold text-[#3e5f44]">
            {isLoading ? (
              <Loader2Icon className="w-7 h-7 animate-spin opacity-50 inline-block" />
            ) : (
              inventoryItems.length.toLocaleString()
            )}
          </h2>
          <p className="text-xs text-[#94a894] mt-2">Tracked rewards</p>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-[#dbe6db] shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <div className="w-11 h-11 rounded-xl bg-[#EBF5E4] border-2 border-[#A2CB8B] flex items-center justify-center">
              <CircleCheckIcon className="w-5 h-5 text-[#2F5D3A]" />
            </div>
          </div>
          <p className="text-sm text-[#7a947e]">Total Units</p>
          <h2 className="text-4xl font-bold text-[#3e5f44]">
            {isLoading ? (
              <Loader2Icon className="w-7 h-7 animate-spin opacity-50 inline-block" />
            ) : (
              inventoryItems
                .reduce((sum, i) => sum + i.stocksInHand, 0)
                .toLocaleString()
            )}
          </h2>
          <p className="text-xs text-[#94a894] mt-2">In inventory</p>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-[#dbe6db] shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <div className="w-11 h-11 rounded-xl bg-[#EBF5E4] border-2 border-[#A2CB8B] flex items-center justify-center">
              <BellIcon className="w-5 h-5 text-[#2F5D3A]" />
            </div>
          </div>
          <p className="text-sm text-[#7a947e]">Low Stock</p>
          <h2 className="text-4xl font-bold text-amber-700">
            {isLoading ? (
              <Loader2Icon className="w-7 h-7 animate-spin opacity-50 inline-block" />
            ) : (
              lowStockCount
            )}
          </h2>
          <p className="text-xs text-[#94a894] mt-2">Below threshold</p>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-[#dbe6db] shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <div className="w-11 h-11 rounded-xl bg-[#EBF5E4] border-2 border-[#A2CB8B] flex items-center justify-center">
              <CircleXIcon className="w-5 h-5 text-[#2F5D3A]" />
            </div>
          </div>
          <p className="text-sm text-[#7a947e]">Out of Stock</p>
          <h2 className="text-4xl font-bold text-red-700">
            {isLoading ? (
              <Loader2Icon className="w-7 h-7 animate-spin opacity-50 inline-block" />
            ) : (
              outOfStockCount
            )}
          </h2>
          <p className="text-xs text-[#94a894] mt-2">Needs restock</p>
        </div>
      </div>

      {/* Inventory table container */}
      <div className="bg-white rounded-3xl p-6 border border-[#dbe6db] shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-xl font-bold text-[#3e5f44]">Inventory Items</h3>
            <p className="text-sm text-[#8da28e] mt-1">
              Stock levels synced from rewards catalog
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <input
              type="text"
              placeholder="Search inventory..."
              className="border border-[#dbe6db] rounded-xl px-4 py-2 outline-none text-sm"
            />

            <select className="border border-[#dbe6db] rounded-xl px-4 py-2 outline-none text-sm text-[#3e5f44] bg-white">
              <option>All Categories</option>
              <option>Reward Items</option>
              <option>School Supplies</option>
            </select>

            <button className="bg-[#e8f5bd] text-[#3e5f44] px-4 py-2 rounded-xl text-sm font-semibold">
              <DownloadIcon className="w-4 h-4 inline mr-2" />
              Export
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[#011400] border-b">
                <th className="py-3 font-semibold uppercase text-xs tracking-wider">
                  Reward
                </th>
                <th className="py-3 font-semibold uppercase text-xs tracking-wider text-right">
                  Stocks in Hand
                </th>
                <th className="py-3 font-semibold uppercase text-xs tracking-wider text-right">
                  Unit Price
                </th>
                <th className="py-3 font-semibold uppercase text-xs tracking-wider text-right">
                  Total Price
                </th>
                <th className="py-3 font-semibold uppercase text-xs tracking-wider text-right">
                  Points Value
                </th>
                <th className="py-3 font-semibold uppercase text-xs tracking-wider">
                  Last Stock
                </th>
              </tr>
            </thead>

            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan="6" className="py-16 text-center">
                    <div className="inline-flex flex-col items-center gap-3">
                      <Loader2Icon className="w-8 h-8 animate-spin text-[#3e5f44]" />
                      <span className="text-sm text-[#011400]">Loading inventory…</span>
                    </div>
                  </td>
                </tr>
              )}
              {!isLoading && inventoryItems.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="py-10 text-center text-[#011400]"
                  >
                    No inventory items found
                  </td>
                </tr>
              ) : (
                !isLoading && inventoryItems.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b hover:bg-[#fcfcf7] transition-colors"
                  >
                    <td className="py-3 text-[#011400] font-medium">
                      {item.name}
                    </td>
                    <td
                      className={`py-3 text-right font-bold ${
                        item.stocksInHand === 0
                          ? 'text-red-700'
                          : item.stocksInHand < 10
                          ? 'text-amber-700'
                          : 'text-[#011400]'
                      }`}
                    >
                      {item.stocksInHand.toLocaleString()}
                    </td>
                    <td className="py-3 text-right text-[#5a7c61] font-semibold whitespace-nowrap">
                      {item.unitPriceDisplay}
                    </td>
                    <td className="py-3 text-right text-[#5a7c61] font-semibold whitespace-nowrap">
                      {item.totalPriceDisplay}
                    </td>
                    <td className="py-3 text-right text-[#5a7c61] font-semibold whitespace-nowrap">
                      {item.pointsValue.toLocaleString()} pts
                    </td>
                    <td className="py-3 text-[#011400] text-xs whitespace-nowrap">
                      {item.lastStockFormatted}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between pt-4 mt-4 border-t border-[#dbe6db]">
          <p className="text-xs text-[#011400]">
            Showing{' '}
            <span className="font-semibold text-[#011400]">{isLoading ? '—' : (inventoryItems.length ? 1 : 0)}</span> –{' '}
            <span className="font-semibold text-[#011400]">
              {isLoading ? '—' : inventoryItems.length}
            </span>{' '}
            of{' '}
            <span className="font-semibold text-[#011400]">
              {isLoading ? '—' : inventoryItems.length}
            </span>{' '}
            inventory items
          </p>
          <div className="flex items-center gap-2">
            <button className="w-8 h-8 rounded-lg bg-white border border-[#dbe6db] text-[#011400] hover:bg-[#e8f5bd] disabled:opacity-40 flex items-center justify-center text-xs">
              ←
            </button>
            <span className="text-sm font-semibold text-[#011400] px-2">
              Page 1 of 1
            </span>
            <button className="w-8 h-8 rounded-lg bg-white border border-[#dbe6db] text-[#011400] hover:bg-[#e8f5bd] disabled:opacity-40 flex items-center justify-center text-xs">
              →
            </button>
          </div>
        </div>
      </div>

      {/* Stock value summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-white rounded-3xl p-6 border border-[#dbe6db] shadow-sm">
          <h3 className="text-lg font-bold text-[#3e5f44] mb-4">
            Inventory Value by Points
          </h3>
          <p className="text-sm text-[#8da28e] mb-6">
            Total value of inventory held in points equivalent
          </p>
          <div className="flex items-end gap-4">
            <div>
              <p className="text-sm text-[#7a947e]">Total Points Value</p>
              <p className="text-4xl font-bold text-[#3e5f44]">
                {isLoading ? (
                  <Loader2Icon className="w-8 h-8 animate-spin opacity-50 inline-block" />
                ) : (
                  totalStockValue.toLocaleString()
                )}
              </p>
              <p className="text-xs text-[#94a894] mt-1">points equivalent</p>
            </div>
            <div className="ml-auto">
              <div className="w-20 h-20 rounded-xl bg-[#EBF5E4] border-2 border-[#A2CB8B] flex items-center justify-center">
                <CoinsIcon className="w-8 h-8 text-[#2F5D3A]" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-[#dbe6db] shadow-sm">
          <h3 className="text-lg font-bold text-[#3e5f44] mb-4">
            Inventory Value (Monetary)
          </h3>
          <p className="text-sm text-[#8da28e] mb-6">
            Total cost value of inventory based on unit price
          </p>
          <div className="flex items-end gap-4">
            <div>
              <p className="text-sm text-[#7a947e]">Total Monetary Value</p>
              <p className="text-4xl font-bold text-[#3e5f44]">
                {isLoading ? (
                  <Loader2Icon className="w-8 h-8 animate-spin opacity-50 inline-block" />
                ) : (
                  <>₱{totalMonetaryValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</>
                )}
              </p>
              <p className="text-xs text-[#94a894] mt-1">Philippine Peso (₱)</p>
            </div>
            <div className="ml-auto">
              <div className="w-20 h-20 rounded-xl bg-[#EBF5E4] border-2 border-[#A2CB8B] flex items-center justify-center">
                <CircleDollarSignIcon className="w-8 h-8 text-[#2F5D3A]" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-[#dbe6db] shadow-sm md:col-span-2">
          <h3 className="text-lg font-bold text-[#3e5f44] mb-4">
            Stock Health Overview
          </h3>
          <p className="text-sm text-[#8da28e] mb-6">
            Summary of stock status distribution
          </p>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-[#3e5f44]">In Stock</span>
                <span className="font-semibold text-[#3e5f44]">
                  {isLoading ? '—' : inventoryItems.filter((i) => i.status === 'In Stock').length}
                </span>
              </div>
              <div className="h-3 bg-[#edf2ea] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#7faa72]"
                  style={{
                    width: `${
                      !isLoading && inventoryItems.length > 0
                        ? (inventoryItems.filter((i) => i.status === 'In Stock')
                            .length /
                            inventoryItems.length) *
                          100
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-[#3e5f44]">Low Stock</span>
                <span className="font-semibold text-amber-700">
                  {isLoading ? '—' : lowStockCount}
                </span>
              </div>
              <div className="h-3 bg-[#edf2ea] rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-400"
                  style={{
                    width: `${
                      !isLoading && inventoryItems.length > 0
                        ? (lowStockCount / inventoryItems.length) * 100
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-[#3e5f44]">Out of Stock</span>
                <span className="font-semibold text-red-700">
                  {isLoading ? '—' : outOfStockCount}
                </span>
              </div>
              <div className="h-3 bg-[#edf2ea] rounded-full overflow-hidden">
                <div
                  className="h-full bg-red-400"
                  style={{
                    width: `${
                      !isLoading && inventoryItems.length > 0
                        ? (outOfStockCount / inventoryItems.length) * 100
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
/* ===================== INVENTORY TAB END ===================== */

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

/* ===================== MAIN COMPONENT ===================== */
export default function IncentivesRewards() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { rewards: dashboardRewards, refreshRewards, refreshRedemptions, refreshStudents } = useData();

  useEffect(() => {
    Promise.allSettled([refreshRewards(), refreshRedemptions(), refreshStudents()]);
  }, []);

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
      Icon: GiftIcon,
    },
    {
      title: 'Active Rewards',
      value: dashboardRewards
        .filter((reward) => reward.status === 'Active')
        .length.toLocaleString(),
      sub: 'Currently available',
      Icon: StarIcon,
    },
    {
      title: 'Total Stock',
      value: totalStock.toLocaleString(),
      sub: 'Units in inventory',
      Icon: BoxIcon,
    },
    {
      title: 'Average Points Cost',
      value: averagePoints.toLocaleString(),
      sub: 'Points per reward',
      Icon: TrendingUpIcon,
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

      {/* Tabs (INVENTORY START - inventory tab added after rewards) */}
      <div className="bg-white rounded-2xl p-2 inline-flex gap-2 shadow-sm border border-[#dbe6db]">
        {['dashboard', 'rewards', 'inventory', 'reports'].map(
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
      {/* Tabs INVENTORY END */}

      {activeTab === 'dashboard' && (
        <>
          <div className="grid grid-cols-4 gap-5">
            {dashboardStats.map((card) => (
              <div
                key={card.title}
                className="bg-white rounded-3xl p-6 shadow-sm border border-[#dbe6db]"
              >
                <div className="flex justify-between items-center mb-4">
                  <div className="w-11 h-11 rounded-xl bg-[#EBF5E4] border-2 border-[#A2CB8B] flex items-center justify-center">
                    <card.Icon className="w-5 h-5 text-[#2F5D3A]" />
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

      {activeTab === 'rewards' && <RewardsTab />}
      {/* INVENTORY START - inventory tab render */}
      {activeTab === 'inventory' && <InventoryTab />}
      {/* INVENTORY END */}
      {activeTab === 'reports' && <ReportsTab />}

    </div>
  );
}
