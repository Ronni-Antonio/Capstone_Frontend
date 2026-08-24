import { useState, useEffect } from 'react';
import api from '../api';
import { useData } from '../context/DataContext.jsx';

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
      /* PRICE ADD START - validate price if provided */
      if (newReward.price !== '' && Number(newReward.price) < 0) {
        setModalError('Please enter a valid price');
        return;
      }
      /* PRICE ADD END */
      
      // Send to API
      const rewardData = {
        reward_name: newReward.reward_name.trim(),
        points_cost: Number(newReward.points_cost),
        stock_quantity: Number(newReward.stock_quantity),
        /* PRICE ADD START - include price in payload (for inventory/backend) */
        price: newReward.price !== '' ? Number(newReward.price) : null,
        /* PRICE ADD END */
      };
      
      await api.addReward(rewardData);
      setModalSuccess('Reward created successfully!');
      
      // Reset form and close modal after a delay
      setTimeout(() => {
        setShowModal(false);
        /* PRICE ADD START - include price in reset state */
        setNewReward({ reward_name: '', points_cost: '', stock_quantity: '', price: '' });
        /* PRICE ADD END */
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
  const { rewards } = useData();

  /* PRICE ADD START - include price field pulled from reward data for inventory display */
  const inventoryItems = rewards.map((r, idx) => ({
    id: r.id || r.reward_id || idx,
    sku: `SKU-${String(1000 + (r.id || r.reward_id || idx + 1)).padStart(4, '0')}`,
    name: r.name,
    category: 'Reward Items',
    currentStock: r.stock,
    minThreshold: 10,
    pointsCost: r.points || r.points_required || r.points_cost || 0,
    /* PRICE ADD START - price from reward data (hidden from rewards table, visible in inventory) */
    unitPrice: r.price || r.unit_price || 0,
    /* PRICE ADD END */
    status:
      r.stock === 0
        ? 'Out of Stock'
        : r.stock < 10
        ? 'Low Stock'
        : r.status === 'Active'
        ? 'In Stock'
        : 'Inactive',
    lastRestocked: 'Aug 10, 2025',
    supplier: 'School Supplies Co.',
  }));
  /* PRICE ADD END */

  const lowStockCount = inventoryItems.filter(
    (i) => i.currentStock > 0 && i.currentStock < i.minThreshold
  ).length;
  const outOfStockCount = inventoryItems.filter((i) => i.currentStock === 0).length;
  const totalStockValue = inventoryItems.reduce(
    (sum, i) => sum + i.currentStock * i.pointsCost,
    0
  );
  /* PRICE ADD START - compute total monetary value of inventory (unit price × stock) */
  const totalMonetaryValue = inventoryItems.reduce(
    (sum, i) => sum + i.currentStock * (Number(i.unitPrice) || 0),
    0
  );
  /* PRICE ADD END */

  const statusStyle = {
    'In Stock': 'bg-[#c7eabb] text-[#3e5f44]',
    'Low Stock': 'bg-amber-100 text-amber-800',
    'Out of Stock': 'bg-red-100 text-red-700',
    Inactive: 'bg-gray-200 text-gray-600',
  };

  return (
    <div className="space-y-6">
      {/* Inventory summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white rounded-3xl p-6 border border-[#dbe6db] shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <div className="w-11 h-11 rounded-2xl bg-[#e8f5bd] flex items-center justify-center">
              <i className="fa-solid fa-boxes-stacked text-[#3e5f44]" />
            </div>
          </div>
          <p className="text-sm text-[#7a947e]">Total SKUs</p>
          <h2 className="text-4xl font-bold text-[#3e5f44]">
            {inventoryItems.length.toLocaleString()}
          </h2>
          <p className="text-xs text-[#94a894] mt-2">Tracked items</p>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-[#dbe6db] shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <div className="w-11 h-11 rounded-2xl bg-[#c7eabb]/60 flex items-center justify-center">
              <i className="fa-solid fa-check-circle text-[#3e5f44]" />
            </div>
          </div>
          <p className="text-sm text-[#7a947e]">Total Units</p>
          <h2 className="text-4xl font-bold text-[#3e5f44]">
            {inventoryItems
              .reduce((sum, i) => sum + i.currentStock, 0)
              .toLocaleString()}
          </h2>
          <p className="text-xs text-[#94a894] mt-2">In inventory</p>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-[#dbe6db] shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <div className="w-11 h-11 rounded-2xl bg-amber-100 flex items-center justify-center">
              <i className="fa-solid fa-triangle-exclamation text-amber-700" />
            </div>
          </div>
          <p className="text-sm text-[#7a947e]">Low Stock</p>
          <h2 className="text-4xl font-bold text-amber-700">{lowStockCount}</h2>
          <p className="text-xs text-[#94a894] mt-2">Below threshold</p>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-[#dbe6db] shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <div className="w-11 h-11 rounded-2xl bg-red-100 flex items-center justify-center">
              <i className="fa-solid fa-circle-xmark text-red-700" />
            </div>
          </div>
          <p className="text-sm text-[#7a947e]">Out of Stock</p>
          <h2 className="text-4xl font-bold text-red-700">{outOfStockCount}</h2>
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
              <i className="fa-solid fa-file-export mr-2" />
              Export
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[#6f876f] border-b">
                <th className="py-3 font-semibold uppercase text-xs tracking-wider">
                  SKU
                </th>
                <th className="py-3 font-semibold uppercase text-xs tracking-wider">
                  Item Name
                </th>
                <th className="py-3 font-semibold uppercase text-xs tracking-wider">
                  Category
                </th>
                <th className="py-3 font-semibold uppercase text-xs tracking-wider text-right">
                  Current Stock
                </th>
                <th className="py-3 font-semibold uppercase text-xs tracking-wider text-right">
                  Min Threshold
                </th>
                {/* PRICE ADD START - Unit Price column header (inventory only) */}
                <th className="py-3 font-semibold uppercase text-xs tracking-wider text-right">
                  Unit Price
                </th>
                {/* PRICE ADD END */}
                <th className="py-3 font-semibold uppercase text-xs tracking-wider text-right">
                  Points Value
                </th>
                <th className="py-3 font-semibold uppercase text-xs tracking-wider">
                  Last Restock
                </th>
                <th className="py-3 font-semibold uppercase text-xs tracking-wider">
                  Status
                </th>
                <th className="py-3 font-semibold uppercase text-xs tracking-wider text-right">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {inventoryItems.length === 0 ? (
                <tr>
                  {/* PRICE ADD START - colSpan updated after adding Unit Price column */}
                  <td
                    colSpan="10"
                    className="py-10 text-center text-[#6f876f]"
                  >
                    No inventory items found
                  </td>
                  {/* PRICE ADD END */}
                </tr>
              ) : (
                inventoryItems.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b hover:bg-[#fcfcf7] transition-colors"
                  >
                    <td className="py-3 text-[#6f876f] font-mono text-xs">
                      {item.sku}
                    </td>
                    <td className="py-3 text-[#3e5f44] font-medium">
                      {item.name}
                    </td>
                    <td className="py-3 text-[#6f876f]">{item.category}</td>
                    <td
                      className={`py-3 text-right font-bold ${
                        item.currentStock === 0
                          ? 'text-red-700'
                          : item.currentStock < item.minThreshold
                          ? 'text-amber-700'
                          : 'text-[#3e5f44]'
                      }`}
                    >
                      {item.currentStock.toLocaleString()}
                    </td>
                    <td className="py-3 text-right text-[#6f876f]">
                      {item.minThreshold}
                    </td>
                    {/* PRICE ADD START - Unit Price cell (displayed in inventory only, not in rewards table) */}
                    <td className="py-3 text-right text-[#5a7c61] font-semibold">
                      {item.unitPrice > 0 ? `₱${Number(item.unitPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '—'}
                    </td>
                    {/* PRICE ADD END */}
                    <td className="py-3 text-right text-[#5a7c61] font-semibold">
                      {item.pointsCost.toLocaleString()} pts
                    </td>
                    <td className="py-3 text-[#6f876f] text-xs">
                      {item.lastRestocked}
                    </td>
                    <td className="py-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                          statusStyle[item.status]
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3">
                      <div className="flex justify-end gap-2">
                        <button className="text-xs px-3 py-1 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors">
                          View Details
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between pt-4 mt-4 border-t border-[#dbe6db]">
          <p className="text-xs text-[#6f876f]">
            Showing{' '}
            <span className="font-semibold text-[#3e5f44]">1</span> –{' '}
            <span className="font-semibold text-[#3e5f44]">
              {inventoryItems.length}
            </span>{' '}
            of{' '}
            <span className="font-semibold text-[#3e5f44]">
              {inventoryItems.length}
            </span>{' '}
            inventory items
          </p>
          <div className="flex items-center gap-2">
            <button className="w-8 h-8 rounded-lg bg-white border border-[#dbe6db] text-[#6f876f] hover:bg-[#e8f5bd] disabled:opacity-40 flex items-center justify-center text-xs">
              ←
            </button>
            <span className="text-sm font-semibold text-[#3e5f44] px-2">
              Page 1 of 1
            </span>
            <button className="w-8 h-8 rounded-lg bg-white border border-[#dbe6db] text-[#6f876f] hover:bg-[#e8f5bd] disabled:opacity-40 flex items-center justify-center text-xs">
              →
            </button>
          </div>
        </div>
      </div>

      {/* Stock value summary */}
      {/* PRICE ADD START - grid-cols-2 layout, Stock Health spans both cols after adding Monetary card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {/* PRICE ADD END */}
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
                {totalStockValue.toLocaleString()}
              </p>
              <p className="text-xs text-[#94a894] mt-1">points equivalent</p>
            </div>
            <div className="ml-auto">
              <div className="w-20 h-20 rounded-2xl bg-[#7faa72] flex items-center justify-center">
                <i className="fa-solid fa-coins text-3xl text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* PRICE ADD START - Monetary Inventory Value card (price × stock, visible only in inventory tab) */}
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
                ₱{totalMonetaryValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-[#94a894] mt-1">Philippine Peso (₱)</p>
            </div>
            <div className="ml-auto">
              <div className="w-20 h-20 rounded-2xl bg-[#3e5f44] flex items-center justify-center">
                <i className="fa-solid fa-peso-sign text-3xl text-white" />
              </div>
            </div>
          </div>
        </div>
        {/* PRICE ADD END */}

        {/* PRICE ADD START - Stock Health spans full width (2 cols) after adding Monetary Value card */}
        <div className="bg-white rounded-3xl p-6 border border-[#dbe6db] shadow-sm md:col-span-2">
        {/* PRICE ADD END */}
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
                  {inventoryItems.filter((i) => i.status === 'In Stock').length}
                </span>
              </div>
              <div className="h-3 bg-[#edf2ea] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#7faa72]"
                  style={{
                    width: `${
                      inventoryItems.length > 0
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
                  {lowStockCount}
                </span>
              </div>
              <div className="h-3 bg-[#edf2ea] rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-400"
                  style={{
                    width: `${
                      inventoryItems.length > 0
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
                  {outOfStockCount}
                </span>
              </div>
              <div className="h-3 bg-[#edf2ea] rounded-full overflow-hidden">
                <div
                  className="h-full bg-red-400"
                  style={{
                    width: `${
                      inventoryItems.length > 0
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

      {activeTab === 'rewards' && <RewardsTab />}
      {/* INVENTORY START - inventory tab render */}
      {activeTab === 'inventory' && <InventoryTab />}
      {/* INVENTORY END */}
      {activeTab === 'reports' && <ReportsTab />}

    </div>
  );
}
