import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { likePost, deletePost } from '../api/posts';
import { getImageUrl } from '../utils/images';
import { savePost } from '../api/posts';
import { Bookmark } from 'lucide-react';
import { useFeedback } from '../context/FeedbackContext';

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function PostCard({ post, onUpdate, onDelete }) {
  const { user } = useAuth();
  const { confirmAction, showToast } = useFeedback();

  const authorId = post.author?._id || post.author;
  const isOwner = authorId?.toString() === user?._id?.toString();
  const isLiked = post.likes?.some((id) => id.toString() === user?._id?.toString());
  const isSaved = post.savedBy?.some((id) => id.toString() === user?._id?.toString());

  const handleLike = async () => {
    try {
      const { data } = await likePost(post._id);
      onUpdate(post._id, {
        likes: isLiked
          ? post.likes.filter((id) => id.toString() !== user._id.toString())
          : [...(post.likes || []), user._id],
        likesCount: data.likesCount,
      });
    } catch {
      /* silent */
    }
  };

  const handleSave = async () => {
    try {
      const { data } = await savePost(post._id);
      onUpdate(post._id, {
        savedBy: data.saved
          ? [...(post.savedBy || []), user._id]
          : (post.savedBy || []).filter((id) => id.toString() !== user._id.toString()),
      });
    } catch {
      /* silent */
    }
  };

  const handleDelete = async () => {
    const confirmed = await confirmAction({ title: 'حذف المنشور', message: 'لن تستطيع استرجاع المنشور بعد حذفه.', confirmLabel: 'حذف المنشور' });
    if (!confirmed) return;
    try {
      await deletePost(post._id);
      onDelete(post._id);
      showToast('تم حذف المنشور بنجاح.', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'تعذر حذف المنشور.', 'error');
    }
  };

  return (
    <article className="post-card">
      <div className="post-header">
        <Link to={`/users/${authorId}`} className="post-author post-author-with-avatar">
          {post.author?.profilePicture ? (
            <img src={getImageUrl(post.author.profilePicture)} alt="" className="post-avatar" />
          ) : (
            <span className="post-avatar post-avatar-fallback">
              {(post.author?.username || 'م')[0].toUpperCase()}
            </span>
          )}
          <span>{post.author?.username || 'مستخدم'}</span>
        </Link>
        <span className="post-date">{formatDate(post.createdAt)}</span>
      </div>

      <Link to={`/posts/${post._id}`} className="post-content-link">
        <p className="post-content">{post.content}</p>
        {post.images && (
          <img
            src={getImageUrl(post.images)}
            alt="post"
            className="post-image"
            onError={(event) => { event.currentTarget.style.display = 'none'; }}
          />
        )}
      </Link>

      <div className="post-actions">
        <button
          type="button"
          className={`btn-like ${isLiked ? 'liked' : ''}`}
          onClick={handleLike}
        >
          {isLiked ? '❤️' : '🤍'} {post.likes?.length ?? 0}
        </button>

        <Link to={`/posts/${post._id}`} className="btn-comment-link">
          💬 تعليقات
        </Link>

        <button type="button" className={`btn-save ${isSaved ? 'saved' : ''}`} onClick={handleSave} aria-label="Save post">
          <Bookmark size={16} fill={isSaved ? 'currentColor' : 'none'} />
        </button>

        {isOwner && (
          <button type="button" className="btn-delete" onClick={handleDelete}>
            🗑️ حذف
          </button>
        )}
      </div>
    </article>
  );
}
