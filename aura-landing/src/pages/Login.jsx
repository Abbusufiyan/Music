import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import AuthLayout from '../components/AuthLayout';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
  };

  return (
    <AuthLayout>
      <motion.div
        className="auth-card"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      >
        <h2 className="auth-card__title">Sign in</h2>

        <form className="auth-card__form" onSubmit={handleSubmit}>
          <div className="auth-field">
            <label className="auth-field__label" htmlFor="login-username">
              User Name
            </label>
            <input
              id="login-username"
              type="text"
              className="auth-field__input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
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

          <button type="submit" className="auth-card__submit">
            Submit
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
  );
}
