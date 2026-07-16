import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AccessibilityProvider } from './context/AccessibilityContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Organizer from './pages/Organizer';
import Login from './pages/Login';
import Register from './pages/Register';

// Protected Route for Organizers
const OrganizerRoute = ({ children }) => {
  const { user, loading, isAuthenticated } = useAuth();
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-950">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== 'organizer') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Protected Route for Authenticated Users (Fans or Organizers)
const PrivateRoute = ({ children }) => {
  const { loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-950">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

function AppContent() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-950 text-gray-100 selection:bg-emerald-500 selection:text-black">
      {/* Decorative Background Elements */}
      <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none animate-pulse-slow"></div>
      <div className="fixed bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none animate-pulse-slow"></div>
      
      <Navbar />
      
      <main className="flex-grow flex flex-col">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } />
          <Route path="/organizer" element={
            <OrganizerRoute>
              <Organizer />
            </OrganizerRoute>
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AccessibilityProvider>
          <AppContent />
        </AccessibilityProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
