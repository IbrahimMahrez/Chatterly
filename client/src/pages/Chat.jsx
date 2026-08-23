import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { getDmRoomId, useSocket } from '../hooks/useSocket';
import { getConversations, getDiscoverUsers } from '../api/users';
import { getImageUrl } from '../utils/images';
import { MessageCircle, Search, Users } from 'lucide-react';

const QUICK_ROOMS = [
  { id: 'general', label: '💬 عام' },
  { id: 'tech', label: '💻 تقنية' },
  { id: 'random', label: '🎲 عشوائي' },
];

function formatTime(dateStr) {
  return new Date(dateStr).toLocaleTimeString('ar-EG', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function Chat() {
  const { roomId: roomFromUrl } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { socket, connected } = useSocket();

  const [joinedRoom, setJoinedRoom] = useState(roomFromUrl || '');
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [customRoom, setCustomRoom] = useState('');
  const [conversations, setConversations] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [chatSearch, setChatSearch] = useState('');

  const messagesEndRef = useRef(null);

  useEffect(() => {
    Promise.all([getConversations(), getDiscoverUsers()])
      .then(([conversationResponse, contactsResponse]) => {
        setConversations(conversationResponse.data);
        setContacts(contactsResponse.data);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (roomFromUrl) {
      setJoinedRoom(roomFromUrl);
      setMessages([]);
    } else {
      setJoinedRoom('');
      setMessages([]);
    }
  }, [roomFromUrl]);

  useEffect(() => {
    if (!socket || !joinedRoom) return;

    socket.emit('join_room', joinedRoom);

    const handleMessage = (data) => {
      setMessages((prev) => [
        ...prev,
        {
          id: data._id || `${data.sender}-${Date.now()}-${Math.random()}`,
          message: data.message,
          sender: data.sender,
          senderName: data.senderName || 'مستخدم',
          timestamp: data.timestamp || new Date().toISOString(),
        },
      ]);
    };

    const handleHistory = (history) => {
      setMessages(history.map((data) => ({
        id: data._id,
        message: data.message,
        sender: data.sender,
        senderName: data.senderName || 'مستخدم',
        timestamp: data.timestamp || data.createdAt,
      })));
    };

    socket.on('receive_message', handleMessage);
    socket.on('message_history', handleHistory);

    return () => {
      socket.off('receive_message', handleMessage);
      socket.off('message_history', handleHistory);
    };
  }, [socket, joinedRoom]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const joinRoom = (room) => {
    if (!room.trim()) return;
    navigate(`/chat/${room.trim()}`);
  };

  const openConversation = (contactId) => navigate(`/chat/${getDmRoomId(String(user._id), String(contactId))}`);
  const activeContact = [...conversations, ...contacts].find((contact) => joinedRoom.includes(String(contact._id)));
  const normalizedSearch = chatSearch.toLowerCase();
  const visibleConversations = conversations.filter((contact) => contact.username.toLowerCase().includes(normalizedSearch));
  const visibleContacts = contacts.filter((contact) => contact.username.toLowerCase().includes(normalizedSearch));

  const sendMessage = (e) => {
    e.preventDefault();
    if (!input.trim() || !socket || !joinedRoom) return;

    socket.emit('send_message', {
      roomId: joinedRoom,
      sender: user._id,
      senderName: user.username,
      message: input.trim(),
      timestamp: new Date().toISOString(),
    });

    setInput('');
  };

  const isOwnMessage = (senderId) => senderId?.toString() === user?._id?.toString();

  return (
    <div className="feed-page">
      <Navbar />

      <main className="chat-page">
        <div className="chat-workspace">
          <aside className="chat-contacts">
            <div className="chat-contacts-header"><div><h2>Messages</h2><span>{conversations.length} conversations</span></div><MessageCircle size={20} /></div>
            <label className="chat-search"><Search size={16} /><input value={chatSearch} onChange={(event) => setChatSearch(event.target.value)} placeholder="Search messages..." /></label>
            <h4>Conversations</h4>
            <div className="chat-contact-list">
              {visibleConversations.map((conversation) => (
                <Link className={`chat-contact ${joinedRoom.includes(String(conversation._id)) ? 'selected' : ''}`} key={conversation._id} to={`/chat/${getDmRoomId(String(user._id), String(conversation._id))}`}>
                  {getImageUrl(conversation.profilePicture) ? <img src={getImageUrl(conversation.profilePicture)} alt="" /> : <span>{conversation.username[0]}</span>}
                  <span><strong>{conversation.username}</strong><small>{conversation.latestMessage}</small></span>
                </Link>
              ))}
              {conversations.length === 0 && <p className="chat-muted">Your conversations will appear here.</p>}
            </div>
            <h4>Start a conversation</h4>
            <div className="chat-contact-list">
              {visibleContacts.map((contact) => (
                <Link className="chat-contact" key={contact._id} to={`/chat/${getDmRoomId(String(user._id), String(contact._id))}`}>
                  {getImageUrl(contact.profilePicture) ? <img src={getImageUrl(contact.profilePicture)} alt="" /> : <span>{contact.username[0]}</span>}
                  <span><strong>{contact.username}</strong><small>New conversation</small></span>
                </Link>
              ))}
            </div>
            <h4>Public rooms</h4>
            <div className="quick-rooms">{QUICK_ROOMS.map((room) => <button key={room.id} type="button" className="quick-room-btn" onClick={() => joinRoom(room.id)}>{room.label}</button>)}</div>
            <div className="custom-room"><input value={customRoom} onChange={(e) => setCustomRoom(e.target.value)} placeholder="Custom room..." onKeyDown={(e) => e.key === 'Enter' && joinRoom(customRoom)} /><button type="button" className="btn-primary btn-sm" onClick={() => joinRoom(customRoom)}>Join</button></div>
          </aside>
          {!joinedRoom ? <div className="chat-empty-panel"><Users size={34} /><h3>Select a conversation</h3><p>Choose a person or a public room to start chatting.</p></div> : <div className="chat-box">
            <div className="chat-header">
              <div>
                <Link to="/chat" className="back-link">← Messages</Link>
                <h3>{activeContact?.username || `#${joinedRoom}`}</h3>
                {activeContact && <small className="chat-subtitle">Direct message</small>}
              </div>
              <span className={`chat-status ${connected ? 'online' : 'offline'}`}>
                {connected ? '● متصل' : '○ غير متصل'}
              </span>
            </div>

            <div className="chat-messages">
              {messages.length === 0 && (
                <p className="chat-empty">مفيش رسائل لسه — ابدأ المحادثة!</p>
              )}

              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`chat-msg ${isOwnMessage(msg.sender) ? 'mine' : 'theirs'}`}
                >
                  {!isOwnMessage(msg.sender) && (
                    <span className="msg-sender">{msg.senderName}</span>
                  )}
                  <p>{msg.message}</p>
                  <span className="msg-time">{formatTime(msg.timestamp)}</span>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <form className="chat-input-area" onSubmit={sendMessage}>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="اكتب رسالة..."
                disabled={!connected}
              />
              <button type="submit" className="btn-primary btn-sm" disabled={!connected || !input.trim()}>
                إرسال
              </button>
            </form>
          </div>}
        </div>
      </main>
    </div>
  );
}
