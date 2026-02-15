import { useState } from 'react';
import './App.css';
import LoginPage from './pages/LoginPage';
import DashboardLayout from './layouts/DashboardLayout';
import NetworkStatus from './components/ui/NetworkStatus';
import { ThemeProvider } from './context/ThemeContext';

function App() {
  const [token, setToken] = useState(localStorage.getItem('POS_TOKEN'));
  const [view, setView] = useState('ANALYTICS');

  const handleLogout = () => {
    localStorage.removeItem('POS_TOKEN');
    setToken(null);
  };

  if (!token) {
    return (
      <ThemeProvider>
        <LoginPage
          onLogin={(t) => {
            localStorage.setItem('POS_TOKEN', t);
            setToken(t);
          }}
        />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <NetworkStatus />
      <DashboardLayout
        view={view}
        setView={setView}
        onLogout={handleLogout}
      />
    </ThemeProvider>
  );
}

export default App;
