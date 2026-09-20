import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import AuthLayout from '../components/AuthLayout';
import { authService } from '../api/services';
import { setToken } from '../api/apiClient';
import { useApp } from '../context/AppContext';

export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { setAuthUser } = useApp();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !email.trim() || !password.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const res = await authService.register(username, email, password);
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
        setError(detailMsg || err.message || 'Registration failed. Please try again.');
      } else {
        setError(err.message || 'Registration failed. Please try again.');
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
          <h2 className="auth-card__title">Sign up</h2>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/20 border border-red-500/30 text-red-200 text-xs">
              {error}
            </div>
          )}

          <form className="auth-card__form" onSubmit={handleSubmit}>
            <div className="auth-field">
              <label className="auth-field__label" htmlFor="register-username">
                User Name
              </label>
              <input
                id="register-username"
                type="text"
                className="auth-field__input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Choose a username"
                autoComplete="username"
              />
            </div>

            <div className="auth-field">
              <label className="auth-field__label" htmlFor="register-email">
                Email
              </label>
              <input
                id="register-email"
                type="email"
                className="auth-field__input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                autoComplete="email"
              />
            </div>

            <div className="auth-field">
              <label className="auth-field__label" htmlFor="register-password">
                Password
              </label>
              <input
                id="register-password"
                type="password"
                className="auth-field__input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password"
                autoComplete="new-password"
              />
            </div>

            <div className="auth-field">
              <label className="auth-field__label" htmlFor="register-confirm">
                Confirm Password
              </label>
              <input
                id="register-confirm"
                type="password"
                className="auth-field__input"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                autoComplete="new-password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="auth-card__submit disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Submit'}
            </button>
          </form>

          <p className="auth-card__switch">
            Already have an account?{' '}
            <Link to="/login" className="auth-card__link">
              Sign in
            </Link>
          </p>
        </motion.div>
      </AuthLayout>
    </div>
  );
}
