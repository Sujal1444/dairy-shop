import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const { forgotPassword } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await forgotPassword(email);
    if (success) {
      setSubmitted(true);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', width: '100%' }}>
      <div className="card" style={{ padding: 40, width: '100%', maxWidth: 400 }}>
        <div style={{ textAlign: 'center', marginBottom: 30 }}>
          <div className="brand" style={{ justifyContent: 'center', border: 'none', margin: 0 }}>
            <div className="brand-name">Recovery</div>
          </div>
          <p className="clr-muted" style={{ marginTop: 10 }}>Reset your password via Email</p>
        </div>

        {submitted ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 20 }}>📧</div>
            <h3 style={{ marginBottom: 10 }}>Email Sent!</h3>
            <p className="clr-muted" style={{ fontSize: 14 }}>Please check your inbox for the password reset link.</p>
            <Link to="/login" className="btn btn-ghost" style={{ marginTop: 30, justifyContent: 'center', width: '100%' }}>Return to Login</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="form-group">
              <label>Account Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="name@dairypro.com" />
            </div>
            
            <button type="submit" className="btn btn-primary" style={{ justifyContent: 'center', marginTop: 10 }}>Send Reset Link</button>
          </form>
        )}

        {!submitted && (
          <p style={{ textAlign: 'center', marginTop: 24, fontSize: 13, color: 'var(--txt2)' }}>
            Remembered your password? <Link to="/login" style={{ color: 'var(--cyan)', fontWeight: 600 }}>Sign in</Link>
          </p>
        )}
      </div>
    </div>
  );
}

export default ForgotPassword;
