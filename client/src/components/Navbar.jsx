import { BarChart3, Bell, Bookmark, Home, Menu, MessageCircle, UserRound, Plus, ShieldCheck, X, BellRing, HeartPulse, CircleDot, Info, Moon, Sun } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getImageUrl } from '../utils/images';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';

export default function Navbar() {
  const { user } = useAuth();
  const { t, toggleLanguage, isArabic } = useLanguage();
  const { isDark, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const avatar = getImageUrl(user?.profilePicture);

  return (
    <aside className="navbar">
      <Link to="/feed" className="navbar-brand">
        <span className="brand-wordmark">Chatterly</span>
      </Link>
      <nav className="navbar-links">
        <Link to="/feed" className="nav-link active"><Home size={20} /> {t('home')}</Link>
        <Link to="/notifications" className="nav-link"><Bell size={20} /> {t('notifications')}</Link>
        <Link to="/chat" className="nav-link"><MessageCircle size={20} /> {t('messages')}</Link>
        <Link to="/dashboard" className="nav-link"><BarChart3 size={20} /> {t('dashboard')}</Link>
        <Link to="/saved" className="nav-link"><Bookmark size={20} /> {t('saved')}</Link>
        <Link to="/reminders" className="nav-link"><BellRing size={20} /> {t('reminders')}</Link>
        <Link to="/pulse" className="nav-link"><HeartPulse size={20} /> {t('dailyPulse')}</Link>
        <Link to="/circles" className="nav-link"><CircleDot size={20} /> {t('circles')}</Link>
        <Link to="/about" className="nav-link"><Info size={20} /> {isArabic ? 'عن Chatterly' : 'About Chatterly'}</Link>
        {user?.isAdmin && <Link to="/admin" className="nav-link"><ShieldCheck size={20} /> {t('admin')}</Link>}
        <Link to={`/users/${user?._id}`} className="nav-link"><UserRound size={20} /> {t('profile')}</Link>
      </nav>
      <Link to="/feed" className="sidebar-create"><Plus size={18} /> {t('createPost')}</Link>
      <button type="button" className="theme-toggle" onClick={toggleTheme} title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}>
        {isDark ? <Sun size={17} /> : <Moon size={17} />} {isDark ? 'Light mode' : 'Dark mode'}
      </button>
      <button type="button" className="language-toggle" onClick={toggleLanguage}>{t('language')}</button>
      <div className="sidebar-bottom">
        <Link to={`/users/${user?._id}`} className="sidebar-user">
          {avatar ? <img src={avatar} alt="" /> : <span className="avatar-fallback">{(user?.username || 'I')[0]}</span>}
          <span><strong>{user?.username || 'Ibrahim Haraz'}</strong><small>@{(user?.username || 'ibrahim.dev').toLowerCase()}</small></span>
          <b>•••</b>
        </Link>
      </div>
      <button type="button" className="mobile-menu-toggle" onClick={() => setMobileMenuOpen((open) => !open)} aria-label={mobileMenuOpen ? t('closeNavigation') : t('openNavigation')}>
        {mobileMenuOpen ? <X size={21} /> : <Menu size={21} />}
      </button>
      {mobileMenuOpen && <div className="mobile-menu">
        <Link to="/feed" onClick={() => setMobileMenuOpen(false)}><Home size={18} /> {t('home')}</Link>
        <Link to="/notifications" onClick={() => setMobileMenuOpen(false)}><Bell size={18} /> {t('notifications')}</Link>
        <Link to="/chat" onClick={() => setMobileMenuOpen(false)}><MessageCircle size={18} /> {t('messages')}</Link>
        <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)}><BarChart3 size={18} /> {t('dashboard')}</Link>
        <Link to="/saved" onClick={() => setMobileMenuOpen(false)}><Bookmark size={18} /> {t('saved')}</Link>
        <Link to="/reminders" onClick={() => setMobileMenuOpen(false)}><BellRing size={18} /> {t('reminders')}</Link>
        <Link to="/pulse" onClick={() => setMobileMenuOpen(false)}><HeartPulse size={18} /> {t('dailyPulse')}</Link>
        <Link to="/circles" onClick={() => setMobileMenuOpen(false)}><CircleDot size={18} /> {t('circles')}</Link>
        <Link to="/about" onClick={() => setMobileMenuOpen(false)}><Info size={18} /> {isArabic ? 'عن Chatterly' : 'About Chatterly'}</Link>
        {user?.isAdmin && <Link to="/admin" onClick={() => setMobileMenuOpen(false)}><ShieldCheck size={18} /> {t('admin')}</Link>}
        <Link to={`/users/${user?._id}`} onClick={() => setMobileMenuOpen(false)}><UserRound size={18} /> {t('profile')}</Link>
      </div>}
    </aside>
  );
}
