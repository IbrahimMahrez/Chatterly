import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Image, Plus, Trash2, X } from 'lucide-react';
import { createStory, deleteStory, getStories } from '../api/stories';
import { uploadImage } from '../api/upload';
import { getImageUrl } from '../utils/images';
import { useAuth } from '../context/AuthContext';
import { useFeedback } from '../context/FeedbackContext';

export default function Stories() {
  const { user } = useAuth();
  const { confirmAction, showToast } = useFeedback();
  const fileInput = useRef(null);
  const [stories, setStories] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [selectedStory, setSelectedStory] = useState(null);

  const loadStories = () => getStories().then(({ data }) => setStories(data)).catch(() => {});
  useEffect(() => { loadStories(); }, []);

  const handleCreate = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { data: upload } = await uploadImage(file);
      const { data: story } = await createStory(upload.url);
      setStories((current) => [story, ...current]);
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const handleDelete = async () => {
    if (!selectedStory || selectedStory.author?._id !== user?._id) return;
    const confirmed = await confirmAction({ title: 'حذف الاستوري', message: 'لن تستطيع استرجاع الاستوري بعد حذفها.', confirmLabel: 'حذف الاستوري' });
    if (!confirmed) return;
    try {
      await deleteStory(selectedStory._id);
      setStories((current) => current.filter((story) => story._id !== selectedStory._id));
      setSelectedStory(null);
      showToast('تم حذف الاستوري.', 'success');
    } catch {
      showToast('تعذر حذف الاستوري.', 'error');
    }
  };

  const ownImage = getImageUrl(user?.profilePicture);
  return (
    <section className="stories-panel" aria-label="Stories">
      <button type="button" className="story-create" onClick={() => fileInput.current?.click()} disabled={uploading}>
        <span className="story-ring story-create-ring">{ownImage ? <img src={ownImage} alt="" /> : <Plus size={22} />}</span>
        <strong>{uploading ? 'Uploading...' : 'Create Story'}</strong>
      </button>
      <input ref={fileInput} type="file" accept="image/*" hidden onChange={handleCreate} />
      {stories.map((story) => (
        <button type="button" className="story-item" key={story._id} onClick={() => setSelectedStory(story)}>
          <span className="story-ring"><img src={getImageUrl(story.image)} alt="" /></span>
          <strong>{story.author?.username || 'User'}</strong>
          <small>{new Date(story.createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</small>
        </button>
      ))}
      {stories.length > 0 && <button type="button" className="stories-more" aria-label="View stories"><ArrowRight size={20} /><strong>View all<br />stories</strong></button>}
      {stories.length === 0 && <span className="stories-empty"><Image size={17} /> No active stories</span>}
      {selectedStory && (
        <div className="story-viewer" role="dialog" aria-modal="true" onClick={() => setSelectedStory(null)}>
          <div className="story-viewer-content" onClick={(event) => event.stopPropagation()}>
            <button type="button" className="story-close" onClick={() => setSelectedStory(null)} aria-label="Close story"><X size={22} /></button>
            <img src={getImageUrl(selectedStory.image)} alt={`${selectedStory.author?.username || 'User'} story`} />
            <div className="story-viewer-footer">
              <strong>{selectedStory.author?.username || 'User'}</strong>
              {selectedStory.author?._id === user?._id && <button type="button" className="story-delete" onClick={handleDelete}><Trash2 size={16} /> Delete</button>}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
