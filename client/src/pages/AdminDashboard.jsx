import { useEffect, useState } from 'react';
import { Activity, FileText, MessageCircle, ShieldCheck, Users, Images, Trash2 } from 'lucide-react';
import Navbar from '../components/Navbar';
import { getAdminDashboard } from '../api/dashboards';
import { getImageUrl } from '../utils/images';
import { deleteUser } from '../api/users';
import { deletePost } from '../api/posts';
import { useAuth } from '../context/AuthContext';
import { useFeedback } from '../context/FeedbackContext';

const statCards = [
  ['users', 'Users', Users], ['posts', 'Posts', FileText], ['comments', 'Comments', MessageCircle], ['messages', 'Messages', Activity], ['stories', 'Active stories', Images],
];

export default function AdminDashboard() {
  const { user: currentUser } = useAuth();
  const { confirmAction, showToast } = useFeedback();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const loadDashboard = () => getAdminDashboard().then(({ data: result }) => setData(result)).catch((err) => setError(err.response?.data?.message || 'Admin access required'));
  useEffect(() => { loadDashboard(); }, []);

  const handleDeleteUser = async (user) => {
    if (user._id === currentUser?._id) return;
    const confirmed = await confirmAction({ title: 'حذف المستخدم', message: `سيتم حذف حساب ${user.username} نهائيًا.`, confirmLabel: 'حذف المستخدم' });
    if (!confirmed) return;
    try { await deleteUser(user._id); await loadDashboard(); showToast('تم حذف المستخدم.', 'success'); } catch (err) { showToast(err.response?.data?.message || 'تعذر حذف المستخدم.', 'error'); }
  };

  const handleDeletePost = async (post) => {
    const confirmed = await confirmAction({ title: 'حذف المنشور', message: 'سيتم حذف المنشور نهائيًا.', confirmLabel: 'حذف المنشور' });
    if (!confirmed) return;
    try { await deletePost(post._id); await loadDashboard(); showToast('تم حذف المنشور.', 'success'); } catch (err) { showToast(err.response?.data?.message || 'تعذر حذف المنشور.', 'error'); }
  };

  return (
    <div className="feed-page">
      <Navbar />
      <main className="dashboard-page admin-dashboard">
        <header className="dashboard-heading"><div><span className="eyebrow">ADMIN CONTROL</span><h1>Admin Dashboard</h1><p>Monitor the real activity across Chatterly.</p></div><ShieldCheck size={30} /></header>
        {error && <div className="error-msg">{error}</div>}
        {!data && !error && <p className="status-text">Loading admin data...</p>}
        {data && <>
          <section className="dashboard-stat-grid">{statCards.map(([key, label, Icon]) => <div className="dashboard-stat" key={key}><Icon size={19} /><strong>{data.stats[key]}</strong><span>{label}</span></div>)}</section>
          <div className="admin-grid">
            <section className="dashboard-section"><div className="dashboard-section-title"><h2>Latest users</h2><span>{data.stats.users} total</span></div><div className="admin-list">{data.latestUsers.map((user) => <div className="admin-row" key={user._id}>{getImageUrl(user.profilePicture) ? <img src={getImageUrl(user.profilePicture)} alt="" /> : <span>{user.username[0]}</span>}<div><strong>{user.username}</strong><small>{user.email}</small></div><b>{user.isAdmin ? 'Admin' : 'Member'}</b>{user._id !== currentUser?._id && <button type="button" className="admin-delete" onClick={() => handleDeleteUser(user)} aria-label={`Delete ${user.username}`}><Trash2 size={15} /></button>}</div>)}</div></section>
            <section className="dashboard-section"><div className="dashboard-section-title"><h2>Latest posts</h2><span>{data.stats.posts} total</span></div><div className="admin-post-list">{data.latestPosts.map((post) => <article key={post._id}><strong>{post.author?.username || 'Unknown user'}</strong><p>{post.content}</p><small>{new Date(post.createdAt).toLocaleDateString('en-US')}</small><button type="button" className="admin-delete" onClick={() => handleDeletePost(post)} aria-label="Delete post"><Trash2 size={15} /></button></article>)}</div></section>
          </div>
        </>}
      </main>
    </div>
  );
}
