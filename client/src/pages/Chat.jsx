import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { getDmRoomId, useSocket } from '../hooks/useSocket';
import { getConversations, getDiscoverUsers } from '../api/users';
import { getImageUrl } from '../utils/images';
import { Bookmark, File, Lightbulb, Mic, Paperclip, Send, SmilePlus, Square, Trash2, MessageCircle, Search, Sparkles, Users, X } from 'lucide-react';
import { suggestReplies, summarizeConversation } from '../api/ai';
import { getSavedMessages, saveMessage, searchMessages } from '../api/messages';
import { useFeedback } from '../context/FeedbackContext';
import { uploadAttachment, uploadAudio } from '../api/upload';

const QUICK_ROOMS = [
  { id: 'general', label: '💬 عام' },
  { id: 'tech', label: '💻 تقنية' },
  { id: 'random', label: '🎲 عشوائي' },
];
const REACTION_OPTIONS = ['👍', '❤️', '😂', '🔥', '😮'];

function formatTime(dateStr) {
  return new Date(dateStr).toLocaleTimeString('ar-EG', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatLastSeen(dateStr) {
  if (!dateStr) return 'Offline';
  return `Last seen ${new Date(dateStr).toLocaleString('en', { dateStyle: 'short', timeStyle: 'short' })}`;
}

export default function Chat() {
  const { roomId: roomFromUrl } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useFeedback();
  const { socket, connected } = useSocket();

  const [joinedRoom, setJoinedRoom] = useState(roomFromUrl || '');
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [customRoom, setCustomRoom] = useState('');
  const [conversations, setConversations] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [chatSearch, setChatSearch] = useState('');
  const [summary, setSummary] = useState('');
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState('');
  const [replySuggestions, setReplySuggestions] = useState([]);
  const [repliesLoading, setRepliesLoading] = useState(false);
  const [repliesError, setRepliesError] = useState('');
  const [savedMessageIds, setSavedMessageIds] = useState([]);
  const [messageResults, setMessageResults] = useState([]);
  const [searchingMessages, setSearchingMessages] = useState(false);
  const [recording, setRecording] = useState(false);
  const [voiceBlob, setVoiceBlob] = useState(null);
  const [voicePreview, setVoicePreview] = useState('');
  const [uploadingVoice, setUploadingVoice] = useState(false);
  const [uploadingAttachment, setUploadingAttachment] = useState(false);
  const [onlineUserIds, setOnlineUserIds] = useState([]);
  const [typingUserId, setTypingUserId] = useState('');

  const messagesEndRef = useRef(null);
  const recorderRef = useRef(null);
  const streamRef = useRef(null);
  const attachmentInputRef = useRef(null);
  const typingStopTimerRef = useRef(null);

  useEffect(() => {
    Promise.all([getConversations(), getDiscoverUsers()])
      .then(([conversationResponse, contactsResponse]) => {
        setConversations(conversationResponse.data);
        setContacts(contactsResponse.data);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    getSavedMessages()
      .then(({ data }) => setSavedMessageIds(data.map((item) => item.message._id)))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (socket && user?._id) socket.emit('register_user', String(user._id));
  }, [socket, user?._id]);

  useEffect(() => {
    const query = chatSearch.trim();
    if (query.length < 2) {
      setMessageResults([]);
      return undefined;
    }

    let active = true;
    const timer = window.setTimeout(async () => {
      setSearchingMessages(true);
      try {
        const { data } = await searchMessages(query);
        if (active) setMessageResults(data);
      } catch {
        if (active) setMessageResults([]);
      } finally {
        if (active) setSearchingMessages(false);
      }
    }, 300);
    return () => { active = false; window.clearTimeout(timer); };
  }, [chatSearch]);

  useEffect(() => {
    if (roomFromUrl) {
      setJoinedRoom(roomFromUrl);
      setMessages([]);
    } else {
      setJoinedRoom('');
      setMessages([]);
    }
    setSummary('');
    setSummaryError('');
    setReplySuggestions([]);
    setRepliesError('');
    setTypingUserId('');
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
          audioUrl: data.audioUrl || '',
          audioDuration: data.audioDuration || 0,
          attachmentUrl: data.attachmentUrl || '',
          attachmentName: data.attachmentName || '',
          attachmentType: data.attachmentType || '',
          attachmentSize: data.attachmentSize || 0,
          reactions: data.reactions || [],
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
        audioUrl: data.audioUrl || '',
        audioDuration: data.audioDuration || 0,
        attachmentUrl: data.attachmentUrl || '',
        attachmentName: data.attachmentName || '',
        attachmentType: data.attachmentType || '',
        attachmentSize: data.attachmentSize || 0,
        reactions: data.reactions || [],
      })));
    };

    socket.on('receive_message', handleMessage);
    socket.on('message_history', handleHistory);

    const handleTypingStart = ({ roomId, userId }) => {
      if (roomId === joinedRoom && String(userId) !== String(user?._id)) setTypingUserId(String(userId));
    };
    const handleTypingStop = ({ roomId, userId }) => {
      if (roomId === joinedRoom && String(userId) !== String(user?._id)) setTypingUserId('');
    };
    const handleOnlineUsers = (userIds) => setOnlineUserIds(userIds.map(String));
    const handlePresence = ({ userId, online }) => setOnlineUserIds((current) => online ? [...new Set([...current, String(userId)])] : current.filter((id) => id !== String(userId)));
    socket.on('typing_start', handleTypingStart);
    socket.on('typing_stop', handleTypingStop);
    socket.on('online_users', handleOnlineUsers);
    socket.on('presence_update', handlePresence);
    const handleReactions = ({ messageId, reactions }) => setMessages((current) => current.map((message) => String(message.id) === String(messageId) ? { ...message, reactions } : message));
    socket.on('message_reactions', handleReactions);

    return () => {
      socket.off('receive_message', handleMessage);
      socket.off('message_history', handleHistory);
      socket.off('typing_start', handleTypingStart);
      socket.off('typing_stop', handleTypingStop);
      socket.off('online_users', handleOnlineUsers);
      socket.off('presence_update', handlePresence);
      socket.off('message_reactions', handleReactions);
    };
  }, [socket, joinedRoom, user?._id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const joinRoom = (room) => {
    if (!room.trim()) return;
    navigate(`/chat/${room.trim()}`);
  };

  const openConversation = (contactId) => navigate(`/chat/${getDmRoomId(String(user._id), String(contactId))}`);
  const activeContact = [...conversations, ...contacts].find((contact) => joinedRoom.includes(String(contact._id)));
  const activeContactOnline = activeContact && onlineUserIds.includes(String(activeContact._id));
  const typingUser = [...conversations, ...contacts].find((contact) => String(contact._id) === typingUserId);
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
    socket.emit('typing_stop', { roomId: joinedRoom });
  };

  const handleInputChange = (event) => {
    const value = event.target.value;
    setInput(value);
    if (!socket || !joinedRoom) return;
    socket.emit('typing_start', { roomId: joinedRoom });
    window.clearTimeout(typingStopTimerRef.current);
    typingStopTimerRef.current = window.setTimeout(() => socket.emit('typing_stop', { roomId: joinedRoom }), 900);
  };

  const clearVoice = () => {
    if (voicePreview) URL.revokeObjectURL(voicePreview);
    setVoiceBlob(null);
    setVoicePreview('');
  };

  const startRecording = async () => {
    if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
      showToast('Voice recording is not supported in this browser.', 'error');
      return;
    }
    try {
      clearVoice();
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks = [];
      recorder.ondataavailable = (event) => { if (event.data.size) chunks.push(event.data); };
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: recorder.mimeType || 'audio/webm' });
        if (blob.size) { setVoiceBlob(blob); setVoicePreview(URL.createObjectURL(blob)); }
        stream.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        setRecording(false);
      };
      streamRef.current = stream;
      recorderRef.current = recorder;
      recorder.start();
      setRecording(true);
    } catch {
      showToast('Could not access your microphone. Please allow microphone access.', 'error');
    }
  };

  const stopRecording = () => {
    if (recorderRef.current?.state === 'recording') recorderRef.current.stop();
  };

  const sendVoice = async () => {
    if (!voiceBlob || !socket || !joinedRoom || uploadingVoice) return;
    setUploadingVoice(true);
    try {
      const { data } = await uploadAudio(voiceBlob);
      socket.emit('send_message', { roomId: joinedRoom, sender: user._id, senderName: user.username, audioUrl: data.url });
      clearVoice();
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not send the voice message.', 'error');
    } finally {
      setUploadingVoice(false);
    }
  };

  const sendAttachment = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file || !socket || !joinedRoom || uploadingAttachment) return;
    if (file.size > 20 * 1024 * 1024) {
      showToast('The maximum attachment size is 20 MB.', 'error');
      return;
    }
    setUploadingAttachment(true);
    try {
      const { data } = await uploadAttachment(file);
      socket.emit('send_message', {
        roomId: joinedRoom,
        sender: user._id,
        senderName: user.username,
        attachmentUrl: data.url,
        attachmentName: data.name,
        attachmentType: data.type,
        attachmentSize: data.size,
      });
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not upload this attachment.', 'error');
    } finally {
      setUploadingAttachment(false);
    }
  };

  const isImageAttachment = (message) => message.attachmentType?.startsWith('image/');

  useEffect(() => () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
  }, []);

  const isOwnMessage = (senderId) => senderId?.toString() === user?._id?.toString();

  const toggleReaction = (messageId, emoji) => socket?.emit('toggle_reaction', { messageId, emoji });

  const toggleSavedMessage = async (messageId) => {
    if (!messageId) return;
    try {
      const { data } = await saveMessage(messageId);
      setSavedMessageIds((current) => data.saved ? [...new Set([...current, messageId])] : current.filter((id) => id !== messageId));
      showToast(data.saved ? 'تم حفظ الرسالة.' : 'تمت إزالة الرسالة من المحفوظات.', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'تعذر حفظ الرسالة. تأكد أن الـbackend يعمل.', 'error');
    }
  };

  const createSummary = async () => {
    if (!messages.length || summaryLoading) return;
    setSummaryError('');
    setSummaryLoading(true);
    try {
      const { data } = await summarizeConversation(messages);
      setSummary(data.summary);
    } catch (err) {
      setSummaryError(err.response?.data?.message || 'Could not summarize this conversation right now.');
    } finally {
      setSummaryLoading(false);
    }
  };

  const createReplySuggestions = async () => {
    if (!messages.length || repliesLoading) return;
    setRepliesError('');
    setRepliesLoading(true);
    try {
      const { data } = await suggestReplies(messages);
      setReplySuggestions(data.suggestions);
    } catch (err) {
      setRepliesError(err.response?.data?.message || 'Could not create reply suggestions right now.');
    } finally {
      setRepliesLoading(false);
    }
  };

  return (
    <div className="feed-page">
      <Navbar />

      <main className="chat-page">
        <div className={`chat-workspace ${joinedRoom ? 'has-active-chat' : ''}`}>
          <aside className="chat-contacts">
            <div className="chat-contacts-header"><div><h2>Messages</h2><span>{conversations.length} conversations</span></div><MessageCircle size={20} /></div>
            <label className="chat-search"><Search size={16} /><input value={chatSearch} onChange={(event) => setChatSearch(event.target.value)} placeholder="Search messages..." /></label>
            {chatSearch.trim().length >= 2 && <section className="message-search-results"><h4>Messages</h4>{searchingMessages && <p className="chat-muted">Searching...</p>}{!searchingMessages && messageResults.length === 0 && <p className="chat-muted">No matching messages.</p>}{messageResults.map((result) => <button type="button" key={result._id} onClick={() => { navigate(`/chat/${result.roomId}`); setChatSearch(''); }}><strong>{result.senderName}</strong><span>{result.message}</span></button>)}</section>}
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
                {activeContact && <small className="chat-subtitle">{activeContactOnline ? 'Online now' : formatLastSeen(activeContact.lastSeen)}</small>}
              </div>
              <div className="chat-header-actions">
                <button type="button" className="chat-ai-summary" onClick={createSummary} disabled={!messages.length || summaryLoading}><Sparkles size={14} />{summaryLoading ? 'Summarizing...' : 'AI summary'}</button>
                <span className={`chat-status ${(activeContact ? activeContactOnline : connected) ? 'online' : 'offline'}`}>
                  {(activeContact ? activeContactOnline : connected) ? '● Online' : '○ Offline'}
                </span>
              </div>
            </div>

            {(summary || summaryError) && <section className="chat-summary" aria-live="polite">
              <div><Sparkles size={15} /><strong>AI conversation summary</strong></div>
              <button type="button" onClick={() => { setSummary(''); setSummaryError(''); }} aria-label="Close summary"><X size={15} /></button>
              <p className={summaryError ? 'summary-error' : ''}>{summaryError || summary}</p>
            </section>}

            <section className="reply-suggestions" aria-live="polite">
              <button type="button" className="reply-suggestions-trigger" onClick={createReplySuggestions} disabled={!messages.length || repliesLoading}><Lightbulb size={14} />{repliesLoading ? 'Writing suggestions...' : 'Suggest replies'}</button>
              {repliesError && <p className="summary-error">{repliesError}</p>}
              {replySuggestions.length > 0 && <div className="reply-suggestion-list">{replySuggestions.map((reply, index) => <button type="button" key={`${reply}-${index}`} onClick={() => setInput(reply)}>{reply}</button>)}</div>}
            </section>

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
                  {msg.audioUrl ? <audio className="voice-message" controls preload="metadata"><source src={getImageUrl(msg.audioUrl)} /></audio> : msg.attachmentUrl ? (isImageAttachment(msg) ? <a className="image-attachment" href={getImageUrl(msg.attachmentUrl)} target="_blank" rel="noreferrer"><img src={getImageUrl(msg.attachmentUrl)} alt={msg.attachmentName || 'Shared image'} /></a> : <a className="file-attachment" href={getImageUrl(msg.attachmentUrl)} target="_blank" rel="noreferrer"><File size={18} /><span><strong>{msg.attachmentName || 'Attachment'}</strong><small>Open or download file</small></span></a>) : <p>{msg.message}</p>}
                  <div className="message-reactions">{msg.reactions?.map((reaction) => <button type="button" key={reaction.emoji} className={reaction.users?.some((id) => String(id) === String(user?._id)) ? 'active' : ''} onClick={() => toggleReaction(msg.id, reaction.emoji)}>{reaction.emoji} <span>{reaction.users?.length || 0}</span></button>)}<span className="reaction-picker"> <SmilePlus size={13} /> <span className="reaction-options">{REACTION_OPTIONS.map((emoji) => <button type="button" key={emoji} onClick={() => toggleReaction(msg.id, emoji)} aria-label={`React ${emoji}`}>{emoji}</button>)}</span></span></div>
                  <span className="msg-meta"><span className="msg-time">{formatTime(msg.timestamp)}</span><button type="button" className={savedMessageIds.includes(msg.id) ? 'saved' : ''} onClick={() => toggleSavedMessage(msg.id)} aria-label="Save message"><Bookmark size={13} /></button></span>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {typingUserId && <p className="typing-indicator">{typingUser?.username || 'Someone'} is typing<span>...</span></p>}

            <form className="chat-input-area" onSubmit={sendMessage}>
              <input ref={attachmentInputRef} className="attachment-input" type="file" accept="image/*,.pdf,.txt,.zip,.doc,.docx,.xls,.xlsx" onChange={sendAttachment} />
              <button type="button" className="attachment-btn" onClick={() => attachmentInputRef.current?.click()} disabled={!connected || uploadingAttachment || recording || Boolean(voiceBlob)} aria-label="Attach a file">{uploadingAttachment ? <span className="attachment-loader" /> : <Paperclip size={18} />}</button>
              {voicePreview ? <div className="voice-preview"><audio controls src={voicePreview} /><button type="button" onClick={clearVoice} aria-label="Discard voice message"><Trash2 size={16} /></button><button type="button" onClick={sendVoice} disabled={uploadingVoice || !connected}><Send size={16} />{uploadingVoice ? 'Sending...' : 'Send voice'}</button></div> : <button type="button" className={`voice-record-btn ${recording ? 'recording' : ''}`} onClick={recording ? stopRecording : startRecording} disabled={!connected} aria-label={recording ? 'Stop recording' : 'Record voice message'}>{recording ? <Square size={15} fill="currentColor" /> : <Mic size={18} />}</button>}
              <input
                value={input}
                onChange={handleInputChange}
                placeholder="اكتب رسالة..."
                disabled={!connected || recording || Boolean(voiceBlob)}
              />
              <button type="submit" className="btn-primary btn-sm" disabled={!connected || !input.trim() || recording || Boolean(voiceBlob)}>
                إرسال
              </button>
            </form>
          </div>}
        </div>
      </main>
    </div>
  );
}
