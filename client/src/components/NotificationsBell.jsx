import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { getNotifications, markAllAsRead, markAsRead } from '../api/notifications';

const TYPE_LABELS = { reminder: 'تذكير:', like: 'أعجب بمنشورك', comment: 'علّق على منشورك', follow: 'بدأ بمتابعتك' };

function timeAgo(value) {
  const minutes = Math.floor((Date.now() - new Date(value).getTime()) / 60_000);
  if (minutes < 1) return 'الآن';
  if (minutes < 60) return `من ${minutes} د`;
  if (minutes < 1440) return `من ${Math.floor(minutes / 60)} س`;
  return new Date(value).toLocaleDateString('ar-EG');
}

export default function NotificationsBell({ label }) {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mobile, setMobile] = useState(() => window.matchMedia('(max-width: 720px)').matches);
  const triggerRef = useRef(null);
  const panelRef = useRef(null);
  const unreadCount = notifications.filter((item) => !item.isRead).length;

  const fetchNotifications = async () => {
    setLoading(true);
    try { const { data } = await getNotifications(); setNotifications(data); } catch { /* keep existing results */ } finally { setLoading(false); }
  };

  useEffect(() => {
    fetchNotifications();
    const timer = window.setInterval(fetchNotifications, 30_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const media = window.matchMedia('(max-width: 720px)');
    const update = () => setMobile(media.matches);
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    const closeOutside = (event) => {
      if (!triggerRef.current?.contains(event.target) && !panelRef.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener('mousedown', closeOutside);
    return () => document.removeEventListener('mousedown', closeOutside);
  }, []);

  const markOneRead = async (id) => {
    try { await markAsRead(id); setNotifications((items) => items.map((item) => item._id === id ? { ...item, isRead: true } : item)); } catch { /* no-op */ }
  };
  const markEverythingRead = async () => {
    try { await markAllAsRead(); setNotifications((items) => items.map((item) => ({ ...item, isRead: true }))); } catch { /* no-op */ }
  };

  const panel = open && <div className={`notif-panel${mobile ? ' notif-panel-mobile' : ''}`} ref={panelRef}>
    <div className="notif-panel-header"><h4>الإشعارات</h4>{unreadCount > 0 && <button type="button" className="notif-read-all" onClick={markEverythingRead}>قراءة الكل</button>}</div>
    {loading && <div className="notif-loading" role="status" aria-label="Loading"><span /></div>}
    {!loading && notifications.length === 0 && <p className="notif-empty">مفيش إشعارات</p>}
    <div className="notif-list">{notifications.map((notification) => <div key={notification._id} className={`notif-item ${notification.isRead ? '' : 'unread'}`} onClick={() => !notification.isRead && markOneRead(notification._id)}>
      <p><Link to={`/users/${notification.sender?._id}`} className="notif-sender">{notification.sender?.username || 'مستخدم'}</Link>{' '}{TYPE_LABELS[notification.type] || notification.type}{notification.message ? ` ${notification.message}` : ''}</p>
      {notification.post?.content && <span className="notif-post-preview">"{notification.post.content.slice(0, 50)}..."</span>}
      <span className="notif-time">{timeAgo(notification.createdAt)}</span>
    </div>)}</div>
  </div>;

  return <div className="notifications-wrap" ref={triggerRef}>
    <button type="button" className="notif-btn" onClick={() => { setOpen((value) => !value); if (!open) fetchNotifications(); }} aria-expanded={open} aria-label={label || 'Notifications'}>
      <Bell size={20} />
      {label && <span className="notif-label">{label}</span>}
      {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
    </button>
    {!mobile && panel}
    {mobile && panel && createPortal(panel, document.body)}
  </div>;
}
