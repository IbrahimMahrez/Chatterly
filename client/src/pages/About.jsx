import { ArrowLeft, Heart, MessageCircleHeart, Sparkles, UsersRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

const copy = {
  ar: {
    eyebrow: 'ABOUT CHATTERLY',
    title: 'مساحة ألطف',
    titleAccent: 'للكلام الحقيقي.',
    intro: 'Chatterly مش مجرد مكان للمنشورات؛ هو مساحة قريبة تجمع الناس، الأفكار، واللحظات الصغيرة اللي تستحق تتشارك.',
    ideaTitle: 'فكرة المشروع',
    idea: 'صممنا Chatterly عشان التواصل يبقى أبسط وأدفى: شارك رأيك، تابع أصحابك، وابدأ حوارًا حقيقيًا في مجتمع يشبهك.',
    values: [
      ['تواصل بصدق', 'كل رسالة تبدأ فرصة لفهم شخص جديد.'],
      ['مجتمع قريب', 'مكان آمن للأفكار والاهتمامات المشتركة.'],
      ['لحظات لها معنى', 'من منشور بسيط إلى محادثة لا تُنسى.'],
    ],
    madeBy: 'صُنِع بحب بواسطة',
    back: 'العودة للرئيسية',
  },
  en: {
    eyebrow: 'ABOUT CHATTERLY',
    title: 'A kinder space',
    titleAccent: 'for real conversations.',
    intro: 'Chatterly is more than a place for posts; it is a close-knit space for people, ideas, and the small moments worth sharing.',
    ideaTitle: 'The project idea',
    idea: 'Chatterly was designed to make connection simpler and warmer: share your thoughts, follow friends, and start meaningful conversations in a community that feels like yours.',
    values: [
      ['Connect honestly', 'Every message is a chance to understand someone new.'],
      ['A close community', 'A welcoming space for shared ideas and interests.'],
      ['Meaningful moments', 'From a small post to a conversation you remember.'],
    ],
    madeBy: 'Made with love by',
    back: 'Back to home',
  },
};

export default function About() {
  const { language } = useLanguage();
  const content = copy[language] || copy.ar;
  const icons = [MessageCircleHeart, UsersRound, Sparkles];

  return <main className="about-page">
    <div className="about-orb about-orb-violet" />
    <div className="about-orb about-orb-orange" />
    <section className="about-shell">
      <Link className="about-back" to="/"><ArrowLeft size={17} /> {content.back}</Link>

      <header className="about-hero">
        <span className="about-eyebrow"><Sparkles size={15} /> {content.eyebrow}</span>
        <h1>{content.title} <em>{content.titleAccent}</em></h1>
        <p>{content.intro}</p>
      </header>

      <section className="about-idea">
        <div className="about-heart" aria-hidden="true">💬<span>✨</span></div>
        <div>
          <span className="about-section-label">{content.ideaTitle}</span>
          <p>{content.idea}</p>
        </div>
      </section>

      <section className="about-values" aria-label={content.ideaTitle}>
        {content.values.map(([title, description], index) => {
          const Icon = icons[index];
          return <article className="about-value" key={title}>
            <span><Icon size={21} /></span>
            <h2>{title}</h2>
            <p>{description}</p>
          </article>;
        })}
      </section>

      <footer className="about-signature">
        <Heart size={17} fill="currentColor" />
        <span>{content.madeBy}</span>
        <strong>Ibrahim Haraz</strong>
      </footer>
    </section>
  </main>;
}
