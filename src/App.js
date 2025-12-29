import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Home from './pages/Home';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import ManagerDashboard from './pages/ManagerDashboard';
import WaiterDashboard from './pages/WaiterDashboard';
import CashierDashboard from './pages/CashierDashboard';
import AdminCreateUser from './pages/AdminCreateUser';
import ManagerCreateUser from './pages/ManagerCreateUser';
import Unauthorized from './components/Unauthorized';
import ProtectedRoute from './components/ProtectedRoute';
import CreateTable from './pages/CreateTable';
import ManageTables from './pages/ManageTables';
import CreateMenuItem from './pages/CreateMenuItem';
import ManageMenu from './pages/ManageMenu';
import CreateOrder from './pages/CreateOrder';
import ManageMembers from './pages/ManageMembers';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Protected Routes - Admin (role_id: 1) */}
        <Route path="/admin-dashboard" element={<ProtectedRoute allowedRoles={[1]}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/create-user" element={<ProtectedRoute allowedRoles={[1]}><AdminCreateUser /></ProtectedRoute>} />
        <Route path="/admin/manage-members" element={<ProtectedRoute allowedRoles={[1]}><ManageMembers /></ProtectedRoute>} />

        {/* Protected Routes - Manager (role_id: 2) */}
        <Route path="/manager-dashboard" element={<ProtectedRoute allowedRoles={[2]}><ManagerDashboard /></ProtectedRoute>} />
        <Route path="/manager/create-user" element={<ProtectedRoute allowedRoles={[2]}><ManagerCreateUser /></ProtectedRoute>} />
        <Route path="/manager/create-table" element={<ProtectedRoute allowedRoles={[2]}><CreateTable /></ProtectedRoute>} />
        <Route path="/manager/tables" element={<ProtectedRoute allowedRoles={[2]}><ManageTables /></ProtectedRoute>} />
        <Route path="/manager/create-menu" element={<ProtectedRoute allowedRoles={[2]}><CreateMenuItem /></ProtectedRoute>} />
        <Route path="/manager/menu" element={<ProtectedRoute allowedRoles={[2]}><ManageMenu /></ProtectedRoute>} />


        {/* Protected Routes - Waiter (role_id: 3) */}
        <Route path="/waiter-dashboard" element={<ProtectedRoute allowedRoles={[3]}><WaiterDashboard /></ProtectedRoute>} />
        <Route path="/waiter/create-order" element={<ProtectedRoute allowedRoles={[3]}><CreateOrder /></ProtectedRoute>} />
        {/* <Route path="/waiter/orders/:tableId" element={<ProtectedRoute allowedRoles={[3]}><ViewOrders /></ProtectedRoute>} /> */}


        {/* Protected Routes - Cashier (role_id: 4) */}
        <Route path="/cashier-dashboard" element={<ProtectedRoute allowedRoles={[4]}><CashierDashboard /></ProtectedRoute>} />
        {/* <Route path="/cashier/generate-bill/:tableId" element={<ProtectedRoute allowedRoles={[4]}><GenerateBill /></ProtectedRoute>} />
        <Route path="/cashier/bills" element={<ProtectedRoute allowedRoles={[4]}><PendingBills /></ProtectedRoute>} /> */}


        {/* 404 - Page Not Found */}
        <Route
          path="*"
          element={
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
                <p className="text-xl text-gray-600 mb-8">Page Not Found</p>
                <a
                  href="/"
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition"
                >
                  Go Home
                </a>
              </div>
            </div>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;