import { useState } from 'react';
import './App.css';
import LoginPage from './pages/LoginPage';
import DashboardLayout from './layouts/DashboardLayout';

/**
 * Main App Component
 */
function App() {
  const [token, setToken] = useState(localStorage.getItem('POS_TOKEN'));
  const [view, setView] = useState('ANALYTICS');

  const handleLogout = () => {
    localStorage.removeItem('POS_TOKEN');
    setToken(null);
  };

  if (!token) {
    return (
      <LoginPage
        onLogin={(t) => {
          localStorage.setItem('POS_TOKEN', t);
          setToken(t);
        }}
      />
    );
  }

  return (
    <DashboardLayout
      view={view}
      setView={setView}
      onLogout={handleLogout}
    />
  );
}

export default App;
