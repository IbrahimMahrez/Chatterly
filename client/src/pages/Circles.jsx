import { useEffect, useState } from 'react';
import { CheckCircle2, CircleDot, MessageCircle, Plus, Target, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import LoadingScreen from '../components/LoadingScreen';
import { addCircleCheckIn, createCircle, getCircles, joinCircle } from '../api/circles';
import { useFeedback } from '../context/FeedbackContext';

const initialForm = { title: '', goal: '', days: 7, maxMembers: 6 };

export default function Circles() {
  const navigate = useNavigate();
  const { showToast } = useFeedback();
  const [circles, setCircles] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [checkIns, setCheckIns] = useState({});
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [busyId, setBusyId] = useState('');

  useEffect(() => {
    getCircles().then(({ data }) => setCircles(data)).catch(() => showToast('تعذّر تحميل الدوائر الآن.', 'error')).finally(() => setLoading(false));
  }, [showToast]);

  const replaceCircle = (updated) => setCircles((items) => items.map((item) => item._id === updated._id ? updated : item));
  const submit = async (event) => {
    event.preventDefault();
    if (creating) return;
    setCreating(true);
    try {
      const { data } = await createCircle(form);
      setCircles((items) => [data, ...items]);
      setForm(initialForm);
      showToast('تم إنشاء دائرتك. ادعُ الناس للانضمام!', 'success');
    } catch (error) { showToast(error.response?.data?.message || 'تعذّر إنشاء الدائرة.', 'error'); }
    finally { setCreating(false); }
  };
  const join = async (id) => {
    setBusyId(id);
    try { const { data } = await joinCircle(id); replaceCircle(data); showToast('انضممت إلى الدائرة.', 'success'); }
    catch (error) { showToast(error.response?.data?.message || 'تعذّر الانضمام.', 'error'); }
    finally { setBusyId(''); }
  };
  const checkIn = async (circle) => {
    const text = checkIns[circle._id]?.trim();
    if (!text) return;
    setBusyId(circle._id);
    try { const { data } = await addCircleCheckIn(circle._id, text); replaceCircle(data); setCheckIns((items) => ({ ...items, [circle._id]: '' })); showToast('تم تسجيل إنجازك اليوم.', 'success'); }
    catch (error) { showToast(error.response?.data?.message || 'تعذّر حفظ المتابعة.', 'error'); }
    finally { setBusyId(''); }
  };

  return <div className="feed-page"><Navbar /><main className="standalone-content circles-page">
    <header className="circles-heading"><div><span className="eyebrow">FOCUS TOGETHER</span><h1><CircleDot size={28} /> دوائر الاهتمام</h1><p>كوّن مجموعة صغيرة لهدف واضح، تابعوا تقدمكم يوميًا، وتواصلوا في مساحة واحدة تنتهي عند اكتمال الهدف.</p></div></header>
    <form className="circle-create" onSubmit={submit}>
      <label><span>اسم الدائرة</span><input required maxLength="90" value={form.title} onChange={(event) => setForm((item) => ({ ...item, title: event.target.value }))} placeholder="مثال: تحدي React الأسبوعي" /></label>
      <label className="circle-goal"><span>الهدف</span><input required maxLength="300" value={form.goal} onChange={(event) => setForm((item) => ({ ...item, goal: event.target.value }))} placeholder="مثال: إنهاء أساسيات React وبناء مشروع صغير" /></label>
      <label><span>المدة بالأيام</span><input type="number" min="1" max="30" value={form.days} onChange={(event) => setForm((item) => ({ ...item, days: event.target.value }))} /></label>
      <label><span>عدد الأعضاء</span><input type="number" min="3" max="8" value={form.maxMembers} onChange={(event) => setForm((item) => ({ ...item, maxMembers: event.target.value }))} /></label>
      <button className="btn-primary" type="submit" disabled={creating}><Plus size={17} />{creating ? 'جاري الإنشاء...' : 'أنشئ دائرة'}</button>
    </form>
    {loading ? <LoadingScreen compact /> : <section className="circle-grid">
      {circles.length === 0 && <p className="placeholder-text">لا توجد دوائر نشطة الآن. كن أول من يبدأ واحدة.</p>}
      {circles.map((circle) => <article className="circle-card" key={circle._id}>
        <div className="circle-card-top"><span className="circle-icon"><Target size={18} /></span><span>{Math.max(1, Math.ceil((new Date(circle.endsAt) - new Date()) / 86_400_000))} أيام متبقية</span></div>
        <h2>{circle.title}</h2><p>{circle.goal}</p>
        <div className="circle-meta"><span><Users size={15} /> {circle.membersCount}/{circle.maxMembers}</span><span>بواسطة {circle.owner?.username || 'عضو Chatterly'}</span></div>
        {!circle.isMember ? <button type="button" className="btn-primary circle-action" disabled={busyId === circle._id} onClick={() => join(circle._id)}><Users size={16} /> انضم للدائرة</button> : <>
          <div className="circle-checkin"><input value={checkIns[circle._id] || ''} onChange={(event) => setCheckIns((items) => ({ ...items, [circle._id]: event.target.value }))} maxLength="500" placeholder="إيه اللي أنجزته اليوم؟" /><button type="button" disabled={!checkIns[circle._id]?.trim() || busyId === circle._id} onClick={() => checkIn(circle)} aria-label="Save check-in"><CheckCircle2 size={18} /></button></div>
          <button type="button" className="btn-secondary circle-action" onClick={() => navigate(`/chat/${circle.roomId}`)}><MessageCircle size={16} /> افتح نقاش الدائرة</button>
        </>}
      </article>)}
    </section>}
  </main></div>;
}
