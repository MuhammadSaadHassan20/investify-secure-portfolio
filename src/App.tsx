import { useState } from 'react';
import { LocalAuthProvider, useAuth } from './contexts/localAuthContext';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';

function AppContent() {
  const [showLogin, setShowLogin] = useState(true);
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
          <p className="mt-4 text-gray-700 text-lg">Loading Investify...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return showLogin ? (
      <Login onToggle={() => setShowLogin(false)} />
    ) : (
      <Register onToggle={() => setShowLogin(true)} />
    );
  }

  return <Dashboard />;
}

function App() {
  return (
    <LocalAuthProvider>
      <AppContent />
    </LocalAuthProvider>
  );
}

export default App;