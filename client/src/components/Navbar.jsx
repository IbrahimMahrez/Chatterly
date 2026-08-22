import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationsBell from './NotificationsBell';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="navbar">
      <Link to="/feed" className="navbar-brand">
        Chatterly
      </Link>
      <nav className="navbar-links">
        <Link to="/feed" className="nav-link">Feed</Link>
        <Link to="/chat" className="nav-link">💬 شات</Link>
      </nav>
      <div className="navbar-right">
        <NotificationsBell />
        <Link to={`/users/${user?._id}`} className="nav-link">
          {user?.username}
        </Link>
        <button type="button" className="btn-secondary" onClick={logout}>
          خروج
        </button>
      </div>
    </header>
  );
}
