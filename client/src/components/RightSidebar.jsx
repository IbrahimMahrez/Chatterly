import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MessageCircle, MessageSquare, UserPlus, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getConversations, getDiscoverUsers, followUser } from '../api/users';
import { getNotifications } from '../api/notifications';
import { getDmRoomId } from '../hooks/useSocket';
import { getImageUrl } from '../utils/images';

function PanelTitle({ children }) {
  return <div className="panel-title"><h3>{children}</h3></div>;
}

export default function RightSidebar() {
  const { user } = useAuth();
  const [suggestions, setSuggestions] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [conversations, setConversations] = useState([]);

  useEffect(() => {
    Promise.all([getDiscoverUsers(), getNotifications(), getConversations()])
      .then(([usersResponse, notificationsResponse, conversationsResponse]) => {
        setSuggestions(usersResponse.data);
        setNotifications(notificationsResponse.data.slice(0, 5));
        setConversations(conversationsResponse.data.slice(0, 4));
      })
      .catch(() => {});
  }, []);

  const removeSuggestion = async (id) => {
    try {
      await followUser(id);
      setSuggestions((current) => current.filter((item) => item._id !== id));
    } catch {
      /* keep the suggestion visible when the request fails */
    }
  };

  const notificationIcon = (type) => {
    if (type === 'like') return <Heart size={17} className="notification-heart" />;
    if (type === 'comment') return <MessageCircle size={17} className="notification-comment" />;
    return <UserPlus size={17} className="notification-follow" />;
  };

  return (
    <aside className="right-sidebar">
      <section className="side-panel">
        <PanelTitle>People You May Know</PanelTitle>
        <div className="suggestion-list">
          {suggestions.map((suggestion) => (
            <div className="suggestion-row" key={suggestion._id}>
              {getImageUrl(suggestion.profilePicture) ? <img src={getImageUrl(suggestion.profilePicture)} alt="" className="side-avatar" /> : <span className="side-avatar side-avatar-fallback">{suggestion.username[0]}</span>}
              <div className="side-person"><strong>{suggestion.username}</strong><span>Chatterly user</span></div>
              <button type="button" className="follow-button" onClick={() => removeSuggestion(suggestion._id)}>Follow</button>
              <button type="button" className="dismiss-button" onClick={() => setSuggestions((current) => current.filter((item) => item._id !== suggestion._id))} aria-label="Dismiss suggestion"><X size={15} /></button>
            </div>
          ))}
          {suggestions.length === 0 && <p className="side-empty">No suggestions right now.</p>}
        </div>
      </section>

      <section className="side-panel">
        <PanelTitle>Notifications</PanelTitle>
        <div className="notification-list">
          {notifications.map((notification) => <div key={notification._id}>{notificationIcon(notification.type)}<span><b>{notification.sender?.username || 'User'}</b> {notification.type}</span><small>{new Date(notification.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</small>{!notification.isRead && <i />}</div>)}
          {notifications.length === 0 && <p className="side-empty">No notifications yet.</p>}
        </div>
      </section>

      <section className="side-panel messages-panel">
        <PanelTitle>Messages</PanelTitle>
        <div className="message-list">
          {conversations.map((conversation) => <Link className="message-row" key={conversation._id} to={`/chat/${getDmRoomId(user._id, conversation._id)}`}><span className="online-avatar">{getImageUrl(conversation.profilePicture) ? <img src={getImageUrl(conversation.profilePicture)} alt="" /> : <span className="side-avatar side-avatar-fallback">{conversation.username[0]}</span>}</span><div className="side-person"><strong>{conversation.username}</strong><span>{conversation.latestMessage}</span></div><small>{new Date(conversation.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</small></Link>)}
          {conversations.length === 0 && <p className="side-empty">No conversations yet.</p>}
        </div>
      </section>
      <Link to="/chat" className="floating-chat" aria-label="Open chat"><MessageSquare size={24} /></Link>
    </aside>
  );
}
