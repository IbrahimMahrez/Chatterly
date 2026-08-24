import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import PostCard from '../components/PostCard';
import { getSavedPosts } from '../api/users';
import LoadingScreen from '../components/LoadingScreen';

export default function SavedPosts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSavedPosts()
      .then(({ data }) => setPosts(data))
      .finally(() => setLoading(false));
  }, []);

  const updatePost = (postId, updates) => {
    if (updates.savedBy && !updates.savedBy.length) {
      setPosts((current) => current.filter((post) => post._id !== postId));
      return;
    }
    setPosts((current) => current.map((post) => post._id === postId ? { ...post, ...updates } : post));
  };

  return (
    <div className="feed-page">
      <Navbar />
      <main className="standalone-content">
        <h1>Saved Posts</h1>
        {loading && <LoadingScreen compact />}
        {!loading && posts.length === 0 && <p className="placeholder-text">You have no saved posts.</p>}
        <div className="posts-list">
          {posts.map((post) => <PostCard key={post._id} post={post} onUpdate={updatePost} onDelete={() => {}} />)}
        </div>
      </main>
    </div>
  );
}
