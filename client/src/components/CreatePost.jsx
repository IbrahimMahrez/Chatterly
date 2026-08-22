import { useState, useRef } from 'react';
import { createPost } from '../api/posts';
import { uploadImage } from '../api/upload';

export default function CreatePost({ onPostCreated }) {
  const [content, setContent] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    setError('');
    setSubmitting(true);

    try {
      let imageUrl = '';

      if (imageFile) {
        const { data } = await uploadImage(imageFile);
        imageUrl = data.url;
      }

      await createPost({ content: content.trim(), images: imageUrl });
      setContent('');
      clearImage();
      onPostCreated();
    } catch (err) {
      setError(err.response?.data?.message || 'فشل نشر المنشور');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="create-post">
      <h4>منشور جديد</h4>
      {error && <div className="error-msg">{error}</div>}
      <form onSubmit={handleSubmit}>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="إيه اللي في بالك؟"
          rows={3}
          required
        />

        {imagePreview && (
          <div className="image-preview">
            <img src={imagePreview} alt="معاينة" />
            <button type="button" className="btn-delete" onClick={clearImage}>
              ✕ إزالة الصورة
            </button>
          </div>
        )}

        <div className="create-post-actions">
          <label className="btn-secondary btn-file">
            📷 صورة
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              hidden
            />
          </label>
          <button type="submit" className="btn-primary btn-sm" disabled={submitting}>
            {submitting ? 'جاري النشر...' : 'نشر'}
          </button>
        </div>
      </form>
    </div>
  );
}
