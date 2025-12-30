import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function ViewBill() {
  const [billData, setBillData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [paying, setPaying] = useState(false);

  const navigate = useNavigate();
  const { billId } = useParams();

  const fetchBillDetails = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/api/restaurant/bills/${billId}/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      console.log("Bill details:", data)
      
      if (response.ok && data.success) {
        setBillData(data.data);
      } else {
        setError(data.message || 'Failed to load bill');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [billId]);

  useEffect(() => {
    fetchBillDetails();
  }, [billId, fetchBillDetails]);

  const handleMarkPaid = async () => {
    if (!window.confirm('Mark this bill as paid?')) return;

    setPaying(true);

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
        navigate('/cashier-dashboard');
      } else {
        alert(data.message || 'Failed to mark as paid');
      }
    } catch (err) {
      alert('Connection error');
    } finally {
      setPaying(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleBack = () => {
    navigate('/cashier-dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading bill details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={handleBack}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 print:hidden">
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
                  <h1 className="text-xl font-bold text-gray-800">Bill Details</h1>
                  <p className="text-sm text-gray-500">Cashier Panel</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {billData && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            {/* Bill Header */}
            <div className="text-center mb-8 border-b pb-6">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Restaurant POS</h1>
              <p className="text-gray-600">Invoice</p>
              <p className="text-sm text-gray-500">Bill #{billData.bill_id}</p>
            </div>

            {/* Bill Details */}
            <div className="mb-6">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Table:</span>
                <span className="font-semibold text-gray-800">{billData.table}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Date:</span>
                <span className="font-semibold text-gray-800">
                  {new Date(billData.generated_at).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Status:</span>
                <span className={`font-semibold ${
                  billData.status === 'Paid' ? 'text-green-600' : 'text-orange-600'
                }`}>
                  {billData.status}
                </span>
              </div>
            </div>

            {/* Items Table */}
            <div className="mb-6">
              <h3 className="font-bold text-gray-800 mb-3">Items:</h3>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Item</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Qty</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Price</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {billData.items.map((item, index) => (
                      <tr key={index}>
                        <td className="px-4 py-3 text-sm text-gray-800">{item.name}</td>
                        <td className="px-4 py-3 text-sm text-center text-gray-800">{item.quantity}</td>
                        <td className="px-4 py-3 text-sm text-right text-gray-800">₹{item.price}</td>
                        <td className="px-4 py-3 text-sm text-right font-semibold text-gray-800">₹{item.subtotal}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Bill Summary */}
            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-gray-700">
                <span>Subtotal:</span>
                <span className="font-semibold">₹{billData.subtotal}</span>
              </div>
              <div className="flex justify-between text-gray-700">
                <span>Tax ({billData.tax_percentage}%):</span>
                <span className="font-semibold">₹{billData.tax_amount}</span>
              </div>
              <div className="flex justify-between text-xl font-bold text-gray-800 pt-2 border-t">
                <span>Total Amount:</span>
                <span className="text-emerald-600">₹{billData.total_amount}</span>
              </div>
            </div>

            {/* Action Buttons - Only show if not paid */}
            {billData.status !== 'Paid' && (
              <div className="flex flex-col sm:flex-row gap-3 mt-8 print:hidden">
                <button
                  onClick={handleMarkPaid}
                  disabled={paying}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {paying ? 'Processing...' : 'Mark as Paid'}
                </button>
                <button
                  onClick={handlePrint}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition"
                >
                  Print Bill
                </button>
              </div>
            )}

            {/* Paid Badge */}
            {billData.status === 'Paid' && (
              <div className="mt-8 p-4 bg-green-50 border-2 border-green-200 rounded-lg text-center print:hidden">
                <svg className="w-12 h-12 text-green-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-green-800 font-semibold text-lg">Payment Completed</p>
                <button
                  onClick={handlePrint}
                  className="mt-3 px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition"
                >
                  Print Receipt
                </button>
              </div>
            )}

            {/* Footer */}
            <div className="text-center mt-8 pt-6 border-t text-sm text-gray-500">
              <p>Thank you for dining with us!</p>
              <p>Please visit again</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default ViewBill;