import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function ManageTables() {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingTable, setEditingTable] = useState(null);
  const [editFormData, setEditFormData] = useState({});

  const navigate = useNavigate();

  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/restaurant/tables/', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setTables(data.data);
      } else {
        setError(data.message || 'Failed to fetch tables');
      }
    } catch (err) {
      setError('Connection error');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (table) => {
    setEditingTable(table.id);
    setEditFormData({
      table_number: table.table_number,
      seating_capacity: table.seating_capacity,
      status: table.status
    });
  };

  const handleUpdate = async (tableId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/api/restaurant/tables/update/${tableId}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editFormData)
      });

      const data = await response.json();
      if (response.ok && data.success) {
        alert('Table updated successfully');
        setEditingTable(null);
        fetchTables();
      } else {
        alert(data.message || 'Failed to update table');
      }
    } catch (err) {
      alert('Connection error');
    }
  };

  const handleDelete = async (tableId, tableNumber) => {
    if (!window.confirm(`Delete table ${tableNumber}? This action cannot be undone.`)) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/api/restaurant/tables/delete/${tableId}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (response.ok && data.success) {
        alert(data.message);
        fetchTables();
      } else {
        alert(data.message || 'Failed to delete table');
      }
    } catch (err) {
      alert('Connection error');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Available':
        return 'bg-green-100 text-green-800';
      case 'Occupied':
        return 'bg-orange-100 text-orange-800';
      case 'Bill Requested':
        return 'bg-blue-100 text-blue-800';
      case 'Closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
                onClick={() => navigate('/manager-dashboard')}
                className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-800">Manage Tables</h1>
                  <p className="text-sm text-gray-500">View, Edit & Delete</p>
                </div>
              </div>
            </div>
            <button
              onClick={() => navigate('/manager/create-table')}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition"
            >
              + Add New Table
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading tables...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">{error}</p>
          </div>
        ) : tables.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-600 mb-4">No tables found</p>
            <button
              onClick={() => navigate('/manager/create-table')}
              className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition"
            >
              Create Your First Table
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Table Number
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Capacity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {tables.map((table) => (
                    <tr key={table.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingTable === table.id ? (
                          <input
                            type="text"
                            value={editFormData.table_number}
                            onChange={(e) => setEditFormData({...editFormData, table_number: e.target.value})}
                            className="px-2 py-1 border rounded"
                          />
                        ) : (
                          <div className="text-sm font-medium text-gray-900">{table.table_number}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingTable === table.id ? (
                          <input
                            type="number"
                            value={editFormData.seating_capacity}
                            onChange={(e) => setEditFormData({...editFormData, seating_capacity: e.target.value})}
                            className="px-2 py-1 border rounded w-20"
                          />
                        ) : (
                          <div className="text-sm text-gray-900">{table.seating_capacity} seats</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingTable === table.id ? (
                          <select
                            value={editFormData.status}
                            onChange={(e) => setEditFormData({...editFormData, status: e.target.value})}
                            className="px-2 py-1 border rounded"
                          >
                            <option value="Available">Available</option>
                            <option value="Occupied">Occupied</option>
                            <option value="Bill Requested">Bill Requested</option>
                            <option value="Closed">Closed</option>
                          </select>
                        ) : (
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(table.status)}`}>
                            {table.status}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {editingTable === table.id ? (
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => handleUpdate(table.id)}
                              className="text-green-600 hover:text-green-900"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingTable(null)}
                              className="text-gray-600 hover:text-gray-900"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="flex justify-end space-x-3">
                            <button
                              onClick={() => handleEdit(table)}
                              className="text-emerald-600 hover:text-emerald-900"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(table.id, table.table_number)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default ManageTables;