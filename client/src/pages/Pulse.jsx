import { useEffect, useRef, useState } from 'react';
import { Bot, HeartPulse, LockKeyhole, Send, Users } from 'lucide-react';
import Navbar from '../components/Navbar';
import { joinPulse } from '../api/pulse';
import { useSocket } from '../hooks/useSocket';
import { useAuth } from '../context/AuthContext';
import { useFeedback } from '../context/FeedbackContext';
import { askAI } from '../api/ai';

const moods = [{ id: 'happy', label: 'سعيد', icon: '😊' }, { id: 'stressed', label: 'مضغوط', icon: '😮‍💨' }, { id: 'talk', label: 'محتاج أتكلم', icon: '💬' }, { id: 'focused', label: 'مركز', icon: '🎯' }];
const topics = [{ id: 'work', label: 'شغل' }, { id: 'study', label: 'دراسة' }, { id: 'relationships', label: 'علاقات' }, { id: 'football', label: 'كورة' }, { id: 'technology', label: 'تقنية' }];

export default function Pulse() {
  const { user } = useAuth(); const { socket, connected } = useSocket(); const { showToast } = useFeedback();
  const [mood, setMood] = useState('happy'); const [topic, setTopic] = useState('work'); const [privacy, setPrivacy] = useState('anonymous'); const [mode, setMode] = useState('group');
  const [session, setSession] = useState(null); const [messages, setMessages] = useState([]); const [input, setInput] = useState(''); const [joining, setJoining] = useState(false); const [aiLoading, setAiLoading] = useState(false); const [pulseReady, setPulseReady] = useState(false);
  const endRef = useRef(null);
  useEffect(() => { if (socket && user?._id) socket.emit('register_user', user._id); }, [socket, user?._id]);
  useEffect(() => {
    if (!socket || !session?.roomId) return;
    setPulseReady(false);
    const history = (items) => { setMessages(Array.isArray(items) ? items : []); setPulseReady(true); };
    const message = (item) => {
      // Do not let a malformed socket payload take down the entire page.
      if (!item || typeof item !== 'object') return;
      setMessages((items) => [...items, item]);
    };
    const unavailable = (payload = {}) => { showToast(payload.message || 'تعذّر فتح مساحة النبض.', 'error'); setSession(null); };
    // Subscribe first: the server may answer immediately after join_pulse.
    socket.on('pulse_history', history);
    socket.on('pulse_message', message);
    socket.on('pulse_error', unavailable);
    socket.emit('join_pulse', session.roomId);
    return () => { socket.off('pulse_history', history); socket.off('pulse_message', message); socket.off('pulse_error', unavailable); };
  }, [socket, session?.roomId, showToast]);
  useEffect(() => {
    // Some embedded/mobile browsers do not expose scrollIntoView. An error in
    // an effect unmounts this route, which previously looked like a blank page
    // immediately after sending a message.
    const scrollToLatestMessage = endRef.current?.scrollIntoView;
    if (typeof scrollToLatestMessage !== 'function') return;
    try {
      scrollToLatestMessage.call(endRef.current, { behavior: 'smooth', block: 'end' });
    } catch {
      // Scrolling is only a convenience; it must never break the chat screen.
    }
  }, [messages]);
  const start = async () => { setMessages([]); if (mode === 'ai') { setSession({ solo: true }); return; } setJoining(true); try { const { data } = await joinPulse({ mood, topic, privacy }); setSession(data); } catch (error) { showToast(error.response?.data?.message || 'تعذّر بدء النبض.', 'error'); } finally { setJoining(false); } };
  const send = async (event) => { event.preventDefault(); const text = input.trim(); if (!text || !session) return; if (session.solo) { setInput(''); setMessages((items) => [...items, { _id: `me-${Date.now()}`, sender: user?._id || 'me', senderName: user?.username || 'أنت', message: text }]); setAiLoading(true); try { const moodLabel = moods.find((item) => item.id === mood)?.label; const topicLabel = topics.find((item) => item.id === topic)?.label; const { data } = await askAI(`أنت مستشار داعم داخل ميزة نبضك اليوم. حالة المستخدم: ${moodLabel}. الموضوع: ${topicLabel}. قدّم نصيحة عملية ولطيفة بالعربية، بدون تشخيص طبي. رسالة المستخدم: ${text}`); setMessages((items) => [...items, { _id: `ai-${Date.now()}`, sender: 'ai', senderName: 'Chatterly AI', message: data.answer || 'لم أتمكن من صياغة رد الآن.' }]); } catch (error) { showToast(error.response?.data?.message || 'تعذّر الحصول على نصيحة الآن.', 'error'); } finally { setAiLoading(false); } return; } if (!connected || !pulseReady || !session.roomId) return; setInput(''); socket.emit('send_pulse_message', { roomId: session.roomId, senderName: privacy === 'anonymous' ? 'نبض مجهول' : user?.username || 'عضو نبض', message: text }); };
  if (!session) return <div className="feed-page"><Navbar /><main className="standalone-content pulse-page"><section className="pulse-intro"><HeartPulse size={35} /><span className="eyebrow">YOUR DAILY PULSE</span><h1>نبضك اليوم</h1><p>اختار إحساسك وموضوعك، وادخل مساحة صغيرة مع ناس على نفس الموجة لمدة اليوم فقط.</p></section><section className="pulse-picker"><h2>تحب تبدأ إزاي؟</h2><div className="pulse-mode"><button type="button" className={mode === 'group' ? 'selected' : ''} onClick={() => setMode('group')}><Users size={21} /><strong>مع مجموعة</strong><small>تكلم مع ناس على نفس الموجة</small></button><button type="button" className={mode === 'ai' ? 'selected' : ''} onClick={() => setMode('ai')}><Bot size={21} /><strong>مع AI لوحدك</strong><small>خد نصيحة خاصة ومباشرة</small></button></div><h2>إنت حاسس بإيه؟</h2><div className="pulse-options">{moods.map((item) => <button key={item.id} type="button" className={mood === item.id ? 'selected' : ''} onClick={() => setMood(item.id)}><span>{item.icon}</span>{item.label}</button>)}</div><h2>حابب تتكلم عن إيه؟</h2><div className="pulse-options topics">{topics.map((item) => <button key={item.id} type="button" className={topic === item.id ? 'selected' : ''} onClick={() => setTopic(item.id)}>{item.label}</button>)}</div>{mode === 'group' && <><h2>تحب تظهر إزاي؟</h2><div className="pulse-privacy"><button type="button" className={privacy === 'anonymous' ? 'selected' : ''} onClick={() => setPrivacy('anonymous')}><LockKeyhole size={18} /><span>مجهول</span><small>اسمك وصورتك مش هيظهروا</small></button><button type="button" className={privacy === 'known' ? 'selected' : ''} onClick={() => setPrivacy('known')}><Users size={18} /><span>باسمك</span><small>يظهر اسمك للمجموعة</small></button></div></>}<button type="button" className="btn-primary pulse-start" disabled={joining} onClick={start}>{mode === 'ai' ? <Bot size={18} /> : <HeartPulse size={18} />}{joining ? 'جاري إيجاد مجموعتك...' : mode === 'ai' ? 'اتكلم مع AI' : 'ابدأ نبضك'}</button></section></main></div>;
  return <div className="feed-page"><Navbar /><main className="standalone-content pulse-page"><section className="pulse-room"><header><div><span className="eyebrow">{session.solo ? 'PRIVATE AI PULSE' : 'DAILY PULSE'}</span><h1>{session.solo ? <><Bot size={20} /> Chatterly AI</> : <>{moods.find((item) => item.id === mood)?.icon} {topics.find((item) => item.id === topic)?.label}</>}</h1><p>{session.solo ? 'مساحة خاصة بينك وبين المساعد' : `${session.membersCount} في المساحة الآن · تنتهي الليلة`}</p></div><button type="button" className="btn-secondary" onClick={() => setSession(null)}>خروج</button></header><p className="pulse-question">{session.solo ? 'احكي براحتك، والمساعد هيدي لك نصيحة عملية مناسبة لحالتك.' : 'إيه أكتر حاجة شاغلة بالك بخصوص الموضوع ده النهارده؟'}</p><div className="pulse-messages">{messages.length === 0 && <p>{session.solo ? 'ابدأ واحكي للمساعد اللي في بالك.' : pulseReady ? 'ابدأ الكلام براحتك — المساحة دي مؤقتة ومحدودة.' : 'جاري تجهيز المجموعة...'}</p>}{messages.filter((message) => message && typeof message === 'object').map((message, index) => <article key={message._id || message.timestamp || `pulse-message-${index}`} className={String(message.sender) === String(user?._id) ? 'mine' : ''}><strong>{message.senderName || 'عضو نبض'}</strong><span>{message.message || ''}</span></article>)}{aiLoading && <article><strong>Chatterly AI</strong><span>بفكر معاك...</span></article>}<div ref={endRef} /></div><form onSubmit={send}><input value={input} onChange={(event) => setInput(event.target.value)} placeholder={session.solo ? 'احكي للمساعد...' : 'اكتب اللي حاسس به...'} /><button className="btn-primary" type="submit" disabled={(!connected && !session.solo) || (!pulseReady && !session.solo) || !input.trim() || aiLoading} aria-label="Send"><Send size={18} /></button></form></section></main></div>;
}
