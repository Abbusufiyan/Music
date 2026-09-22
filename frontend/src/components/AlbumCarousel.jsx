import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { motion, AnimatePresence, useAnimationFrame } from 'framer-motion';
import { carouselAlbums } from '../data/albums';
import { resolveApiUrl } from '../api/apiClient';
import '../styles/AlbumCarousel.css';

const VISIBLE_RANGE = 3;
const DRAG_SENSITIVITY = 200;
const SNAP_THRESHOLD = 0.18;
const AUTO_PLAY_INTERVAL = 3500;
const AUTO_PLAY_RESUME_DELAY = 6000;

function getAlbumStyle(offset, parallax, dragOffset = 0) {
  const visualOffset = offset + dragOffset;
  const absOffset = Math.abs(visualOffset);
  const translateZ = -absOffset * 130;
  const translateX = visualOffset * 155;
  const translateY = absOffset * 8 - parallax.y * 6;
  const rotateY = visualOffset * -38 + parallax.x * 4;
  const rotateX = parallax.y * -3 + absOffset * 2;
  const scale = Math.max(0.5, 1 - absOffset * 0.15);
  const opacity = Math.max(0.2, 1 - absOffset * 0.24);
  const blur = absOffset * 2;
  const zIndex = 10 - absOffset;

  return {
    transform: `translate3d(${translateX}px, ${translateY}px, ${translateZ}px) rotateY(${rotateY}deg) rotateX(${rotateX}deg) scale(${scale})`,
    opacity,
    filter: blur > 0.5 ? `blur(${blur}px)` : 'none',
    zIndex,
  };
}

export default function AlbumCarousel({ onCarouselInteract }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [parallax, setParallax] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [idlePhase, setIdlePhase] = useState(0);

  const containerRef = useRef(null);
  const dragStartX = useRef(0);
  const didDrag = useRef(false);
  const autoPlayPaused = useRef(false);
  const resumeTimeout = useRef(null);
  const isDraggingRef = useRef(false);

  const total = carouselAlbums.length;

  const visibleIndices = useMemo(() => {
    const indices = [];
    for (let i = activeIndex - VISIBLE_RANGE; i <= activeIndex + VISIBLE_RANGE; i++) {
      const wrapped = ((i % total) + total) % total;
      indices.push({ index: wrapped, offset: i - activeIndex });
    }
    return indices;
  }, [activeIndex, total]);

  const pauseAutoPlay = useCallback((temporary = true) => {
    autoPlayPaused.current = true;
    clearTimeout(resumeTimeout.current);
    if (temporary) {
      resumeTimeout.current = setTimeout(() => {
        autoPlayPaused.current = false;
      }, AUTO_PLAY_RESUME_DELAY);
    }
  }, []);

  const goTo = useCallback(
    (direction, fromAutoPlay = false) => {
      if (!fromAutoPlay) {
        onCarouselInteract?.();
        pauseAutoPlay();
      }
      setActiveIndex((prev) => (prev + direction + total) % total);
    },
    [total, onCarouselInteract, pauseAutoPlay]
  );

  const advanceAuto = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % total);
  }, [total]);

  useAnimationFrame((time) => {
    if (!isDragging) {
      setIdlePhase(time * 0.0004);
    }
  });

  const handleMouseMove = useCallback(
    (e) => {
      if (isDragging) return;
      const nx = (e.clientX / window.innerWidth - 0.5) * 2;
      const ny = (e.clientY / window.innerHeight - 0.5) * 2;
      setParallax({
        x: Math.max(-1, Math.min(1, nx)),
        y: Math.max(-1, Math.min(1, ny)),
      });
    },
    [isDragging]
  );

  const handlePointerDown = useCallback(
    (e) => {
      pauseAutoPlay();
      isDraggingRef.current = true;
      setIsDragging(true);
      didDrag.current = false;
      dragStartX.current = e.clientX;
      setDragOffset(0);
      e.currentTarget.setPointerCapture(e.pointerId);
    },
    [pauseAutoPlay]
  );

  const handlePointerMove = useCallback(
    (e) => {
      if (!isDragging) return;
      const delta = e.clientX - dragStartX.current;
      const offset = delta / DRAG_SENSITIVITY;
      if (Math.abs(delta) > 6) {
        didDrag.current = true;
      }
      setDragOffset(Math.max(-2.5, Math.min(2.5, offset)));
    },
    [isDragging]
  );

  const handlePointerUp = useCallback(() => {
    if (!isDragging) return;

    let steps = 0;
    if (Math.abs(dragOffset) >= SNAP_THRESHOLD) {
      steps = -Math.round(dragOffset);
    }

    if (steps !== 0) {
      onCarouselInteract?.();
      pauseAutoPlay();
      setActiveIndex((prev) => (prev + steps + total * 10) % total);
    }

    isDraggingRef.current = false;
    setIsDragging(false);
    setDragOffset(0);
  }, [isDragging, dragOffset, total, onCarouselInteract, pauseAutoPlay]);

  const handleCarouselClick = useCallback((e) => {
    if (didDrag.current) {
      e.stopPropagation();
      didDrag.current = false;
    }
  }, []);

  const handleDotClick = useCallback(
    (e, index) => {
      e.stopPropagation();
      onCarouselInteract?.();
      pauseAutoPlay();
      setActiveIndex(index);
    },
    [onCarouselInteract, pauseAutoPlay]
  );

  useEffect(() => {
    const interval = setInterval(() => {
      if (!autoPlayPaused.current && !isDraggingRef.current) {
        advanceAuto();
      }
    }, AUTO_PLAY_INTERVAL);

    return () => {
      clearInterval(interval);
      clearTimeout(resumeTimeout.current);
    };
  }, [advanceAuto]);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [handleMouseMove]);

  useEffect(() => {
    const handleWheel = (e) => {
      if (Math.abs(e.deltaX) < Math.abs(e.deltaY) ? Math.abs(e.deltaY) < 10 : Math.abs(e.deltaX) < 10) {
        return;
      }
      e.preventDefault();
      const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      goTo(delta > 0 ? 1 : -1);
    };

    const el = containerRef.current;
    if (!el) return undefined;
    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, [goTo]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') {
        e.stopPropagation();
        goTo(-1);
      }
      if (e.key === 'ArrowRight') {
        e.stopPropagation();
        goTo(1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goTo]);

  const idleFloat = Math.sin(idlePhase) * 4;
  const idleRotate = Math.sin(idlePhase * 0.7) * 0.6;
  const stageTransform = `
    translateY(${idleFloat}px)
    rotateY(${parallax.x * 2.5 + idleRotate}deg)
    rotateX(${parallax.y * -1.5}deg)
  `;

  const displayIndex = useMemo(() => {
    if (Math.abs(dragOffset) < SNAP_THRESHOLD) return activeIndex;
    const shifted = Math.round(activeIndex - dragOffset);
    return ((shifted % total) + total) % total;
  }, [activeIndex, dragOffset, total]);

  const displayAlbum = carouselAlbums[displayIndex];

  return (
    <div
      className={`carousel ${isDragging ? 'carousel--dragging' : ''}`}
      ref={containerRef}
      role="region"
      aria-label="Album carousel"
      aria-roledescription="carousel"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onClick={handleCarouselClick}
    >
      <div className="carousel__stage" style={{ transform: stageTransform }}>
        <div className="carousel__tunnel">
          {visibleIndices.map(({ index, offset }) => {
            const album = carouselAlbums[index];
            const isActive = offset === 0;
            const style = getAlbumStyle(offset, parallax, dragOffset);

            return (
              <div
                key={`${album.id}-${offset}`}
                className={`carousel__item ${isActive && Math.abs(dragOffset) < 0.35 ? 'carousel__item--active' : ''}`}
                style={style}
                aria-hidden={!isActive}
              >
                <div className="carousel__cover-wrap">
                  <img
                    src={resolveApiUrl(album.cover)}
                    alt={`${album.title} by ${album.artist}`}
                    className="carousel__cover"
                    loading={Math.abs(offset) <= 1 ? 'eager' : 'lazy'}
                    draggable={false}
                  />
                  {isActive && (
                    <>
                      <div className="carousel__glow" aria-hidden="true" />
                      <div className="carousel__reflection" aria-hidden="true" />
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={isDragging ? 'dragging' : displayAlbum.id}
          className="carousel__info"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: isDragging ? 0.6 : 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        >
          <h1 className="carousel__title">{displayAlbum.title}</h1>
          <p className="carousel__artist">{displayAlbum.artist}</p>
          <span className="carousel__genre">{displayAlbum.genre}</span>
        </motion.div>
      </AnimatePresence>

      <div className="carousel__dots" role="tablist" aria-label="Album selection">
        {carouselAlbums.map((album, i) => (
          <button
            key={album.id}
            type="button"
            role="tab"
            aria-selected={i === activeIndex}
            aria-label={`Go to ${album.title}`}
            className={`carousel__dot ${i === activeIndex ? 'carousel__dot--active' : ''}`}
            onClick={(e) => handleDotClick(e, i)}
          />
        ))}
      </div>
    </div>
  );
}
