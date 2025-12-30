import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function CashierDashboard() {
  const [username, setUsername] = useState('');
  const [pendingBills, setPendingBills] = useState([]);
  const [tablesReadyForBill, setTablesReadyForBill] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    todayRevenue: 0,
    billsPending: 0,
    billsPaid: 0,
    totalBills: 0
  });

  const navigate = useNavigate();

  useEffect(() => {
    const user = localStorage.getItem('username');
    setUsername(user || 'Cashier');

    fetchCashierStats();
    fetchTablesReadyForBill(); 
    fetchPendingBills();
  }, []);

  const fetchCashierStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/restaurant/cashier/stats/', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      console.log("Cash Revenue details:", data)

      if (response.ok && data.success) {
        setStats({
          todayRevenue: data.data.today_revenue,
          billsPending: data.data.bills_pending,
          billsPaid: data.data.bills_paid,
          totalBills: data.data.total_bills
        });
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  // Fetch tables with served orders (no bill yet)
  const fetchTablesReadyForBill = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/restaurant/tables/ready-for-bill/', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setTablesReadyForBill(data.data);
      }
    } catch (err) {
      console.error('Error fetching tables ready for bill:', err);
    }
  };

  const fetchPendingBills = async () => {
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/restaurant/bills/pending/', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setPendingBills(data.data);
        
        // Calculate stats from bills
        const pendingCount = data.data.length;
        
        setStats((prevStats) => ({
          ...prevStats,
          billsPending: pendingCount,
        }));
      } else {
        setError(data.message || 'Failed to fetch bills');
        setPendingBills([]);
      }
    } catch (err) {
      setError('Connection error. Please try again.');
      setPendingBills([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login', { replace: true });
  };

  const getTimeSince = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} mins ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hours ago`;
    return date.toLocaleDateString();
  };

  const extractTableId = (tableName) => {
    // Extract numeric ID from table name like "T-02" or get from bill data
    const match = tableName.match(/\d+/);
    return match ? match[0] : null;
  };

  const handleGenerateBill = (tableId) => {
    navigate(`/cashier/generate-bill/${tableId}`);
  };

  const handleViewAllBills = () => {
    navigate('/cashier/bills');
  };

  const handleQuickPay = async (billId, tableNumber) => {
    if (!window.confirm(`Mark bill for ${tableNumber} as paid?`)) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/api/restaurant/bills/mark-paid/${billId}/`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok && data.success) {
        alert('Payment successful! Table is now available.');
        fetchPendingBills(); // Refresh the list
        fetchCashierStats();
      } else {
        alert(data.message || 'Failed to mark as paid');
      }
    } catch (err) {
      alert('Connection error. Please try again.');
    }
  };

  const handleRefreshAll = () => {
    fetchCashierStats();
    fetchTablesReadyForBill();
    fetchPendingBills();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">Cashier Dashboard</h1>
                <p className="text-sm text-gray-500">Welcome, {username}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleRefreshAll}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition"
                title="Refresh"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Today Revenue</p>
                <p className="text-3xl font-bold text-green-600 mt-2">₹{stats.todayRevenue}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Pending Bills</p>
                <p className="text-3xl font-bold text-orange-600 mt-2">{stats.billsPending}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Paid Bills</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">{stats.billsPaid}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Total Bills</p>
                <p className="text-3xl font-bold text-purple-600 mt-2">{stats.totalBills}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-lg shadow p-12 text-center mb-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading pending bills...</p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
            <div className="flex items-center">
              <svg className="w-6 h-6 text-red-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-red-800 font-semibold">Error Loading Bills</p>
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            </div>
            <button
              onClick={fetchPendingBills}
              className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition"
            >
              Try Again
            </button>
          </div>
        )}

        {/* NEW SECTION - Tables Ready for Billing */}
        {!loading && !error && tablesReadyForBill.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-800">Ready for Billing</h2>
                <p className="text-sm text-gray-600">Tables with served orders waiting for bill generation</p>
              </div>
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                {tablesReadyForBill.length} {tablesReadyForBill.length === 1 ? 'Table' : 'Tables'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tablesReadyForBill.map((table) => (
                <div
                  key={table.table_id}
                  className="border-2 border-green-200 bg-green-50 rounded-lg p-5 hover:shadow-md transition"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">{table.table_number}</h3>
                      <p className="text-sm text-gray-600">{table.seating_capacity} seats</p>
                      <p className="text-xs text-gray-500 mt-1">{table.orders_count} served {table.orders_count === 1 ? 'order' : 'orders'}</p>
                    </div>
                    <span className="px-3 py-1 bg-green-600 text-white rounded-full text-xs font-semibold">
                      Ready
                    </span>
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-sm text-gray-600">Estimated Total</p>
                    <p className="text-2xl font-bold text-emerald-600">≈ ₹{table.total_amount}</p>
                  </div>

                  <button
                    onClick={() => handleGenerateBill(table.table_id)}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 rounded-lg transition"
                  >
                    Generate Bill
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pending Bills */}
        {!loading && !error && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">Pending Bills</h2>
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-semibold">
                  {pendingBills.length} Pending
                </span>
                <button
                  onClick={handleViewAllBills}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition"
                >
                  View All
                </button>
              </div>
            </div>

            {pendingBills.length === 0 ? (
              <div className="text-center py-12">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-xl text-gray-600 mb-2">All Clear!</p>
                <p className="text-gray-500">No pending bills at the moment</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingBills.map((bill) => {
                  const tableId = extractTableId(bill.table);
                  
                  return (
                    <div
                      key={bill.id}
                      className="border rounded-lg p-4 hover:shadow-md transition"
                    >
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-bold text-gray-800">{bill.table}</h3>
                            <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-semibold">
                              {bill.status}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            Bill #{bill.id} • Generated {getTimeSince(bill.generated_at)}
                          </p>
                          <p className="text-xs text-gray-500">{new Date(bill.generated_at).toLocaleString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-emerald-600">₹{bill.total_amount}</p>
                          <p className="text-xs text-gray-600">
                            Subtotal: ₹{bill.subtotal} + Tax: ₹{bill.tax_amount}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2">
                        {tableId && (
                          <button
                            onClick={() => navigate(`/cashier/bill/${bill.id}`)}
                            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition"
                          >
                            View Details
                          </button>
                        )}
                        <button
                          onClick={() => handleQuickPay(bill.id, bill.table)}
                          className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition"
                        >
                          Mark as Paid
                        </button>
                        <button
                          onClick={() => window.print()}
                          className="px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg text-sm font-medium transition"
                        >
                          Print
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            onClick={handleViewAllBills}
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition cursor-pointer"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">All Bills</h3>
                <p className="text-sm text-gray-600">View all transactions</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition cursor-pointer">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Payment History</h3>
                <p className="text-sm text-gray-600">View completed bills</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition cursor-pointer">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Sales Report</h3>
                <p className="text-sm text-gray-600">Today's summary</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default CashierDashboard;