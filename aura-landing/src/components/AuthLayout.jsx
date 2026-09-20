import { Link } from 'react-router-dom';
import { FaInstagram, FaFacebookF, FaXTwitter } from 'react-icons/fa6';
import Ferrofluid from './Ferrofluid';
import '../styles/Auth.css';

function AuraLogo() {
  return (
    <svg className="auth__logo" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <circle cx="16" cy="16" r="13" stroke="rgba(255,255,255,0.85)" strokeWidth="1.5" />
      <path
        d="M16 8 C20 12, 20 20, 16 24 C12 20, 12 12, 16 8"
        stroke="rgba(255,255,255,0.85)"
        strokeWidth="1.5"
        fill="none"
      />
    </svg>
  );
}

export default function AuthLayout({ children }) {
  return (
    <div className="auth">
      <div className="auth__ferrofluid">
        <Ferrofluid
          colors={['#ffffff', '#ffffff', '#ffffff']}
          speed={0.5}
          scale={1.6}
          turbulence={1}
          fluidity={0.1}
          rimWidth={0.2}
          sharpness={2.5}
          shimmer={1.5}
          glow={2}
          flowDirection="down"
          opacity={1}
          mouseInteraction
          mouseStrength={1}
          mouseRadius={0.35}
        />
      </div>

      <div className="auth__inner">
        <aside className="auth__brand">
          <Link to="/" className="auth__logo-link" aria-label="AURA home">
            <AuraLogo />
          </Link>

          <div className="auth__brand-content">
            <h1 className="auth__welcome">WELCOME !</h1>
            <p className="auth__tagline">
              Join us and discover music that moves with you — quickly and beautifully.
            </p>
            <Link to="/" className="auth__learn-btn">
              Learn more
            </Link>
          </div>

          <div className="auth__social">
            <a href="#" className="auth__social-link" aria-label="Instagram">
              <FaInstagram size={18} />
            </a>
            <a href="#" className="auth__social-link" aria-label="Facebook">
              <FaFacebookF size={16} />
            </a>
            <a href="#" className="auth__social-link" aria-label="X">
              <FaXTwitter size={16} />
            </a>
          </div>
        </aside>

        <main className="auth__main">{children}</main>
      </div>
    </div>
  );
}
