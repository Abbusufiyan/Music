import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import AuthLayout from '../components/AuthLayout';

export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

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
        <h2 className="auth-card__title">Sign up</h2>

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

          <button type="submit" className="auth-card__submit">
            Submit
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
  );
}
