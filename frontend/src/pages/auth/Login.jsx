import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await login(email, password);
    if (success) {
      navigate('/');
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', width: '100%' }}>
      <div className="card" style={{ padding: 40, width: '100%', maxWidth: 400 }}>
        <div style={{ textAlign: 'center', marginBottom: 30 }}>
          <div className="brand" style={{ justifyContent: 'center', border: 'none', margin: 0 }}>
            <div className="brand-icon">🥛</div>
            <div className="brand-name">DairyPro</div>
          </div>
          <p className="clr-muted" style={{ marginTop: 10 }}>Sign in to manage your shop</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="form-group">
            <label>Email Address</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="name@dairypro.com" />
          </div>
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <label>Password</label>
              <Link to="/forgot-password" style={{ fontSize: 11, color: 'var(--cyan)' }}>Forgot Password?</Link>
            </div>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••" />
          </div>
          <button type="submit" className="btn btn-primary" style={{ justifyContent: 'center', marginTop: 10 }}>Sign In</button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 24, fontSize: 13, color: 'var(--txt2)' }}>
          Don't have an account? <Link to="/signup" style={{ color: 'var(--cyan)', fontWeight: 600 }}>Create one</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
