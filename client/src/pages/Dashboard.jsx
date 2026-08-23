import { useEffect, useState } from 'react';
import { BarChart3, Bookmark, Heart, MessageCircle, Users, Bell, FileText } from 'lucide-react';
import Navbar from '../components/Navbar';
import PostCard from '../components/PostCard';
import { getUserDashboard } from '../api/dashboards';

const cards = [
  ['posts', 'Posts', FileText],
  ['likesReceived', 'Likes received', Heart],
  ['comments', 'Comments', MessageCircle],
  ['savedPosts', 'Saved posts', Bookmark],
  ['followers', 'Followers', Users],
  ['unreadNotifications', 'Unread notifications', Bell],
];

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    getUserDashboard().then(({ data: dashboard }) => setData(dashboard)).catch((err) => setError(err.response?.data?.message || 'Failed to load dashboard'));
  }, []);

  return <div className="feed-page"><Navbar /><main className="dashboard-page">
    <header className="dashboard-heading"><div><span className="eyebrow">YOUR SPACE</span><h1>{data?.user?.username || 'My dashboard'}</h1><p>Track your activity and keep your Chatterly profile close.</p></div><BarChart3 size={30} /></header>
    {error && <div className="error-msg">{error}</div>}
    {!data && !error && <p className="status-text">Loading dashboard...</p>}
    {data && <>
      <section className="dashboard-stat-grid">{cards.map(([key, label, Icon]) => <div className="dashboard-stat" key={key}><Icon size={19} /><strong>{data.stats[key]}</strong><span>{label}</span></div>)}</section>
      <section className="dashboard-section"><div className="dashboard-section-title"><h2>Recent posts</h2><span>{data.recentPosts.length} latest</span></div>{data.recentPosts.length ? <div className="posts-list">{data.recentPosts.map((post) => <PostCard key={post._id} post={post} onUpdate={() => {}} onDelete={() => {}} />)}</div> : <p className="placeholder-text">You have not published a post yet.</p>}</section>
    </>}
  </main></div>;
}
