import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import PostCard from '../components/PostCard';
import { getPostById } from '../api/posts';
import { getComments, createComment, deleteComment, likeComment } from '../api/comments';
import { useAuth } from '../context/AuthContext';

function CommentItem({ comment, onDelete, onLike }) {
  const { user } = useAuth();
  const authorId = comment.author?._id || comment.author;
  const isOwner = authorId?.toString() === user?._id?.toString();
  const isLiked = comment.likes?.some((id) => id.toString() === user?._id?.toString());

  return (
    <div className="comment-item">
      <div className="comment-header">
        <strong>{comment.author?.username || 'مستخدم'}</strong>
      </div>
      <p>{comment.content}</p>
      <div className="comment-actions">
        <button
          type="button"
          className={`btn-like ${isLiked ? 'liked' : ''}`}
          onClick={() => onLike(comment._id)}
        >
          {isLiked ? '❤️' : '🤍'} {comment.likes?.length ?? 0}
        </button>
        {isOwner && (
          <button type="button" className="btn-delete" onClick={() => onDelete(comment._id)}>
            حذف
          </button>
        )}
      </div>
    </div>
  );
}

export default function PostDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchData = useCallback(async () => {
    setError('');
    try {
      const [postRes, commentsRes] = await Promise.all([
        getPostById(id),
        getComments(id),
      ]);
      setPost(postRes.data);
      setComments(commentsRes.data);
    } catch (err) {
      setError(err.response?.data?.message || 'فشل تحميل المنشور');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    setSubmitting(true);
    try {
      const { data } = await createComment(id, content.trim());
      setComments((prev) => [
        { ...data, author: { _id: user._id, username: user.username }, likes: [] },
        ...prev,
      ]);
      setContent('');
    } catch (err) {
      alert(err.response?.data?.message || 'فشل إضافة التعليق');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await deleteComment(commentId);
      setComments((prev) => prev.filter((c) => c._id !== commentId));
    } catch (err) {
      alert(err.response?.data?.message || 'فشل حذف التعليق');
    }
  };

  const handleLikeComment = async (commentId) => {
    try {
      const { data } = await likeComment(commentId);
      setComments((prev) =>
        prev.map((c) => {
          if (c._id !== commentId) return c;
          const wasLiked = c.likes?.some((lid) => lid.toString() === user._id.toString());
          return {
            ...c,
            likes: wasLiked
              ? c.likes.filter((lid) => lid.toString() !== user._id.toString())
              : [...(c.likes || []), user._id],
            likesCount: data.likesCount,
          };
        })
      );
    } catch {
      /* silent */
    }
  };

  if (loading) {
    return (
      <div className="feed-page">
        <Navbar />
        <p className="status-text">جاري التحميل...</p>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="feed-page">
        <Navbar />
        <main className="feed-content">
          <div className="error-msg">{error || 'المنشور غير موجود'}</div>
          <Link to="/feed">← رجوع للـ Feed</Link>
        </main>
      </div>
    );
  }

  return (
    <div className="feed-page">
      <Navbar />

      <main className="feed-content">
        <Link to="/feed" className="back-link">← رجوع للـ Feed</Link>

        <PostCard
          post={post}
          onUpdate={(_, updates) => setPost((p) => ({ ...p, ...updates }))}
          onDelete={() => navigate('/feed')}
        />

        <section className="comments-section">
          <h4>التعليقات ({comments.length})</h4>

          <form className="comment-form" onSubmit={handleAddComment}>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="اكتب تعليق..."
              rows={2}
              required
            />
            <button type="submit" className="btn-primary btn-sm" disabled={submitting}>
              {submitting ? 'جاري الإرسال...' : 'إرسال'}
            </button>
          </form>

          {comments.length === 0 && (
            <p className="status-text">مفيش تعليقات لسه — كن أول واحد!</p>
          )}

          <div className="comments-list">
            {comments.map((comment) => (
              <CommentItem
                key={comment._id}
                comment={comment}
                onDelete={handleDeleteComment}
                onLike={handleLikeComment}
              />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
