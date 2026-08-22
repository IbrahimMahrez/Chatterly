import { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import CreatePost from '../components/CreatePost';
import PostCard from '../components/PostCard';
import { getPosts } from '../api/posts';
import { getFollowingFeed } from '../api/users';

export default function Feed() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('all');

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

  const handlePostUpdate = (postId, updates) => {
    setPosts((prev) =>
      prev.map((p) => (p._id === postId ? { ...p, ...updates } : p))
    );
  };

  const handlePostDelete = (postId) => {
    setPosts((prev) => prev.filter((p) => p._id !== postId));
  };

  return (
    <div className="feed-page">
      <Navbar />

      <main className="feed-content">
        <div className="feed-tabs">
          <button
            type="button"
            className={`feed-tab ${tab === 'all' ? 'active' : ''}`}
            onClick={() => setTab('all')}
          >
            الكل
          </button>
          <button
            type="button"
            className={`feed-tab ${tab === 'following' ? 'active' : ''}`}
            onClick={() => setTab('following')}
          >
            المتابَعين
          </button>
        </div>

        {tab === 'all' && <CreatePost onPostCreated={fetchPosts} />}

        {loading && <p className="status-text">جاري التحميل...</p>}
        {error && <div className="error-msg">{error}</div>}

        {!loading && !error && posts.length === 0 && (
          <p className="placeholder-text">
            {tab === 'following'
              ? 'تابع مستخدمين عشان تشوف منشوراتهم هنا'
              : 'مفيش منشورات لسه — انشر أول منشور!'}
          </p>
        )}

        <div className="posts-list">
          {posts.map((post) => (
            <PostCard
              key={post._id}
              post={post}
              onUpdate={handlePostUpdate}
              onDelete={handlePostDelete}
            />
          ))}
        </div>
      </main>
    </div>
  );
}
