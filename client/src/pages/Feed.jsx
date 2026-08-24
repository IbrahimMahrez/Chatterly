import { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import CreatePost from '../components/CreatePost';
import PostCard from '../components/PostCard';
import { getPosts } from '../api/posts';
import { getFollowingFeed } from '../api/users';
import { Search } from 'lucide-react';
import RightSidebar from '../components/RightSidebar';
import Stories from '../components/Stories';
import AIAssistant from '../components/AIAssistant';
import LoadingScreen from '../components/LoadingScreen';
import { useLanguage } from '../context/LanguageContext';

export default function Feed() {
  const { t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('all');
  const [search, setSearch] = useState('');
  const [welcomeMessage, setWelcomeMessage] = useState(location.state?.welcomeMessage || '');
  const [welcomeIsAdmin, setWelcomeIsAdmin] = useState(Boolean(location.state?.isAdmin));
  const [suggestedPost, setSuggestedPost] = useState('');

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      if (tab === 'following') {
        const { data } = await getFollowingFeed();
        setPosts(data.results || []);
      } else {
        const { data } = await getPosts();
        setPosts(data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'فشل تحميل المنشورات');
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  useEffect(() => {
    if (!location.state?.welcomeMessage) return undefined;
    const timer = setTimeout(() => setWelcomeMessage(''), 5000);
    setWelcomeIsAdmin(Boolean(location.state.isAdmin));
    navigate(location.pathname, { replace: true, state: {} });
    return () => clearTimeout(timer);
  }, [location.pathname, location.state, navigate]);

  const handlePostUpdate = (postId, updates) => {
    setPosts((prev) =>
      prev.map((p) => (p._id === postId ? { ...p, ...updates } : p))
    );
  };

  const handlePostDelete = (postId) => {
    setPosts((prev) => prev.filter((p) => p._id !== postId));
  };

  const visiblePosts = posts.filter((post) => {
    const authorName = post.author?.username || '';
    return `${authorName} ${post.content}`.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="feed-page">
      <Navbar />
      <div className="feed-shell">
        <main className="feed-content">
          {welcomeMessage && (
            <div className={`welcome-message ${welcomeIsAdmin ? 'admin-welcome' : ''}`}>
              {welcomeMessage}
            </div>
          )}
          <header className="feed-topbar">
            <label className="feed-search"><Search size={18} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={t('search')} /></label>
          </header>
          <div className="feed-tabs">
            <button type="button" className={tab === 'all' ? 'active' : ''} onClick={() => setTab('all')}>{t('allPosts')}</button>
            <button type="button" className={tab === 'following' ? 'active' : ''} onClick={() => setTab('following')}>{t('following')}</button>
          </div>
          {tab === 'all' && <CreatePost initialContent={suggestedPost} onPostCreated={fetchPosts} />}
          <Stories />
          {loading && <LoadingScreen compact />}
          {error && <div className="error-msg">{error}</div>}
          {!loading && !error && posts.length === 0 && <p className="placeholder-text">{t('noPosts')}</p>}
          <div className="posts-list">{visiblePosts.map((post) => <PostCard key={post._id} post={post} onUpdate={handlePostUpdate} onDelete={handlePostDelete} />)}</div>
        </main>
        <RightSidebar />
      </div>
      <AIAssistant onUseSuggestion={setSuggestedPost} />
    </div>
  );
}
