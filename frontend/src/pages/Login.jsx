import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import AuthLayout from '../components/AuthLayout';
import { authService } from '../api/services';
import { setToken } from '../api/apiClient';
import { useApp } from '../context/AppContext';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { setAuthUser } = useApp();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Please enter your username/email and password.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const res = await authService.login(username, password);
      if (res.token) {
        setToken(res.token);
        if (res.user) {
          setAuthUser(res.user);
        }
        navigate('/home');
      }
    } catch (err) {
      if (Array.isArray(err.details) && err.details.length > 0) {
        const detailMsg = typeof err.details[0] === 'object' ? err.details[0].message : err.details[0];
        setError(detailMsg || err.message || 'Login failed. Please check your credentials.');
      } else {
        setError(err.message || 'Login failed. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="legacy-page">
      <AuthLayout>
        <motion.div
          className="auth-card"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        >
          <h2 className="auth-card__title">Sign in</h2>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/20 border border-red-500/30 text-red-200 text-xs">
              {error}
            </div>
          )}

          <form className="auth-card__form" onSubmit={handleSubmit}>
            <div className="auth-field">
              <label className="auth-field__label" htmlFor="login-username">
                User Name / Email
              </label>
              <input
                id="login-username"
                type="text"
                className="auth-field__input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username or email"
                autoComplete="username"
              />
            </div>

            <div className="auth-field">
              <label className="auth-field__label" htmlFor="login-password">
                Password
              </label>
              <input
                id="login-password"
                type="password"
                className="auth-field__input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="auth-card__submit disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Submit'}
            </button>
          </form>

          <p className="auth-card__switch">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="auth-card__link">
              Register
            </Link>
          </p>
        </motion.div>
      </AuthLayout>
    </div>
  );
}
