import { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import LoginPage from './pages/LoginPage';
import DashboardLayout from './layouts/DashboardLayout';

function App() {
  const [token, setToken] = useState(localStorage.getItem('POS_TOKEN'));

  const handleLogout = () => {
    localStorage.removeItem('POS_TOKEN');
    localStorage.removeItem('POS_ROLE');
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
      <DashboardLayout view={localStorage.getItem('POS_VIEW') || 'ANALYTICS'} setView={(v) => {
        localStorage.setItem('POS_VIEW', v);
      }} onLogout={handleLogout} />
    </ThemeProvider>
  );
}

export default App;
