import { BarChart3, Bell, Bookmark, Home, Menu, MessageCircle, UserRound, Plus, ShieldCheck, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getImageUrl } from '../utils/images';
import NotificationsBell from './NotificationsBell';
import { useLanguage } from '../context/LanguageContext';

export default function Navbar() {
  const { user } = useAuth();
  const { t, toggleLanguage } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const avatar = getImageUrl(user?.profilePicture);

  return (
    <aside className="navbar">
      <Link to="/feed" className="navbar-brand">
        <span className="brand-mark"><MessageCircle size={21} /></span> Chatterly
      </Link>
      <nav className="navbar-links">
        <Link to="/feed" className="nav-link active"><Home size={20} /> {t('home')}</Link>
        <div className="nav-notification-row"><Bell size={20} /><span>{t('notifications')}</span><NotificationsBell /></div>
        <Link to="/chat" className="nav-link"><MessageCircle size={20} /> {t('messages')}</Link>
        <Link to="/dashboard" className="nav-link"><BarChart3 size={20} /> {t('dashboard')}</Link>
        <Link to="/saved" className="nav-link"><Bookmark size={20} /> {t('savedPosts')}</Link>
        {user?.isAdmin && <Link to="/admin" className="nav-link"><ShieldCheck size={20} /> {t('admin')}</Link>}
        <Link to={`/users/${user?._id}`} className="nav-link"><UserRound size={20} /> {t('profile')}</Link>
      </nav>
      <Link to="/feed" className="sidebar-create"><Plus size={18} /> {t('createPost')}</Link>
      <button type="button" className="language-toggle" onClick={toggleLanguage}>{t('language')}</button>
      <div className="sidebar-bottom">
        <Link to={`/users/${user?._id}`} className="sidebar-user">
          {avatar ? <img src={avatar} alt="" /> : <span className="avatar-fallback">{(user?.username || 'I')[0]}</span>}
          <span><strong>{user?.username || 'Ibrahim Haraz'}</strong><small>@{(user?.username || 'ibrahim.dev').toLowerCase()}</small></span>
          <b>•••</b>
        </Link>
      </div>
      <button type="button" className="mobile-menu-toggle" onClick={() => setMobileMenuOpen((open) => !open)} aria-label="Open navigation menu">
        {mobileMenuOpen ? <X size={21} /> : <Menu size={21} />}
      </button>
      {mobileMenuOpen && <div className="mobile-menu">
        <Link to="/feed" onClick={() => setMobileMenuOpen(false)}><Home size={18} /> Home</Link>
        <div className="mobile-menu-notification"><Bell size={18} /><span>Notifications</span><NotificationsBell /></div>
        <Link to="/chat" onClick={() => setMobileMenuOpen(false)}><MessageCircle size={18} /> Messages</Link>
        <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)}><BarChart3 size={18} /> Dashboard</Link>
        <Link to="/saved" onClick={() => setMobileMenuOpen(false)}><Bookmark size={18} /> Saved Posts</Link>
        {user?.isAdmin && <Link to="/admin" onClick={() => setMobileMenuOpen(false)}><ShieldCheck size={18} /> Admin</Link>}
        <Link to={`/users/${user?._id}`} onClick={() => setMobileMenuOpen(false)}><UserRound size={18} /> Profile</Link>
      </div>}
    </aside>
  );
}
