import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function ManageMenu() {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingItem, setEditingItem] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [filterCategory, setFilterCategory] = useState('all');

  const navigate = useNavigate();

  useEffect(() => {
    fetchMenu();
  }, []);

  const fetchMenu = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/restaurant/menu/', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setMenuItems(data.data);
      } else {
        setError(data.message || 'Failed to fetch menu');
      }
    } catch (err) {
      setError('Connection error');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item.id);
    setEditFormData({
      name: item.name,
      category: item.category,
      price: item.price,
      is_available: item.is_available
    });
  };

  const handleUpdate = async (itemId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/api/restaurant/menu/update/${itemId}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editFormData)
      });

      const data = await response.json();
      if (response.ok && data.success) {
        alert('Menu item updated successfully');
        setEditingItem(null);
        fetchMenu();
      } else {
        alert(data.message || 'Failed to update item');
      }
    } catch (err) {
      alert('Connection error');
    }
  };

  const handleDelete = async (itemId, itemName) => {
    if (!window.confirm(`Delete "${itemName}"? This action cannot be undone.`)) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/api/restaurant/menu/delete/${itemId}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (response.ok && data.success) {
        alert(data.message);
        fetchMenu();
      } else {
        alert(data.message || 'Failed to delete item');
      }
    } catch (err) {
      alert('Connection error');
    }
  };

  const filteredItems = filterCategory === 'all' 
    ? menuItems 
    : menuItems.filter(item => item.category === filterCategory);

  const getCategoryColor = (category) => {
    switch (category) {
      case 'Starter': return 'bg-orange-100 text-orange-800';
      case 'Main': return 'bg-red-100 text-red-800';
      case 'Drinks': return 'bg-blue-100 text-blue-800';
      case 'Dessert': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-4 gap-4">
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-800">Manage Menu</h1>
                  <p className="text-sm text-gray-500">View, Edit & Delete Items</p>
                </div>
              </div>
            </div>
            <button
              onClick={() => navigate('/manager/create-menu')}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition"
            >
              + Add New Item
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter */}
        <div className="mb-6 flex flex-wrap gap-2">
          <button
            onClick={() => setFilterCategory('all')}
            className={`px-4 py-2 rounded-lg font-medium transition ${filterCategory === 'all' ? 'bg-emerald-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
          >
            All
          </button>
          <button
            onClick={() => setFilterCategory('Starter')}
            className={`px-4 py-2 rounded-lg font-medium transition ${filterCategory === 'Starter' ? 'bg-emerald-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
          >
            Starters
          </button>
          <button
            onClick={() => setFilterCategory('Main')}
            className={`px-4 py-2 rounded-lg font-medium transition ${filterCategory === 'Main' ? 'bg-emerald-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
          >
            Main Course
          </button>
          <button
            onClick={() => setFilterCategory('Drinks')}
            className={`px-4 py-2 rounded-lg font-medium transition ${filterCategory === 'Drinks' ? 'bg-emerald-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
          >
            Drinks
          </button>
          <button
            onClick={() => setFilterCategory('Dessert')}
            className={`px-4 py-2 rounded-lg font-medium transition ${filterCategory === 'Dessert' ? 'bg-emerald-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
          >
            Desserts
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading menu...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">{error}</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-600 mb-4">No menu items found</p>
            <button
              onClick={() => navigate('/manager/create-menu')}
              className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition"
            >
              Add First Item
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <div key={item.id} className="bg-white rounded-lg shadow p-6">
                {editingItem === item.id ? (
                  <div className="space-y-4">
                    <input
                      type="text"
                      value={editFormData.name}
                      onChange={(e) => setEditFormData({...editFormData, name: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                    <select
                      value={editFormData.category}
                      onChange={(e) => setEditFormData({...editFormData, category: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg"
                    >
                      <option value="Starter">Starter</option>
                      <option value="Main">Main</option>
                      <option value="Drinks">Drinks</option>
                      <option value="Dessert">Dessert</option>
                    </select>
                    <input
                      type="number"
                      value={editFormData.price}
                      onChange={(e) => setEditFormData({...editFormData, price: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={editFormData.is_available}
                        onChange={(e) => setEditFormData({...editFormData, is_available: e.target.checked})}
                        className="mr-2"
                      />
                      <span className="text-sm">Available</span>
                    </label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUpdate(item.id)}
                        className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingItem(null)}
                        className="flex-1 px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg text-sm font-medium"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-lg font-bold text-gray-800">{item.name}</h3>
                        <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full mt-1 ${getCategoryColor(item.category)}`}>
                          {item.category}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-emerald-600">₹{item.price}</p>
                      </div>
                    </div>
                    <div className="mb-4">
                      <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${item.is_available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {item.is_available ? 'Available' : 'Unavailable'}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(item)}
                        className="flex-1 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(item.id, item.name)}
                        className="flex-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition"
                      >
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default ManageMenu;