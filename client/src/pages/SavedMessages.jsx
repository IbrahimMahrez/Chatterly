import { useEffect, useState } from 'react';
import { Bookmark, Trash2 } from 'lucide-react';
import Navbar from '../components/Navbar';
import { getSavedMessages, saveMessage } from '../api/messages';
import LoadingScreen from '../components/LoadingScreen';
import SavedTabs from '../components/SavedTabs';
import { useLanguage } from '../context/LanguageContext';

function formatDate(value) {
  return new Date(value).toLocaleString('ar-EG', { dateStyle: 'medium', timeStyle: 'short' });
}

export default function SavedMessages() {
  const { isArabic } = useLanguage();
  const [savedMessages, setSavedMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSavedMessages()
      .then(({ data }) => setSavedMessages(data))
      .finally(() => setLoading(false));
  }, []);

  const removeSavedMessage = async (saved) => {
    try {
      await saveMessage(saved.message._id);
      setSavedMessages((current) => current.filter((item) => item._id !== saved._id));
    } catch {
      // Leave the message visible so the user can try again.
    }
  };

  return <div className="feed-page">
    <Navbar />
    <main className="standalone-content">
      <div className="saved-page-heading"><div><h1>{isArabic ? 'المحفوظات' : 'Saved items'}</h1><p>{isArabic ? 'احتفظ بالرسائل والروابط والملاحظات المهمة في مكان واحد.' : 'Keep important messages, links, and notes in one place.'}</p></div><Bookmark size={24} /></div>
      <SavedTabs />
      {loading && <LoadingScreen compact />}
      {!loading && savedMessages.length === 0 && <p className="placeholder-text">You have no saved messages yet.</p>}
      <div className="saved-message-list">
        {savedMessages.map((saved) => <article className="saved-message-card" key={saved._id}>
          <div><strong>{saved.message.senderName}</strong><small>{formatDate(saved.message.createdAt)}</small></div>
          <p>{saved.message.message}</p>
          <footer><span>{saved.message.roomId.startsWith('dm_') ? 'Direct message' : `#${saved.message.roomId}`}</span><button type="button" onClick={() => removeSavedMessage(saved)} aria-label="Remove saved message"><Trash2 size={15} /> Remove</button></footer>
        </article>)}
      </div>
    </main>
  </div>;
}
