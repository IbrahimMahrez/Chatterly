import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { likePost, deletePost } from '../api/posts';
import { getImageUrl } from '../utils/images';

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

  const authorId = post.author?._id || post.author;
  const isOwner = authorId?.toString() === user?._id?.toString();
  const isLiked = post.likes?.some((id) => id.toString() === user?._id?.toString());

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

  const handleDelete = async () => {
    if (!window.confirm('متأكد إنك عايز تحذف المنشور؟')) return;
    try {
      await deletePost(post._id);
      onDelete(post._id);
    } catch (err) {
      alert(err.response?.data?.message || 'فشل الحذف');
    }
  };

  return (
    <article className="post-card">
      <div className="post-header">
        <Link to={`/users/${authorId}`} className="post-author">
          {post.author?.username || 'مستخدم'}
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

        {isOwner && (
          <button type="button" className="btn-delete" onClick={handleDelete}>
            🗑️ حذف
          </button>
        )}
      </div>
    </article>
  );
}
