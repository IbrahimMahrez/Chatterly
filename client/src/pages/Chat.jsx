import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../hooks/useSocket';

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

  const messagesEndRef = useRef(null);

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
          id: `${data.sender}-${Date.now()}-${Math.random()}`,
          message: data.message,
          sender: data.sender,
          senderName: data.senderName || 'مستخدم',
          timestamp: data.timestamp || new Date().toISOString(),
        },
      ]);
    };

    socket.on('receive_message', handleMessage);

    return () => {
      socket.off('receive_message', handleMessage);
    };
  }, [socket, joinedRoom]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const joinRoom = (room) => {
    if (!room.trim()) return;
    navigate(`/chat/${room.trim()}`);
  };

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
        {!joinedRoom ? (
          <div className="chat-lobby">
            <h3>اختر غرفة شات</h3>
            <p className="chat-hint">انضم لغرفة موجودة أو أنشئ غرفة جديدة</p>

            <div className="quick-rooms">
              {QUICK_ROOMS.map((room) => (
                <button
                  key={room.id}
                  type="button"
                  className="quick-room-btn"
                  onClick={() => joinRoom(room.id)}
                >
                  {room.label}
                </button>
              ))}
            </div>

            <div className="custom-room">
              <input
                value={customRoom}
                onChange={(e) => setCustomRoom(e.target.value)}
                placeholder="اسم الغرفة..."
                onKeyDown={(e) => e.key === 'Enter' && joinRoom(customRoom)}
              />
              <button
                type="button"
                className="btn-primary btn-sm"
                onClick={() => joinRoom(customRoom)}
              >
                دخول
              </button>
            </div>
          </div>
        ) : (
          <div className="chat-box">
            <div className="chat-header">
              <div>
                <Link to="/chat" className="back-link">← الغرف</Link>
                <h3>#{joinedRoom}</h3>
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
          </div>
        )}
      </main>
    </div>
  );
}
