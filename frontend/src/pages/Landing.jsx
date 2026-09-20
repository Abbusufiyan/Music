import { useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AlbumCarousel from '../components/AlbumCarousel';
import '../styles/Landing.css';

export default function Landing() {
  const navigate = useNavigate();
  const carouselInteracted = useRef(false);
  const interactionTimeout = useRef(null);

  const markCarouselInteract = useCallback(() => {
    carouselInteracted.current = true;
    clearTimeout(interactionTimeout.current);
    interactionTimeout.current = setTimeout(() => {
      carouselInteracted.current = false;
    }, 400);
  }, []);

  const handleEnter = useCallback(() => {
    if (carouselInteracted.current) return;
    navigate('/login');
  }, [navigate]);

  useEffect(() => {
    return () => clearTimeout(interactionTimeout.current);
  }, []);

  return (
    <div className="legacy-page">
      <div
        className="landing"
        onClick={handleEnter}
      role="button"
      tabIndex={0}
      aria-label="Enter application"
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleEnter();
        }
      }}
    >
      <div className="landing__atmosphere" aria-hidden="true">
        <div className="landing__glow landing__glow--purple" />
        <div className="landing__glow landing__glow--blue" />
        <div className="landing__vignette" />
        <div className="landing__grain" />
      </div>

      <div className="landing__content">
        <AlbumCarousel onCarouselInteract={markCarouselInteract} />
      </div>
      </div>
    </div>
  );
}
