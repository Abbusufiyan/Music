import { useState, useEffect, useRef, useMemo } from 'react';
import MusicCard3D from './MusicCard3D';

export function MusicTunnel3D({ songs = [] }) {
  const containerRef = useRef(null);
  const animationFrameRef = useRef(null);

  // Parallax mouse position (-1 to 1)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const currentPosRef = useRef({ x: 0, y: 0 });

  // Viewport size detection for responsive full-screen coverage
  const [screenSize, setScreenSize] = useState(() => {
    if (typeof window !== 'undefined') {
      if (window.innerWidth < 640) return 'mobile';
      if (window.innerWidth < 1024) return 'tablet';
      return 'desktop';
    }
    return 'desktop';
  });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 640) setScreenSize('mobile');
      else if (width < 1024) setScreenSize('tablet');
      else setScreenSize('desktop');
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Compute dense grid dimensions to cover full viewport edge-to-edge
  const gridConfig = useMemo(() => {
    if (screenSize === 'mobile') {
      return { cols: 4, rows: 4, spacingX: 175, spacingY: 250 };
    }
    if (screenSize === 'tablet') {
      return { cols: 6, rows: 5, spacingX: 220, spacingY: 300 };
    }
    return { cols: 8, rows: 5, spacingX: 255, spacingY: 330 };
  }, [screenSize]);

  // Track mouse movement for interactive 3D parallax
  useEffect(() => {
    const handleMouseMove = (e) => {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      const nx = (e.clientX - cx) / cx;
      const ny = (e.clientY - cy) / cy;

      setMousePos({
        x: Math.max(-1, Math.min(1, nx)),
        y: Math.max(-1, Math.min(1, ny)),
      });
    };

    const handleTouchMove = (e) => {
      if (e.touches && e.touches[0]) {
        const touch = e.touches[0];
        const cx = window.innerWidth / 2;
        const cy = window.innerHeight / 2;
        const nx = (touch.clientX - cx) / cx;
        const ny = (touch.clientY - cy) / cy;
        setMousePos({
          x: Math.max(-1, Math.min(1, nx)),
          y: Math.max(-1, Math.min(1, ny)),
        });
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);

  // Generate 3D grid positioning for CONVEX OUTER CURVED SURFACE
  const cards = useMemo(() => {
    const list = [];
    const { cols, rows, spacingX, spacingY } = gridConfig;
    const halfCols = (cols - 1) / 2;
    const halfRows = (rows - 1) / 2;

    let index = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        // Offset from center in pixels
        const gridX = (c - halfCols) * spacingX;
        const gridY = (r - halfRows) * spacingY;

        // Normalized offsets from screen center (-1 to 1)
        const normX = (c - halfCols) / (cols / 2);
        const normY = (r - halfRows) / (rows / 2);

        // CONVEX OUTER SURFACE CURVATURE GEOMETRY:
        // Center cards bulge forward (+Z towards user); edge cards recede backward (-Z away into depth).
        const distSq = normX * normX + normY * normY;
        const baseZ = 220 - distSq * 290;

        // Rotation angles for outer curved surface facing camera:
        // Positive normX (right) -> positive rotateY (right edge curves away into screen)
        // Negative normX (left) -> negative rotateY (left edge curves away into screen)
        const rotateY = normX * 32;
        // Positive normY (bottom) -> positive rotateX (bottom edge curves away down)
        // Negative normY (top) -> negative rotateX (top edge curves away up)
        const rotateX = normY * 20;

        const scale = Math.max(0.68, 1.05 - Math.sqrt(distSq) * 0.14);
        const opacity = Math.max(0.4, 1.0 - Math.sqrt(distSq) * 0.2);
        const isCenter = Math.sqrt(distSq) < 0.45;

        // Assign unique song from database list
        const songData = songs.length > 0 ? songs[index % songs.length] : null;

        list.push({
          id: `card-${r}-${c}`,
          index,
          gridX,
          gridY,
          baseZ,
          rotateX,
          rotateY,
          scale,
          opacity,
          isCenter,
          song: songData,
        });

        index++;
      }
    }
    return list;
  }, [gridConfig, songs]);

  // Smooth lerp animation loop for subtle floating ambient parallax
  const [stageTransform, setStageTransform] = useState('');

  useEffect(() => {
    let startTime = performance.now();

    const animate = (now) => {
      const elapsed = (now - startTime) / 1000;

      // Lerp mouse coordinates
      currentPosRef.current.x += (mousePos.x - currentPosRef.current.x) * 0.05;
      currentPosRef.current.y += (mousePos.y - currentPosRef.current.y) * 0.05;

      const px = currentPosRef.current.x;
      const py = currentPosRef.current.y;

      // Ambient subtle drift
      const ambientY = Math.sin(elapsed * 0.7) * 10;
      const ambientRotateZ = Math.sin(elapsed * 0.4) * 1.2;

      // Camera tilt matching convex screen presentation
      const camRotateX = -py * 12;
      const camRotateY = px * 16 + Math.sin(elapsed * 0.3) * 1.5;

      setStageTransform(
        `translate3d(0px, ${ambientY}px, 0px) rotateX(${camRotateX}deg) rotateY(${camRotateY}deg) rotateZ(${ambientRotateZ}deg)`
      );

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [mousePos]);

  return (
    <div className="music-tunnel-viewport relative w-full h-full flex items-center justify-center overflow-hidden perspective-viewport">
      {/* 3D World Stage */}
      <div
        className="music-tunnel-stage relative preserve-3d transition-transform duration-100 ease-out will-change-transform"
        style={{ transform: stageTransform }}
      >
        {cards.map((card) => {
          const cardTransform = `translate3d(${card.gridX}px, ${card.gridY}px, ${card.baseZ}px) rotateY(${card.rotateY}deg) rotateX(${card.rotateX}deg) scale(${card.scale})`;

          return (
            <div
              key={card.id}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 preserve-3d will-change-transform transition-all duration-300"
              style={{
                transform: cardTransform,
                opacity: card.opacity,
                zIndex: Math.round(card.baseZ + 1500),
              }}
            >
              <MusicCard3D
                song={card.song}
                index={card.index}
                isHighlight={card.isCenter}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default MusicTunnel3D;
