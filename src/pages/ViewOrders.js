import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function ViewOrders() {
  const [orders, setOrders] = useState([]);
  const [tableInfo, setTableInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingOrder, setUpdatingOrder] = useState(null);

  const navigate = useNavigate();
  const { tableId } = useParams();

  const fetchTableInfo = useCallback(async () => {
    try {
        const token = localStorage.getItem('token');

        const response = await fetch(
        'http://localhost:8000/api/restaurant/tables/',
        {
            headers: {
            Authorization: `Bearer ${token}`,
            },
        }
        );

        const data = await response.json();

        if (response.ok && data.success) {
        const table = data.data.find(
            (t) => t.id === parseInt(tableId)
        );
        setTableInfo(table);
        }
    } catch (err) {
        console.error('Failed to fetch table info');
    }
    }, [tableId]);

  const fetchTableOrders = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
        const token = localStorage.getItem('token');

        const response = await fetch(
        `http://localhost:8000/api/restaurant/orders/table/${tableId}/`,
        {
            headers: {
            Authorization: `Bearer ${token}`,
            },
        }
        );

        const data = await response.json();

        if (response.ok && data.success) {
        setOrders(data.data);

        if (data.data.length > 0) {
            fetchTableInfo();
        }
        } else {
        setError(data.message || 'Failed to fetch orders');
        }
    } catch (err) {
        setError('Connection error. Please try again.');
    } finally {
        setLoading(false);
    }
    }, [tableId, fetchTableInfo]);

  useEffect(() => {
    if (tableId) {
      fetchTableOrders();
    }
  }, [tableId, fetchTableOrders]);

  const handleUpdateStatus = async (orderId, newStatus) => {
    setUpdatingOrder(orderId);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/api/restaurant/orders/update-status/${orderId}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        fetchTableOrders(); // Refresh orders
      } else {
        alert(data.message || 'Failed to update order status');
      }
    } catch (err) {
      alert('Connection error. Please try again.');
    } finally {
      setUpdatingOrder(null);
    }
  };

  const handleBack = () => {
    navigate('/waiter-dashboard');
  };

  const handleRequestBill = async () => {
    if (!window.confirm('Request bill for this table?')) return;

    try {
        const token = localStorage.getItem('token');
        
        // Update table status to "Bill Requested"
        const response = await fetch(`http://localhost:8000/api/restaurant/tables/update/${tableId}/`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'Bill Requested' })
        });

        const data = await response.json();

        if (response.ok && data.success) {
        alert('Bill requested successfully! Cashier will process it.');
        handleBack();
        } else {
        alert(data.message || 'Failed to request bill');
        }
    } catch (err) {
        alert('Connection error');
    }
    };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Placed':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'In Kitchen':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Served':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getNextStatus = (currentStatus) => {
    switch (currentStatus) {
      case 'Placed':
        return 'In Kitchen';
      case 'In Kitchen':
        return 'Served';
      default:
        return null;
    }
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
                  <h1 className="text-xl font-bold text-gray-800">
                    {tableInfo ? `Table ${tableInfo.table_number} Orders` : 'Table Orders'}
                  </h1>
                  <p className="text-sm text-gray-500">View & Update Status</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading orders...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">{error}</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-600 mb-4">No orders found for this table</p>
            <button
              onClick={handleBack}
              className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition"
            >
              Back to Dashboard
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Table Info Card */}
            {tableInfo && (
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">{tableInfo.table_number}</h2>
                    <p className="text-gray-600">{tableInfo.seating_capacity} seats • Status: {tableInfo.status}</p>
                  </div>
                  <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                    tableInfo.status === 'Occupied' ? 'bg-orange-100 text-orange-800' :
                    tableInfo.status === 'Bill Requested' ? 'bg-blue-100 text-blue-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {tableInfo.status}
                  </span>
                </div>
              </div>
            )}

            {/* Orders List */}
            {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4">
                <div>
                    <h3 className="text-lg font-bold text-gray-800">Order #{order.id}</h3>
                    <p className="text-sm text-gray-600">
                    {new Date(order.created_at).toLocaleString()}
                    </p>
                </div>
                <div className="flex items-center gap-2 mt-2 sm:mt-0">
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(order.status)}`}>
                    {order.status}
                    </span>
                    {order.is_billed && (
                    <span className="inline-block px-3 py-1 rounded-full text-sm font-semibold bg-purple-100 text-purple-800 border border-purple-200">
                        Billed
                    </span>
                    )}
                </div>
                </div>

                {/* Order Items */}
                <div className="mb-4">
                <h4 className="font-semibold text-gray-700 mb-2">Items:</h4>
                <div className="space-y-2">
                    {order.items && order.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                        <div>
                        <p className="font-medium text-gray-800">{item.menu_item}</p>
                        <p className="text-sm text-gray-600">₹{item.price} each</p>
                        </div>
                        <div className="text-right">
                        <p className="font-semibold text-gray-800">Qty: {item.quantity}</p>
                        <p className="text-sm text-emerald-600">₹{item.subtotal}</p>
                        </div>
                    </div>
                    ))}
                </div>
                </div>

                {/* Total */}
                <div className="border-t pt-4 mb-4">
                <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-800">Total:</span>
                    <span className="text-2xl font-bold text-emerald-600">₹{order.total_amount}</span>
                </div>
                </div>

                {/* Update Status Button - Only show if not billed and has next status */}
                {!order.is_billed && getNextStatus(order.status) && (
                <button
                    onClick={() => handleUpdateStatus(order.id, getNextStatus(order.status))}
                    disabled={updatingOrder === order.id}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {updatingOrder === order.id
                    ? 'Updating...'
                    : `Mark as ${getNextStatus(order.status)}`
                    }
                </button>
                )}

                {/* Already Billed Message */}
                {order.is_billed && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 text-center">
                    <p className="text-purple-800 font-semibold">This order has been billed</p>
                </div>
                )}
            </div>
            ))}

            {/* Request Bill Button - Moved outside the map, shown once */}
            {orders.length > 0 && 
            orders.every(o => o.status === 'Served' && !o.is_billed) &&
            tableInfo?.status !== 'Bill Requested' &&
            (
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-lg font-bold text-blue-800">All Orders Served!</h3>
                    <p className="text-sm text-blue-600">Ready to request bill for this table</p>
                </div>
                <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                </div>
                <button
                onClick={handleRequestBill}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition"
                >
                Request Bill
                </button>
            </div>
            )}

            {/* Bill Already Requested Message */}
            {tableInfo?.status === 'Bill Requested' && (
            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6 text-center">
                <svg className="w-12 h-12 text-green-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-lg font-bold text-green-800 mb-2">Bill Requested</h3>
                <p className="text-green-600">Cashier will process the bill shortly</p>
            </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default ViewOrders;