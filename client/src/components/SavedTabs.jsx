import { Bookmark, MessageCircle } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

export default function SavedTabs() {
  const { isArabic } = useLanguage();
  return <nav className="saved-tabs" aria-label={isArabic ? 'أقسام المحفوظات' : 'Saved item sections'}>
    <NavLink end to="/saved"><Bookmark size={17} /> {isArabic ? 'المنشورات' : 'Posts'}</NavLink>
    <NavLink to="/saved-messages"><MessageCircle size={17} /> {isArabic ? 'الرسائل' : 'Messages'}</NavLink>
  </nav>;
}
