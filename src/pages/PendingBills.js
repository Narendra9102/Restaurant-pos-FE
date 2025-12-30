import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function PendingBills() {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
//   const [filter, setFilter] = useState('pending'); 

  useEffect(() => {
    fetchBills();
  }, []);

  const navigate = useNavigate();

  const fetchBills = async () => {
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
        setBills(data.data);
      } else {
        setError(data.message || 'Failed to fetch bills');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
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
        alert('Payment successful!');
        fetchBills(); // Refresh list
      } else {
        alert(data.message || 'Failed to mark as paid');
      }
    } catch (err) {
      alert('Connection error');
    }
  };

  const handleBack = () => {
    navigate('/cashier-dashboard');
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

  const getUrgencyColor = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMins = Math.floor((now - date) / 60000);
    
    if (diffMins > 30) return 'border-red-200 bg-red-50';
    if (diffMins > 15) return 'border-orange-200 bg-orange-50';
    return 'border-gray-200 bg-white';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <button
                onClick={handleBack}
                className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-800">Pending Bills</h1>
                  <p className="text-sm text-gray-500">
                    {bills.length} {bills.length === 1 ? 'bill' : 'bills'} pending payment
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={fetchBills}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition"
            >
              Refresh
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600 font-medium">Total Pending</p>
            <p className="text-2xl font-bold text-orange-600 mt-1">{bills.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600 font-medium">Total Amount</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">
              ₹{bills.reduce((sum, bill) => sum + parseFloat(bill.total_amount || 0), 0).toFixed(2)}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600 font-medium">Urgent (30+ mins)</p>
            <p className="text-2xl font-bold text-red-600 mt-1">
              {bills.filter(bill => {
                const diffMins = Math.floor((new Date() - new Date(bill.generated_at)) / 60000);
                return diffMins > 30;
              }).length}
            </p>
          </div>
        </div>

        {/* Bills List */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading bills...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">{error}</p>
          </div>
        ) : bills.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-xl text-gray-600 mb-2">All Clear!</p>
            <p className="text-gray-500">No pending bills at the moment</p>
          </div>
        ) : (
          <div className="space-y-4">
            {bills.map((bill) => (
              <div
                key={bill.id}
                className={`rounded-lg shadow-md p-6 border-2 ${getUrgencyColor(bill.generated_at)} hover:shadow-lg transition`}
              >
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                  {/* Bill Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-2xl font-bold text-gray-800">{bill.table}</h3>
                      <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-semibold">
                        {bill.status}
                      </span>
                    </div>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p>Bill #{bill.id}</p>
                      <p>Generated: {getTimeSince(bill.generated_at)}</p>
                      <p className="text-xs">{new Date(bill.generated_at).toLocaleString()}</p>
                    </div>
                  </div>

                  {/* Amount & Actions */}
                  <div className="flex flex-col items-end gap-3">
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Amount</p>
                      <p className="text-3xl font-bold text-emerald-600">₹{bill.total_amount}</p>
                      <p className="text-xs text-gray-500">
                        Subtotal: ₹{bill.subtotal} + Tax: ₹{bill.tax_amount}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => navigate(`/cashier/bill/${bill.id}`)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition"
                      >
                        View Details
                      </button>
                      <button
                        onClick={() => handleQuickPay(bill.id, bill.table)}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition"
                      >
                        Mark Paid
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default PendingBills;