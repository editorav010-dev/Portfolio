import { useEffect, useRef } from 'react';

/**
 * ParticleBackground — a drifting void starfield with faint constellation
 * linking and subtle cursor parallax (React Bits "Particles Background" style
 * ambience layer). Canvas-based, throttled on touch devices, paused when the
 * tab is hidden.
 */

interface Star { x: number; y: number; z: number; tw: number; }

export default function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const coarse = window.matchMedia('(pointer: coarse)').matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0, h = 0, raf = 0, visible = true;
    let stars: Star[] = [];
    const mouse = { x: 0.5, y: 0.5 };

    const resize = () => {
      w = window.innerWidth; h = window.innerHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.min(coarse ? 70 : 140, Math.floor((w * h) / 12000));
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        z: 0.3 + Math.random() * 0.7,          // depth for parallax
        tw: Math.random() * Math.PI * 2,       // twinkle phase
      }));
    };
    resize();

    const palette = ['rgba(34,247,230,', 'rgba(255,46,166,', 'rgba(139,92,246,', 'rgba(232,230,240,'];

    let t = 0;
    const draw = () => {
      raf = requestAnimationFrame(draw);
      if (!visible) return;
      t += 0.008;
      ctx.clearRect(0, 0, w, h);

      const px = (mouse.x - 0.5) * 40, py = (mouse.y - 0.5) * 40;
      for (const s of stars) {
        if (!reduced) {
          s.y -= s.z * 0.12;
          if (s.y < -4) { s.y = h + 4; s.x = Math.random() * w; }
        }
        const x = s.x - px * s.z, y = s.y - py * s.z;
        const twinkle = 0.35 + 0.65 * Math.abs(Math.sin(s.tw + t * (1 + s.z)));
        ctx.fillStyle = palette[(s.x | 0) % palette.length] + (twinkle * s.z * 0.8).toFixed(3) + ')';
        const r = s.z * 1.7;
        ctx.fillRect(x, y, r, r);
      }

      // sparse constellation links between close neighbours (depth cue)
      if (!reduced && !coarse) {
        ctx.lineWidth = 0.5;
        for (let i = 0; i < stars.length; i++) {
          const a = stars[i];
          for (let j = i + 1; j < Math.min(i + 8, stars.length); j++) {
            const b = stars[j];
            const dx = a.x - b.x, dy = a.y - b.y;
            const d2 = dx * dx + dy * dy;
            if (d2 < 90 * 90) {
              ctx.strokeStyle = `rgba(139,92,246,${(1 - Math.sqrt(d2) / 90) * 0.14})`;
              ctx.beginPath();
              ctx.moveTo(a.x - px * a.z, a.y - py * a.z);
              ctx.lineTo(b.x - px * b.z, b.y - py * b.z);
              ctx.stroke();
            }
          }
        }
      }
    };
    raf = requestAnimationFrame(draw);

    const onMove = (e: PointerEvent) => {
      mouse.x = e.clientX / w;
      mouse.y = e.clientY / h;
    };
    const onVis = () => { visible = document.visibilityState === 'visible'; };

    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('visibilitychange', onVis);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden className="fixed inset-0 -z-10 h-full w-full" />;
}
