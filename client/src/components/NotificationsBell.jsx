import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
} from '../api/notifications';
import { Bell } from 'lucide-react';

const TYPE_LABELS = {
  reminder: 'تذكير:',
  like: 'أعجب بمنشورك',
  comment: 'علّق على منشورك',
  follow: 'بدأ بمتابعتك',
};

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'الآن';
  if (mins < 60) return `من ${mins} د`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `من ${hours} س`;
  return new Date(dateStr).toLocaleDateString('ar-EG');
}

export default function NotificationsBell({ label }) {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const panelRef = useRef(null);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const { data } = await getNotifications();
      setNotifications(data);
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOpen = () => {
    setOpen(!open);
    if (!open) fetchNotifications();
  };

  const handleRead = async (id) => {
    try {
      await markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
    } catch {
      /* silent */
    }
  };

  const handleReadAll = async () => {
    try {
      await markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch {
      /* silent */
    }
  };

  return (
    <div className="notifications-wrap" ref={panelRef}>
      <button type="button" className="notif-btn" onClick={handleOpen} aria-expanded={open}>
        <Bell size={20} />
        {label && <span className="notif-label">{label}</span>}
        {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
      </button>

      {open && (
        <div className="notif-panel">
          <div className="notif-panel-header">
            <h4>الإشعارات</h4>
            {unreadCount > 0 && (
              <button type="button" className="notif-read-all" onClick={handleReadAll}>
                قراءة الكل
              </button>
            )}
          </div>

          {loading && <div className="notif-loading" role="status" aria-label="Loading"><span /></div>}

          {!loading && notifications.length === 0 && (
            <p className="notif-empty">مفيش إشعارات</p>
          )}

          <div className="notif-list">
            {notifications.map((n) => (
              <div
                key={n._id}
                className={`notif-item ${n.isRead ? '' : 'unread'}`}
                onClick={() => !n.isRead && handleRead(n._id)}
              >
                <p>
                  <Link to={`/users/${n.sender?._id}`} className="notif-sender">
                    {n.sender?.username || 'مستخدم'}
                  </Link>
                  {' '}{TYPE_LABELS[n.type] || n.type}{n.message ? ` ${n.message}` : ''}
                </p>
                {n.post?.content && (
                  <span className="notif-post-preview">
                    "{n.post.content.slice(0, 50)}..."
                  </span>
                )}
                <span className="notif-time">{timeAgo(n.createdAt)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
