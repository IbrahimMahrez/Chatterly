import { useEffect, useState } from 'react';
import { Bell, CheckCheck, Heart, MessageCircle, UserPlus } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import LoadingScreen from '../components/LoadingScreen';
import { getNotifications, markAllAsRead, markAsRead } from '../api/notifications';

const icons = { like: Heart, comment: MessageCircle, follow: UserPlus, reminder: Bell };
const labels = { like: 'أعجب بمنشورك', comment: 'علّق على منشورك', follow: 'بدأ بمتابعتك', reminder: 'تذكير' };

function timeAgo(value) {
  const minutes = Math.floor((Date.now() - new Date(value).getTime()) / 60_000);
  if (minutes < 1) return 'الآن';
  if (minutes < 60) return `منذ ${minutes} د`;
  if (minutes < 1440) return `منذ ${Math.floor(minutes / 60)} س`;
  return new Date(value).toLocaleDateString('ar-EG');
}

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getNotifications().then(({ data }) => setNotifications(data)).finally(() => setLoading(false));
  }, []);

  const markOneRead = async (id) => {
    try {
      await markAsRead(id);
      setNotifications((items) => items.map((item) => item._id === id ? { ...item, isRead: true } : item));
    } catch { /* keep the current state if the request fails */ }
  };

  const markEverythingRead = async () => {
    try {
      await markAllAsRead();
      setNotifications((items) => items.map((item) => ({ ...item, isRead: true })));
    } catch { /* keep the current state if the request fails */ }
  };

  const unreadCount = notifications.filter((item) => !item.isRead).length;

  return <div className="feed-page">
    <Navbar />
    <main className="standalone-content notifications-page">
      <header className="notifications-page-header">
        <div><span className="eyebrow">CHATTERLY</span><h1>الإشعارات</h1></div>
        {unreadCount > 0 && <button type="button" className="notifications-read-all" onClick={markEverythingRead}><CheckCheck size={18} />قراءة الكل</button>}
      </header>

      {loading ? <LoadingScreen compact /> : notifications.length === 0 ? <section className="notifications-empty"><Bell size={34} /><h2>لا توجد إشعارات بعد</h2><p>أي تفاعل جديد على حسابك سيظهر هنا.</p></section> : <section className="notifications-feed" aria-label="الإشعارات">
        {notifications.map((notification) => {
          const Icon = icons[notification.type] || Bell;
          return <article className={`notification-card ${notification.isRead ? '' : 'unread'}`} key={notification._id} onClick={() => !notification.isRead && markOneRead(notification._id)}>
            <span className={`notification-card-icon ${notification.type || 'default'}`}><Icon size={18} /></span>
            <div>
              <p><Link to={`/users/${notification.sender?._id}`} onClick={(event) => event.stopPropagation()}>{notification.sender?.username || 'مستخدم'}</Link>{' '}{labels[notification.type] || notification.type}{notification.message ? ` ${notification.message}` : ''}</p>
              {notification.post?.content && <span className="notification-card-preview">“{notification.post.content.slice(0, 90)}”</span>}
              <time>{timeAgo(notification.createdAt)}</time>
            </div>
            {!notification.isRead && <i aria-label="غير مقروء" />}
          </article>;
        })}
      </section>}
    </main>
  </div>;
}
