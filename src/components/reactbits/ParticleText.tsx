import { useEffect, useRef } from 'react';
import { useIsTouch, useReducedMotion } from '../../hooks/useReducedMotion';

/**
 * ParticleText — text rendered as particles that scatter away from the cursor
 * and reform (React Bits "Particle Text" adaptation).
 *
 * Licensing note: mirrors `@reactbits-starter/particle-text-tw`; re-implemented
 * dependency-free because no REACTBITS_LICENSE_KEY was available at build time.
 */

interface P { x: number; y: number; ox: number; oy: number; vx: number; vy: number; hue: number; }

interface Props {
  text: string;
  className?: string;         // sizing/typography classes control canvas text metrics
  fontSize?: number;          // px inside canvas coordinate space
  colorMode?: 'neon' | 'mono';
}

export default function ParticleText({ text, className = '', fontSize = 120, colorMode = 'neon' }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();
  const touch = useIsTouch();

  useEffect(() => {
    const wrap = wrapRef.current, canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf = 0, destroyed = false;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const pointer = { x: -9999, y: -9999, active: false };
    let parts: P[] = [];
    const NEON = ['#22f7e6', '#ff2ea6', '#8b5cf6', '#c8f31d'];

    const seed = () => {
      const rect = wrap.getBoundingClientRect();
      const w = Math.max(1, rect.width), h = Math.max(1, rect.height);
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const fs = Math.min(fontSize, (w * 1.6) / Math.max(6, text.length));
      ctx.clearRect(0, 0, w, h);
      ctx.font = `900 ${fs}px Unbounded, sans-serif`;
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#fff';
      ctx.fillText(text, (w - ctx.measureText(text).width) / 2, h / 2);
      const data = ctx.getImageData(0, 0, w, h).data;

      parts = [];
      const gap = touch ? 5 : 4;
      for (let y = 0; y < h; y += gap) {
        for (let x = 0; x < w; x += gap) {
          if (data[(y * w + x) * 4 + 3] > 140) {
            parts.push({
              x: Math.random() * w, y: Math.random() * h, ox: x, oy: y,
              vx: 0, vy: 0, hue: Math.floor(Math.random() * NEON.length),
            });
          }
        }
      }
      ctx.clearRect(0, 0, w, h);
    };

    seed();
    const loop = () => {
      if (destroyed) return;
      raf = requestAnimationFrame(loop);
      const rect = wrap.getBoundingClientRect();
      ctx.clearRect(0, 0, rect.width, rect.height);
      ctx.fillStyle = colorMode === 'neon' ? '' : '#e8e6f0';
      for (const p of parts) {
        if (!reduced && pointer.active) {
          const dx = p.x - pointer.x, dy = p.y - pointer.y;
          const dist = Math.hypot(dx, dy);
          if (dist < 90 && dist > 0.001) {
            const f = ((90 - dist) / 90) ** 2 * 5;
            p.vx += (dx / dist) * f;
            p.vy += (dy / dist) * f;
          }
        }
        p.vx += (p.ox - p.x) * 0.02;
        p.vy += (p.oy - p.y) * 0.02;
        p.vx *= 0.9; p.vy *= 0.9;
        p.x += p.vx; p.y += p.vy;
        if (colorMode === 'neon') ctx.fillStyle = NEON[p.hue];
        ctx.fillRect(p.x, p.y, 2, 2);
      }
    };
    raf = requestAnimationFrame(loop);

    const onMove = (e: PointerEvent) => {
      const rect = wrap.getBoundingClientRect();
      pointer.x = e.clientX - rect.left;
      pointer.y = e.clientY - rect.top;
      pointer.active = true;
    };
    const onLeave = () => { pointer.active = false; };

    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerleave', onLeave);
    const ro = new ResizeObserver(seed);
    ro.observe(wrap);

    return () => {
      destroyed = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerleave', onLeave);
    };
  }, [text, fontSize, colorMode, reduced, touch]);

  return (
    <div ref={wrapRef} className={`relative w-full ${className}`}>
      <span className="sr-only">{text}</span>
      <canvas ref={canvasRef} aria-hidden className="block w-full h-full" />
    </div>
  );
}
