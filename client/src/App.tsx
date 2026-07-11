import './App.css';
import AuthCard from './components/AuthCard';
import TodoDashboard from './components/TodoDashboard';
import Navbar from './components/Navbar';
import ReLoginModal from './components/ReLoginModal';
import { useAuth } from './context/AuthContext';

function App() {
  const { user, sessionExpired, login, logout } = useAuth();

  return (
    <>
      <Navbar userEmail={user?.email} onLogout={user ? logout : undefined} />
      {user ? (
        <TodoDashboard userEmail={user.email} onLogout={logout} />
      ) : (
        <AuthCard onAuthSuccess={login} />
      )}
      {sessionExpired && user && <ReLoginModal userEmail={user.email} />}
    </>
  );
}

export default App;