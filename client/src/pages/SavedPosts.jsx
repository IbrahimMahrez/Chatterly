import { useEffect, useState } from 'react';
import { Bookmark as BookmarkIcon } from 'lucide-react';
import Navbar from '../components/Navbar';
import PostCard from '../components/PostCard';
import { getSavedPosts } from '../api/users';
import LoadingScreen from '../components/LoadingScreen';
import SavedTabs from '../components/SavedTabs';
import { useLanguage } from '../context/LanguageContext';

export default function SavedPosts() {
  const { isArabic } = useLanguage();
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
        <div className="saved-page-heading"><div><h1>{isArabic ? 'المحفوظات' : 'Saved items'}</h1><p>{isArabic ? 'كل ما احتفظت به للرجوع إليه لاحقًا.' : 'Everything you saved to revisit later.'}</p></div><BookmarkIcon size={24} /></div>
        <SavedTabs />
        {loading && <LoadingScreen compact />}
        {!loading && posts.length === 0 && <p className="placeholder-text">You have no saved posts.</p>}
        <div className="posts-list">
          {posts.map((post) => <PostCard key={post._id} post={post} onUpdate={updatePost} onDelete={() => {}} />)}
        </div>
      </main>
    </div>
  );
}
