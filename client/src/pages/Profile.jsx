import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import PostCard from '../components/PostCard';
import { useAuth } from '../context/AuthContext';
import { getUserProfile, updateUserProfile, followUser } from '../api/users';
import { getPosts } from '../api/posts';
import { uploadImage } from '../api/upload';
import { getImageUrl } from '../utils/images';
import { getDmRoomId } from '../hooks/useSocket';
import { useFeedback } from '../context/FeedbackContext';
import LoadingScreen from '../components/LoadingScreen';

export default function Profile() {
  const { id } = useParams();
  const { user: currentUser, updateUser, logout } = useAuth();
  const { showToast } = useFeedback();

  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  const [form, setForm] = useState({ username: '', email: '' });
  const [saveError, setSaveError] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const isOwnProfile = currentUser?._id === id;

  const isFollowing = profile?.followers?.some(
    (fid) => fid.toString() === currentUser?._id?.toString()
  );

  const profileImageUrl = getImageUrl(profile?.profilePicture);

  const fetchProfile = useCallback(async () => {
    setError('');
    try {
      const [profileRes, postsRes] = await Promise.all([
        getUserProfile(id),
        getPosts(),
      ]);

      setProfile(profileRes.data);
      setForm({
        username: profileRes.data.username,
        email: profileRes.data.email,
      });

      const userPosts = postsRes.data.filter((p) => {
        const authorId = p.author?._id || p.author;
        return authorId?.toString() === id;
      });
      setPosts(userPosts);
    } catch (err) {
      setError(err.response?.data?.message || 'فشل تحميل البروفايل');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleFollow = async () => {
    setFollowLoading(true);
    try {
      await followUser(id);
      await fetchProfile();
    } catch (err) {
      showToast(err.response?.data?.message || 'تعذر إتمام العملية.', 'error');
    } finally {
      setFollowLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaveError('');
    setSaving(true);

    try {
      const { data } = await updateUserProfile(id, form);
      setProfile(data.user);
      updateUser(data.user);
      setEditing(false);
      showToast('تم حفظ التعديلات.', 'success');
    } catch (err) {
      setSaveError(err.response?.data?.message || 'فشل تحديث البروفايل');
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingPhoto(true);
    setSaveError('');
    try {
      const { data: uploadData } = await uploadImage(file);
      const { data } = await updateUserProfile(id, { profilePicture: uploadData.url });
      setProfile(data.user);
      updateUser(data.user);
      showToast('تم تغيير صورة البروفايل.', 'success');
    } catch (err) {
      setSaveError(err.response?.data?.message || 'فشل رفع صورة البروفايل');
    } finally {
      setUploadingPhoto(false);
      e.target.value = '';
    }
  };

  const handlePostUpdate = (postId, updates) => {
    setPosts((prev) =>
      prev.map((p) => (p._id === postId ? { ...p, ...updates } : p))
    );
  };

  const handlePostDelete = (postId) => {
    setPosts((prev) => prev.filter((p) => p._id !== postId));
  };

  if (loading) {
    return <LoadingScreen />;
  }

  if (error || !profile) {
    return (
      <div className="feed-page">
        <Navbar />
        <main className="profile-page-content">
          <div className="error-msg">{error || 'المستخدم غير موجود'}</div>
          <Link to="/feed">← رجوع للـ Feed</Link>
        </main>
      </div>
    );
  }

  return (
    <div className="feed-page">
      <Navbar />

      <main className="profile-page-content">
        <Link to="/feed" className="back-link">← رجوع للـ Feed</Link>

        <div className="profile-header">
          <div className="profile-avatar">
            {profileImageUrl ? (
              <img
                src={profileImageUrl}
                alt={profile.username}
                onError={(event) => { event.currentTarget.style.display = 'none'; }}
              />
            ) : (
              (profile.username || '?')[0].toUpperCase()
            )}
          </div>

          <div className="profile-info">
            <h2>{profile.username}</h2>
            <p className="profile-email">{profile.email}</p>
            {saveError && <div className="error-msg">{saveError}</div>}

            <div className="profile-stats">
              <span><strong>{posts.length}</strong> منشور</span>
              <span><strong>{profile.followers?.length ?? 0}</strong> متابع</span>
              <span><strong>{profile.following?.length ?? 0}</strong> يتابع</span>
            </div>

            <div className="profile-actions">
              {isOwnProfile ? (
                <>
                  <label className="btn-secondary btn-sm">
                    {uploadingPhoto ? 'جاري الرفع...' : '📷 تغيير الصورة'}
                    <input type="file" accept="image/*" hidden onChange={handlePhotoChange} disabled={uploadingPhoto} />
                  </label>
                  <button
                    type="button"
                    className="btn-primary btn-sm"
                    onClick={() => setEditing(!editing)}
                  >
                    {editing ? 'إلغاء' : '✏️ تعديل البروفايل'}
                  </button>
                  <button type="button" className="profile-logout" onClick={logout}>تسجيل الخروج</button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    className={`btn-primary btn-sm ${isFollowing ? 'btn-outline' : ''}`}
                    onClick={handleFollow}
                    disabled={followLoading}
                  >
                    {followLoading
                      ? '...'
                      : isFollowing
                        ? '✓ تتابعه — إلغاء'
                        : '+ متابعة'}
                  </button>
                  <Link
                    to={`/chat/${getDmRoomId(currentUser._id, id)}`}
                    className="btn-primary btn-sm btn-outline"
                  >
                    💬 رسالة
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

        {editing && isOwnProfile && (
          <div className="edit-profile">
            <h4>تعديل البروفايل</h4>
            <form onSubmit={handleSave}>
              <div className="form-group">
                <label htmlFor="username">اسم المستخدم</label>
                <input
                  id="username"
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  required
                  minLength={4}
                />
              </div>
              <div className="form-group">
                <label htmlFor="email">البريد الإلكتروني</label>
                <input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
              <button type="submit" className="btn-primary btn-sm" disabled={saving}>
                {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
              </button>
            </form>
          </div>
        )}

        <section className="profile-posts">
          <h3>منشورات {isOwnProfile ? 'ك' : profile.username}</h3>

          {posts.length === 0 && (
            <p className="placeholder-text">
              {isOwnProfile ? 'لم تنشر أي منشور بعد' : 'لا توجد منشورات'}
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
        </section>
      </main>
    </div>
  );
}
