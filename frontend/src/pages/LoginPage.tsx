import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate, type Location as RouterLocation } from 'react-router-dom';
import { API_BASE_URL } from '../api';
import { useAuth } from '../auth/AuthContext';

export function LoginPage() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: RouterLocation } | undefined)?.from?.pathname ?? '/admin';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (user?.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }

  return (
    <div className="auth-page">
      <form
        className="auth-card"
        onSubmit={async (event) => {
          event.preventDefault();
          setLoading(true);
          setError('');

          try {
            await login(email, password);
            navigate(from, { replace: true });
          } catch (authError) {
            setError(authError instanceof Error ? authError.message : 'Login failed.');
          } finally {
            setLoading(false);
          }
        }}
      >
        <p className="eyebrow">Admin access</p>
        <h1>Admin login</h1>
        <p className="muted">Enter admin credentials to manage dashboard, classes, and orders.</p>

        <label>
          Email
          <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" autoComplete="email" required />
        </label>

        <label>
          Password
          <input
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            type="password"
            autoComplete="current-password"
            required
          />
        </label>

        {error ? <p className="error">{error}</p> : null}

        <button className="button" type="submit" disabled={loading}>
          {loading ? 'Signing in...' : 'Sign in'}
        </button>

        <div className="hint">Auth API: {API_BASE_URL}/auth/login</div>

        <Link className="auth-back-link" to="/">
          Back to website
        </Link>
      </form>
    </div>
  );
}
