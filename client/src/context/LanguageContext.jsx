import { createContext, useContext, useEffect, useLayoutEffect, useMemo, useState } from 'react';

const translations = {
  en: { language: 'العربية', home: 'Home', notifications: 'Notifications', messages: 'Messages', dashboard: 'Dashboard', savedPosts: 'Saved posts', admin: 'Admin', profile: 'Profile', createPost: 'Create post', loading: 'Loading...', search: 'Search Chatterly...', allPosts: 'All posts', following: 'Following', loadingPosts: 'Loading posts...', noPosts: 'No posts yet.', email: 'Email address', password: 'Password', login: 'Log in', loggingIn: 'Logging in...', register: 'Create account', registering: 'Creating account...', forgotPassword: 'Forgot password?', noAccount: "Don't have an account?", haveAccount: 'Already have an account?', backToLogin: 'Back to login', resetPassword: 'Reset password', newPassword: 'New password', confirmPassword: 'Confirm password', savePassword: 'Save password', sending: 'Sending...', sendResetLink: 'Send reset link' },
  ar: { language: 'English', home: 'الرئيسية', notifications: 'الإشعارات', messages: 'الرسائل', dashboard: 'لوحة التحكم', savedPosts: 'المنشورات المحفوظة', admin: 'المشرف', profile: 'الملف الشخصي', createPost: 'إنشاء منشور', loading: 'جارٍ التحميل...', search: 'ابحث في Chatterly...', allPosts: 'كل المنشورات', following: 'أتابعهم', loadingPosts: 'جارٍ تحميل المنشورات...', noPosts: 'لا توجد منشورات بعد.', email: 'البريد الإلكتروني', password: 'كلمة المرور', login: 'تسجيل الدخول', loggingIn: 'جارٍ تسجيل الدخول...', register: 'إنشاء حساب', registering: 'جارٍ إنشاء الحساب...', forgotPassword: 'نسيت كلمة المرور؟', noAccount: 'ليس لديك حساب؟', haveAccount: 'لديك حساب بالفعل؟', backToLogin: 'العودة لتسجيل الدخول', resetPassword: 'إعادة تعيين كلمة المرور', newPassword: 'كلمة المرور الجديدة', confirmPassword: 'تأكيد كلمة المرور', savePassword: 'حفظ كلمة المرور', sending: 'جارٍ الإرسال...', sendResetLink: 'إرسال رابط إعادة التعيين' },
};

const navigationTranslations = {
  en: {
    saved: 'Saved',
    savedMessages: 'Saved messages',
    reminders: 'Reminders',
    dailyPulse: 'Daily pulse',
    circles: 'Interest circles',
    openNavigation: 'Open navigation menu',
    closeNavigation: 'Close navigation menu',
    closeNotification: 'Close notification',
    cancel: 'Cancel',
  },
  ar: {
    saved: 'المحفوظات',
    savedMessages: 'الرسائل المحفوظة',
    reminders: 'التذكيرات',
    dailyPulse: 'نبضك اليوم',
    circles: 'دوائر الاهتمام',
    openNavigation: 'فتح قائمة التنقل',
    closeNavigation: 'إغلاق قائمة التنقل',
    closeNotification: 'إغلاق الإشعار',
    cancel: 'إلغاء',
  },
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

// Page-level copy that is still rendered as literal JSX. Keeping it here makes
// those existing screens follow the selected language until their copy is moved
// to individual `t()` keys.
const pageText = {
  'حدث خطأ': 'Something went wrong.', 'حدث خطأ أثناء تسجيل الدخول': 'Unable to sign in.', 'حدث خطأ أثناء إنشاء الحساب': 'Unable to create the account.',
  'سجّل دخولك للمتابعة': 'Log in to continue', 'إرسال اللينك': 'Send link', 'هنبعتلك لينك إعادة التعيين على إيميلك': 'We will send a reset link to your email.',
  'أنشئ حسابك الجديد': 'Create your new account', 'اسم المستخدم': 'Username', '6 أحرف على الأقل': 'At least 6 characters',
  'جاري الدخول...': 'Logging in...', 'جاري الإنشاء...': 'Creating account...', 'جاري الإرسال...': 'Sending...', 'جاري الحفظ...': 'Saving...',
  'كلمتا المرور غير متطابقتين': 'Passwords do not match.', 'تم تغيير كلمة المرور بنجاح': 'Password changed successfully.', 'اللينك منتهي أو غير صالح': 'The link is invalid or expired.', 'أدخل كلمة المرور الجديدة': 'Enter your new password',
  'فشل تحميل المنشورات': 'Unable to load posts.', 'فشل نشر المنشور': 'Unable to publish the post.', 'منشور جديد': 'New post', 'إيه اللي في بالك؟': 'What is on your mind?', 'معاينة': 'Preview', '✕ إزالة الصورة': 'Remove image', 'جاري النشر...': 'Publishing...', 'نشر': 'Publish',
  'فشل تحميل المنشور': 'Unable to load the post.', 'تعذر إضافة التعليق.': 'Unable to add the comment.', 'حذف التعليق': 'Delete comment', 'تم حذف التعليق.': 'Comment deleted.', 'المنشور غير موجود': 'Post not found', '← رجوع للـ Feed': '← Back to feed', 'التعليقات': 'Comments', 'اكتب تعليق...': 'Write a comment...', 'مفيش تعليقات لسه — كن أول واحد!': 'No comments yet — be the first!',
  'فشل تحميل البروفايل': 'Unable to load the profile.', 'تعذر إتمام العملية.': 'Unable to complete the action.', 'تم حفظ التعديلات.': 'Changes saved.', 'فشل تحديث البروفايل': 'Unable to update the profile.', 'تم تغيير صورة البروفايل.': 'Profile photo changed.', 'فشل رفع صورة البروفايل': 'Unable to upload the profile photo.', 'المستخدم غير موجود': 'User not found', 'منشور': 'post', 'متابع': 'followers', 'يتابع': 'following', 'جاري الرفع...': 'Uploading...', '📷 تغيير الصورة': '📷 Change photo', '✏️ تعديل البروفايل': '✏️ Edit profile', 'تسجيل الخروج': 'Log out', '✓ تتابعه — إلغاء': '✓ Following — Unfollow', '+ متابعة': '+ Follow', '💬 رسالة': '💬 Message', 'تعديل البروفايل': 'Edit profile', 'حفظ التغييرات': 'Save changes', 'منشورات': 'Posts', 'لم تنشر أي منشور بعد': 'You have not published any posts yet', 'لا توجد منشورات': 'No posts available',
  'حذف المنشور': 'Delete post', 'لن تستطيع استرجاع المنشور بعد حذفه.': 'This post cannot be recovered after deletion.', 'تم حذف المنشور بنجاح.': 'Post deleted successfully.', 'تعذر حذف المنشور.': 'Unable to delete the post.', 'مستخدم': 'User', '💬 تعليقات': '💬 Comments', '🗑️ حذف': '🗑️ Delete',
  'حذف المستخدم': 'Delete user', 'سيتم حذف المنشور نهائيًا.': 'The post will be permanently deleted.', 'تم حذف المستخدم.': 'User deleted.', 'تعذر حذف المستخدم.': 'Unable to delete the user.', 'حذف الاستوري': 'Delete story', 'لن تستطيع استرجاع الاستوري بعد حذفها.': 'This story cannot be recovered after deletion.', 'تم حذف الاستوري.': 'Story deleted.', 'تعذر حذف الاستوري.': 'Unable to delete the story.',
  '💬 عام': '💬 General', '💻 تقنية': '💻 Technology', '🎲 عشوائي': '🎲 Random', 'تم حفظ الرسالة.': 'Message saved.', 'تمت إزالة الرسالة من المحفوظات.': 'Message removed from saved items.', 'تعذر حفظ الرسالة. تأكد أن الـbackend يعمل.': 'Unable to save the message. Make sure the backend is running.', 'مفيش رسائل لسه — ابدأ المحادثة!': 'No messages yet — start the conversation!', 'اكتب رسالة...': 'Write a message...', 'إرسال': 'Send',
  'الإشعارات': 'Notifications', 'قراءة الكل': 'Read all', 'لا توجد إشعارات بعد': 'No notifications yet', 'أي تفاعل جديد على حسابك سيظهر هنا.': 'New activity on your account will appear here.', 'غير مقروء': 'Unread', 'مفيش إشعارات': 'No notifications', 'تذكير:': 'Reminder:', 'أعجب بمنشورك': 'liked your post', 'علّق على منشورك': 'commented on your post', 'بدأ بمتابعتك': 'started following you',
  'دوائر الاهتمام': 'Interest circles', 'كوّن مجموعة صغيرة لهدف واضح، تابعوا تقدمكم يوميًا، وتواصلوا في مساحة واحدة تنتهي عند اكتمال الهدف.': 'Create a small group around a clear goal, track progress daily, and connect in one shared space.', 'اسم الدائرة': 'Circle name', 'مثال: تحدي React الأسبوعي': 'Example: Weekly React challenge', 'الهدف': 'Goal', 'مثال: إنهاء أساسيات React وبناء مشروع صغير': 'Example: Finish React fundamentals and build a small project', 'المدة بالأيام': 'Duration in days', 'عدد الأعضاء': 'Number of members', 'أنشئ دائرة': 'Create a circle', 'لا توجد دوائر نشطة الآن. كن أول من يبدأ واحدة.': 'There are no active circles yet. Be the first to start one.', 'أيام متبقية': 'days remaining', 'بواسطة': 'By', 'عضو Chatterly': 'Chatterly member', 'انضم للدائرة': 'Join circle', 'إيه اللي أنجزته اليوم؟': 'What did you accomplish today?', 'افتح نقاش الدائرة': 'Open circle discussion',
  'افتكرها في وقتها': 'Remember it on time', 'أضف موعدك، وChatterly هيبعتلك إشعارًا داخل الموقع وعلى الإيميل.': 'Add your appointment and Chatterly will send you an in-app and email reminder.', 'عاوز تفتكر إيه؟': 'What do you want to remember?', 'مثال: معاد الدكتور بكرة': "Example: Doctor's appointment tomorrow", 'المعاد': 'Due date', 'إضافة تذكير': 'Add reminder', 'مفيش تذكيرات لسه. أضف أول موعد مهم ليك.': 'No reminders yet. Add your first important appointment.',
  'نبضك اليوم': 'Your daily pulse', 'اختار إحساسك وموضوعك، وادخل مساحة صغيرة مع ناس على نفس الموجة لمدة اليوم فقط.': 'Choose a feeling and topic, then join a small space with people on the same wavelength for today.', 'تحب تبدأ إزاي؟': 'How would you like to begin?', 'مع مجموعة': 'With a group', 'تكلم مع ناس على نفس الموجة': 'Talk with people on the same wavelength', 'مع AI لوحدك': 'With AI privately', 'خد نصيحة خاصة ومباشرة': 'Get private, direct advice', 'إنت حاسس بإيه؟': 'How are you feeling?', 'سعيد': 'Happy', 'مضغوط': 'Stressed', 'محتاج أتكلم': 'Need to talk', 'مركز': 'Focused', 'حابب تتكلم عن إيه؟': 'What would you like to talk about?', 'شغل': 'Work', 'دراسة': 'Study', 'علاقات': 'Relationships', 'كورة': 'Football', 'تقنية': 'Technology', 'تحب تظهر إزاي؟': 'How would you like to appear?', 'مجهول': 'Anonymous', 'اسمك وصورتك مش هيظهروا': 'Your name and photo will not be shown', 'باسمك': 'With your name', 'يظهر اسمك للمجموعة': 'Your name will be visible to the group', 'جاري إيجاد مجموعتك...': 'Finding your group...', 'اتكلم مع AI': 'Talk with AI', 'ابدأ نبضك': 'Start your pulse', 'مساحة خاصة بينك وبين المساعد': 'A private space between you and the assistant', 'خروج': 'Leave', 'احكي براحتك، والمساعد هيدي لك نصيحة عملية مناسبة لحالتك.': 'Share freely and the assistant will offer practical advice for your situation.', 'إيه أكتر حاجة شاغلة بالك بخصوص الموضوع ده النهارده؟': 'What is most on your mind about this topic today?', 'ابدأ واحكي للمساعد اللي في بالك.': 'Start by telling the assistant what is on your mind.', 'ابدأ الكلام براحتك — المساحة دي مؤقتة ومحدودة.': 'Start talking freely — this space is temporary and limited.', 'جاري تجهيز المجموعة...': 'Preparing the group...', 'عضو نبض': 'Pulse member', 'بفكر معاك...': 'Thinking with you...', 'احكي للمساعد...': 'Tell the assistant...', 'اكتب اللي حاسس به...': 'Write how you feel...',
  'مكانك للتواصل، مشاركة أفكارك، والبقاء قريبًا من الناس.': 'Your place to connect, share ideas, and stay close to people.', 'ادخل إلى حسابك': 'Go to your account', 'ابدأ الآن': 'Get started',
};

function translateLegacyContent(language) {
  const arabicToEnglish = Object.fromEntries(Object.entries({ ...legacyText, ...pageText }).map(([left, right]) => {
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
  const value = useMemo(() => ({ language, isArabic: language === 'ar', t: (key) => translations[language][key] || navigationTranslations[language][key] || translations.en[key] || navigationTranslations.en[key] || key, toggleLanguage: () => setLanguage((current) => current === 'ar' ? 'en' : 'ar') }), [language]);
  return <LanguageContext.Provider value={value}><LegacyTextTranslator language={language}>{children}</LegacyTextTranslator></LanguageContext.Provider>;
}

export function useLanguage() { const context = useContext(LanguageContext); if (!context) throw new Error('useLanguage must be used within LanguageProvider'); return context; }
