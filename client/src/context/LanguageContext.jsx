import { createContext, useContext, useEffect, useLayoutEffect, useMemo, useState } from 'react';

const translations = {
  en: { language: 'العربية', home: 'Home', notifications: 'Notifications', messages: 'Messages', dashboard: 'Dashboard', savedPosts: 'Saved posts', admin: 'Admin', profile: 'Profile', createPost: 'Create post', loading: 'Loading...', search: 'Search Chatterly...', allPosts: 'All posts', following: 'Following', loadingPosts: 'Loading posts...', noPosts: 'No posts yet.', email: 'Email address', password: 'Password', login: 'Log in', loggingIn: 'Logging in...', register: 'Create account', registering: 'Creating account...', forgotPassword: 'Forgot password?', noAccount: "Don't have an account?", haveAccount: 'Already have an account?', backToLogin: 'Back to login', resetPassword: 'Reset password', newPassword: 'New password', confirmPassword: 'Confirm password', savePassword: 'Save password', sending: 'Sending...', sendResetLink: 'Send reset link' },
  ar: { language: 'English', home: 'الرئيسية', notifications: 'الإشعارات', messages: 'الرسائل', dashboard: 'لوحة التحكم', savedPosts: 'المنشورات المحفوظة', admin: 'المشرف', profile: 'الملف الشخصي', createPost: 'إنشاء منشور', loading: 'جارٍ التحميل...', search: 'ابحث في Chatterly...', allPosts: 'كل المنشورات', following: 'أتابعهم', loadingPosts: 'جارٍ تحميل المنشورات...', noPosts: 'لا توجد منشورات بعد.', email: 'البريد الإلكتروني', password: 'كلمة المرور', login: 'تسجيل الدخول', loggingIn: 'جارٍ تسجيل الدخول...', register: 'إنشاء حساب', registering: 'جارٍ إنشاء الحساب...', forgotPassword: 'نسيت كلمة المرور؟', noAccount: 'ليس لديك حساب؟', haveAccount: 'لديك حساب بالفعل؟', backToLogin: 'العودة لتسجيل الدخول', resetPassword: 'إعادة تعيين كلمة المرور', newPassword: 'كلمة المرور الجديدة', confirmPassword: 'تأكيد كلمة المرور', savePassword: 'حفظ كلمة المرور', sending: 'جارٍ الإرسال...', sendResetLink: 'إرسال رابط إعادة التعيين' },
};

const LanguageContext = createContext(null);

// Legacy screens still contain literal UI strings. This map keeps those screens
// bilingual while new text should continue to use the t() helper above.
const legacyText = {
  'Loading...': 'جارٍ التحميل...', 'Home': 'الرئيسية', 'Notifications': 'الإشعارات', 'Messages': 'الرسائل', 'Dashboard': 'لوحة التحكم', 'Saved Posts': 'المنشورات المحفوظة', 'Profile': 'الملف الشخصي', 'Create Post': 'إنشاء منشور', 'Photo / Video': 'صورة / فيديو', 'New Post': 'منشور جديد', 'What\'s on your mind, Ibrahim? 👋': 'بماذا تفكر يا إبراهيم؟ 👋', 'Search Chatterly...': 'ابحث في Chatterly...', 'All posts': 'كل المنشورات', 'Following': 'أتابعهم', 'Loading posts...': 'جارٍ تحميل المنشورات...', 'No posts yet.': 'لا توجد منشورات بعد.',
  'Forgot password?': 'نسيت كلمة المرور؟', 'Email address': 'البريد الإلكتروني', 'Password': 'كلمة المرور', 'Log in': 'تسجيل الدخول', 'Logging in...': 'جارٍ تسجيل الدخول...', 'Create account': 'إنشاء حساب', 'Creating account...': 'جارٍ إنشاء الحساب...', 'Already have an account?': 'لديك حساب بالفعل؟', 'Don\'t have an account?': 'ليس لديك حساب؟', 'Back to login': 'العودة لتسجيل الدخول', 'Send reset link': 'إرسال رابط إعادة التعيين', 'Sending...': 'جارٍ الإرسال...', 'Reset password': 'إعادة تعيين كلمة المرور', 'New password': 'كلمة المرور الجديدة', 'Confirm password': 'تأكيد كلمة المرور', 'Save password': 'حفظ كلمة المرور',
  'Stories': 'القصص', 'Create Story': 'إنشاء استوري', 'Uploading...': 'جارٍ الرفع...', 'View all stories': 'عرض كل القصص', 'No active stories': 'لا توجد استوريات نشطة', 'Delete': 'حذف', 'Delete post': 'حذف المنشور', 'Save post': 'حفظ المنشور', 'Comments': 'التعليقات', 'User': 'مستخدم', 'Read all': 'قراءة الكل', 'No notifications': 'لا توجد إشعارات',
  'People You May Know': 'أشخاص قد تعرفهم', 'Chatterly user': 'مستخدم Chatterly', 'Follow': 'متابعة', 'No suggestions right now.': 'لا توجد اقتراحات الآن.', 'No notifications yet.': 'لا توجد إشعارات بعد.', 'No conversations yet.': 'لا توجد محادثات بعد.', 'Open chat': 'فتح المحادثة',
  'Ask AI': 'اسأل الذكاء الاصطناعي', 'Suggest a post': 'اقترح منشورًا', 'Real assistant': 'مساعد حقيقي', 'Thinking...': 'جارٍ التفكير...', 'Ask a question...': 'اكتب سؤالك...', 'Topic for your post...': 'موضوع المنشور...', 'Use in post': 'استخدم في المنشور', 'Send': 'إرسال',
  'Search messages...': 'ابحث في الرسائل...', 'Conversations': 'المحادثات', 'Start a conversation': 'ابدأ محادثة', 'New conversation': 'محادثة جديدة', 'Public rooms': 'غرف عامة', 'Custom room...': 'غرفة مخصصة...', 'Join': 'انضم', 'Select a conversation': 'اختر محادثة', 'Choose a person or a public room to start chatting.': 'اختر شخصًا أو غرفة عامة لبدء المحادثة.', 'Direct message': 'رسالة خاصة', 'Connected': 'متصل', 'Disconnected': 'غير متصل',
  'Saved posts': 'المنشورات المحفوظة', 'Loading saved posts...': 'جارٍ تحميل المنشورات المحفوظة...', 'You have no saved posts.': 'لا توجد منشورات محفوظة.', 'Recent posts': 'أحدث المنشورات', 'Latest users': 'أحدث المستخدمين', 'Latest posts': 'أحدث المنشورات', 'Admin Dashboard': 'لوحة تحكم المشرف', 'Admin': 'المشرف', 'Member': 'عضو', 'Loading dashboard...': 'جارٍ تحميل لوحة التحكم...', 'Loading admin data...': 'جارٍ تحميل بيانات المشرف...',
  'منشور جديد': 'New Post', 'إيه اللي في بالك؟': 'What is on your mind?', 'إزالة الصورة': 'Remove image', 'جاري النشر...': 'Publishing...', 'نشر': 'Publish', 'فشل نشر المنشور': 'Unable to publish the post.', 'متأكد إنك عايز تحذف المنشور؟': 'Are you sure you want to delete this post?', 'فشل الحذف': 'Unable to delete.', 'تعليقات': 'Comments', 'الإشعارات': 'Notifications', 'قراءة الكل': 'Read all', 'جاري التحميل...': 'Loading...', 'مفيش إشعارات': 'No notifications', 'مستخدم': 'User', 'عام': 'General', 'تقنية': 'Technology', 'عشوائي': 'Random', 'متصل': 'Connected', 'غير متصل': 'Disconnected', 'مفيش رسائل لسه — ابدأ المحادثة!': 'No messages yet — start the conversation!', 'اكتب رسالة...': 'Write a message...',
  'نسيت كلمة المرور؟': 'Forgot password?', 'هنبعتلك لينك إعادة التعيين على إيميلك': 'We will send a reset link to your email.', 'البريد الإلكتروني': 'Email address', 'إرسال اللينك': 'Send reset link', 'رجوع لتسجيل الدخول': 'Back to login', 'حدث خطأ': 'Something went wrong.', 'سجّل دخولك للمتابعة': 'Log in to continue', 'جاري الدخول...': 'Logging in...', 'تسجيل الدخول': 'Log in', 'ليس لديك حساب؟': 'Don\'t have an account?', 'إنشاء حساب': 'Create account', 'أنشئ حسابك الجديد': 'Create your new account', 'اسم المستخدم': 'Username', 'كلمة المرور': 'Password', '6 أحرف على الأقل': 'At least 6 characters', 'جاري الإنشاء...': 'Creating account...', 'لديك حساب بالفعل؟': 'Already have an account?',
  'كلمة مرور جديدة': 'New password', 'أدخل كلمة المرور الجديدة': 'Enter your new password', 'تأكيد كلمة المرور': 'Confirm password', 'جاري الحفظ...': 'Saving...', 'حفظ كلمة المرور': 'Save password', 'كلمتا المرور غير متطابقتين': 'Passwords do not match.', 'تم تغيير كلمة المرور بنجاح': 'Password changed successfully.', 'اللينك منتهي أو غير صالح': 'The link is invalid or expired.',
  'فشل تحميل البروفايل': 'Unable to load the profile.', 'المستخدم غير موجود': 'User not found', 'منشور': 'post', 'متابع': 'followers', 'يتابع': 'following', 'تغيير الصورة': 'Change photo', 'تعديل البروفايل': 'Edit profile', 'تسجيل الخروج': 'Log out', 'إلغاء': 'Cancel', 'متابعة': 'Follow', 'رسالة': 'Message', 'حفظ التغييرات': 'Save changes', 'لم تنشر أي منشور بعد': 'You have not published a post yet.', 'لا توجد منشورات': 'No posts available.',
};

function translateLegacyContent(language) {
  const arabicToEnglish = Object.fromEntries(Object.entries(legacyText).map(([left, right]) => {
    const leftIsArabic = /[\u0600-\u06ff]/.test(left);
    return leftIsArabic ? [left, right] : [right, left];
  }));
  const dictionary = language === 'ar'
    ? Object.fromEntries(Object.entries(arabicToEnglish).map(([arabic, english]) => [english, arabic]))
    : arabicToEnglish;
  const apply = (value) => {
    const leading = value.match(/^\s*/)?.[0] || '';
    const trailing = value.match(/\s*$/)?.[0] || '';
    const text = value.trim();
    return dictionary[text] ? `${leading}${dictionary[text]}${trailing}` : value;
  };
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  nodes.forEach((node) => { node.nodeValue = apply(node.nodeValue); });
  document.querySelectorAll('[placeholder], [aria-label], [title]').forEach((element) => ['placeholder', 'aria-label', 'title'].forEach((attribute) => {
    if (element.hasAttribute(attribute)) element.setAttribute(attribute, apply(element.getAttribute(attribute)));
  }));
}

function LegacyTextTranslator({ language, children }) {
  useLayoutEffect(() => {
    translateLegacyContent(language);
    const observer = new MutationObserver(() => translateLegacyContent(language));
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [language]);
  return children;
}

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => localStorage.getItem('chatterly-language') || 'ar');
  useEffect(() => { document.documentElement.lang = language; document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr'; localStorage.setItem('chatterly-language', language); }, [language]);
  const value = useMemo(() => ({ language, isArabic: language === 'ar', t: (key) => translations[language][key] || translations.en[key] || key, toggleLanguage: () => setLanguage((current) => current === 'ar' ? 'en' : 'ar') }), [language]);
  return <LanguageContext.Provider value={value}><LegacyTextTranslator language={language}>{children}</LegacyTextTranslator></LanguageContext.Provider>;
}

export function useLanguage() { const context = useContext(LanguageContext); if (!context) throw new Error('useLanguage must be used within LanguageProvider'); return context; }
