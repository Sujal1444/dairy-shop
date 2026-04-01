import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await register(name, email, password);
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
          <p className="clr-muted" style={{ marginTop: 10 }}>Create your shop account</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="form-group">
            <label>Shop Name / Owner Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Sujal Dairy" />
          </div>
          <div className="form-group">
            <label>Email Address</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="name@domain.com" />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} placeholder="••••••••" />
          </div>
          <button type="submit" className="btn btn-primary" style={{ justifyContent: 'center', marginTop: 10 }}>Create Account</button>
        </form>

        <p style={{ textAlign: 'center', margin: '24px 0 0', fontSize: 13, color: 'var(--txt2)' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--cyan)', fontWeight: 600 }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}

export default Signup;
