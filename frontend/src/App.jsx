import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import Navigation from './components/Navigation.jsx';

// Pages
import Home from './pages/Home.jsx';
import Packages from './pages/Packages.jsx';
import Gallery from './pages/Gallery.jsx';
import Booking from './pages/Booking.jsx';
import VisionBoard from './pages/VisionBoard.jsx';
import ClientLogin from './pages/ClientLogin.jsx';
import ClientDashboard from './pages/ClientDashboard.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import AdminEventRecords from './pages/AdminEventRecords.jsx';

// Protected route — redirects to login if not authenticated
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

// Admin-only route
const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  if (!user.isAdmin) return <Navigate to="/dashboard" replace />;
  return children;
};

// Full-page loading spinner
const LoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center bg-cream-50">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-gold-200 border-t-gold-600 rounded-full animate-spin mx-auto mb-4" />
      <p className="font-serif text-gold-600 text-lg">Loading…</p>
    </div>
  </div>
);

function AppRoutes() {
  return (
    <>
      <Navigation />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/packages" element={<Packages />} />
        <Route path="/gallery" element={<Navigate to="/" replace />} />
        <Route path="/login" element={<ClientLogin />} />
        <Route
          path="/booking"
          element={
            <ProtectedRoute>
              <Booking />
            </ProtectedRoute>
          }
        />
        <Route
          path="/vision-board"
          element={
            <ProtectedRoute>
              <VisionBoard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <ClientDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/event-records"
          element={
            <AdminRoute>
              <AdminEventRecords />
            </AdminRoute>
          }
        />
        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
