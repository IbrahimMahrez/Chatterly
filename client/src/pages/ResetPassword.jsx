import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { resetPassword } from '../api/password';

export default function ResetPassword() {
  const { userId, token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirm) {
      setError('كلمتا المرور غير متطابقتين');
      return;
    }

    setSubmitting(true);

    try {
      await resetPassword(userId, token, password);
      navigate('/login', { state: { message: 'تم تغيير كلمة المرور بنجاح' } });
    } catch (err) {
      setError(err.response?.data?.message || 'اللينك منتهي أو غير صالح');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>كلمة مرور جديدة</h1>
        <p className="auth-subtitle">أدخل كلمة المرور الجديدة</p>

        {error && <div className="error-msg">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="password">كلمة المرور الجديدة</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirm">تأكيد كلمة المرور</label>
            <input
              id="confirm"
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              minLength={6}
            />
          </div>

          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? 'جاري الحفظ...' : 'حفظ كلمة المرور'}
          </button>
        </form>

        <p className="auth-link">
          <Link to="/login">← رجوع لتسجيل الدخول</Link>
        </p>
      </div>
    </div>
  );
}
