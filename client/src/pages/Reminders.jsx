import { useEffect, useState } from 'react';
import { BellRing, Check, Clock3, Plus, Trash2 } from 'lucide-react';
import Navbar from '../components/Navbar';
import LoadingScreen from '../components/LoadingScreen';
import { createReminder, deleteReminder, getReminders, updateReminder } from '../api/reminders';
import { useFeedback } from '../context/FeedbackContext';

const toLocalInputValue = (date = new Date(Date.now() + 60 * 60 * 1000)) => {
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
};

export default function Reminders() {
  const { showToast } = useFeedback();
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [title, setTitle] = useState('');
  const [dueAt, setDueAt] = useState(toLocalInputValue());

  useEffect(() => {
    getReminders().then(({ data }) => setReminders(data)).catch(() => showToast('تعذّر تحميل التذكيرات.', 'error')).finally(() => setLoading(false));
  }, [showToast]);

  const addReminder = async (event) => {
    event.preventDefault();
    if (!title.trim() || submitting) return;
    setSubmitting(true);
    try {
      const { data } = await createReminder({ title, dueAt: new Date(dueAt).toISOString() });
      setReminders((items) => [...items, data].sort((a, b) => new Date(a.dueAt) - new Date(b.dueAt)));
      setTitle('');
      setDueAt(toLocalInputValue());
      showToast('تم حفظ التذكير. هنفكّرك بإشعار وإيميل.', 'success');
    } catch (error) {
      showToast(error.response?.data?.message || 'تعذّر حفظ التذكير.', 'error');
    } finally { setSubmitting(false); }
  };

  const toggleCompleted = async (reminder) => {
    try {
      const { data } = await updateReminder(reminder._id, { completed: !reminder.completed });
      setReminders((items) => items.map((item) => item._id === data._id ? data : item));
    } catch { showToast('تعذّر تحديث التذكير.', 'error'); }
  };

  const removeReminder = async (id) => {
    try { await deleteReminder(id); setReminders((items) => items.filter((item) => item._id !== id)); }
    catch { showToast('تعذّر حذف التذكير.', 'error'); }
  };

  return <div className="feed-page"><Navbar /><main className="standalone-content reminders-page">
    <header className="reminders-heading"><div><span className="eyebrow">CHATTERLY REMINDERS</span><h1>افتكرها في وقتها</h1><p>أضف موعدك، وChatterly هيبعتلك إشعارًا داخل الموقع وعلى الإيميل.</p></div><BellRing size={30} /></header>
    <form className="reminder-form" onSubmit={addReminder}>
      <label><span>عاوز تفتكر إيه؟</span><input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="مثال: معاد الدكتور بكرة" maxLength="180" required /></label>
      <label><span>المعاد</span><input type="datetime-local" value={dueAt} min={toLocalInputValue(new Date())} onChange={(event) => setDueAt(event.target.value)} required /></label>
      <button type="submit" className="btn-primary" disabled={submitting}><Plus size={17} />{submitting ? 'جاري الحفظ...' : 'إضافة تذكير'}</button>
    </form>
    {loading ? <LoadingScreen compact /> : <section className="reminder-list">
      {reminders.length === 0 && <p className="placeholder-text">مفيش تذكيرات لسه. أضف أول موعد مهم ليك.</p>}
      {reminders.map((reminder) => <article className={`reminder-card ${reminder.completed ? 'completed' : ''}`} key={reminder._id}>
        <button type="button" className="reminder-complete" onClick={() => toggleCompleted(reminder)} aria-label="Mark reminder complete"><Check size={16} /></button>
        <div><strong>{reminder.title}</strong><span><Clock3 size={14} />{new Date(reminder.dueAt).toLocaleString('ar-EG', { dateStyle: 'medium', timeStyle: 'short' })}</span></div>
        <button type="button" className="reminder-delete" onClick={() => removeReminder(reminder._id)} aria-label="Delete reminder"><Trash2 size={17} /></button>
      </article>)}
    </section>}
  </main></div>;
}
