import { useState, useEffect } from 'react';
import AuthCard from './components/AuthCard';
import TodoDashboard from './components/TodoDashboard';
import Navbar from './components/Navbar';

interface User {
  id: string;
  email: string;
}

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setChecking(false);
  }, []);

  const handleAuthSuccess = (_token: string, authedUser: User) => setUser(authedUser);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  if (checking) return null;

  return (
    <>
      <Navbar userEmail={user?.email} onLogout={user ? handleLogout : undefined} />
      {user ? (
        <TodoDashboard userEmail={user.email} onLogout={handleLogout} />
      ) : (
        <AuthCard onAuthSuccess={handleAuthSuccess} />
      )}
    </>
  );
}

export default App;