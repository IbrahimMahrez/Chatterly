import { ArrowLeft, LogIn } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import welcomeLogo from '../../../ogo-removebg-preview.png';

export default function Welcome() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const destination = isAuthenticated ? '/feed' : '/login';

  useEffect(() => {
    const timeout = setTimeout(() => navigate(destination, { replace: true }), 5000);
    return () => clearTimeout(timeout);
  }, [destination, navigate]);

  return (
    <main className="welcome-page">
      <div className="welcome-glow welcome-glow-one" />
      <div className="welcome-glow welcome-glow-two" />
      <section className="welcome-card">
        <p className="welcome-kicker">WELCOME TO</p>
        <img className="welcome-logo" src={welcomeLogo} alt="Chatterly" />
        <div className="welcome-timer" aria-hidden="true"><span /></div>
        <p className="welcome-copy">مكانك للتواصل، مشاركة أفكارك، والبقاء قريبًا من الناس.</p>
        <Link className="welcome-action" to={destination}>
          {isAuthenticated ? 'ادخل إلى حسابك' : 'ابدأ الآن'}
          {isAuthenticated ? <ArrowLeft size={19} /> : <LogIn size={19} />}
        </Link>
      </section>
    </main>
  );
}
