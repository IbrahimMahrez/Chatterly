import { createContext, useCallback, useContext, useRef, useState } from 'react';
import { CheckCircle2, Info, TriangleAlert, X } from 'lucide-react';
import { useLanguage } from './LanguageContext';

const FeedbackContext = createContext(null);

export function FeedbackProvider({ children }) {
  const { t } = useLanguage();
  const [toasts, setToasts] = useState([]);
  const [confirmation, setConfirmation] = useState(null);
  const resolver = useRef(null);

  const showToast = useCallback((message, type = 'info') => {
    const id = crypto.randomUUID();
    setToasts((current) => [...current, { id, message, type }]);
    window.setTimeout(() => setToasts((current) => current.filter((toast) => toast.id !== id)), 4200);
  }, []);

  const confirmAction = useCallback(({ title = 'تأكيد الإجراء', message = 'هل أنت متأكد؟', confirmLabel = 'تأكيد' }) => new Promise((resolve) => {
    resolver.current = resolve;
    setConfirmation({ title, message, confirmLabel });
  }), []);

  const closeConfirmation = (confirmed) => {
    resolver.current?.(confirmed);
    resolver.current = null;
    setConfirmation(null);
  };

  const icon = { success: <CheckCircle2 />, error: <TriangleAlert />, info: <Info /> };
  return <FeedbackContext.Provider value={{ showToast, confirmAction }}>
    {children}
    <div className="toast-stack" aria-live="polite">{toasts.map((toast) => <div className={`toast toast-${toast.type}`} key={toast.id}>{icon[toast.type]}<span>{toast.message}</span><button type="button" onClick={() => setToasts((current) => current.filter((item) => item.id !== toast.id))} aria-label={t('closeNotification')}><X size={16} /></button></div>)}</div>
    {confirmation && <div className="confirm-overlay" role="presentation"><section className="confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="confirm-title"><TriangleAlert className="confirm-icon" size={30} /><h2 id="confirm-title">{confirmation.title}</h2><p>{confirmation.message}</p><div className="confirm-actions"><button type="button" className="btn-secondary" onClick={() => closeConfirmation(false)}>{t('cancel')}</button><button type="button" className="confirm-danger" onClick={() => closeConfirmation(true)}>{confirmation.confirmLabel}</button></div></section></div>}
  </FeedbackContext.Provider>;
}

export function useFeedback() {
  const context = useContext(FeedbackContext);
  if (!context) throw new Error('useFeedback must be used within FeedbackProvider');
  return context;
}
