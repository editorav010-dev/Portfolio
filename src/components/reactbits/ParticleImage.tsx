import { useEffect, useRef } from 'react';
import { useIsTouch, useReducedMotion } from '../../hooks/useReducedMotion';

/**
 * ParticleImage — an image rendered as thousands of particles that swirl apart
 * under the cursor and reform when it leaves (React Bits "Particle Image" adaptation).
 *
 * Licensing note: mirrors `@reactbits-starter/particle-image-tw`. No REACTBITS_LICENSE_KEY
 * was available at build time so this is a faithful dependency-free re-implementation of
 * the documented behaviour; drop-in replaceable once the Pro registry is authorized.
 */

interface Particle {
  x: number; y:number; ox: number; oy: number;
  vx: number; vy: number; r: number; color: [number, number, number]; a: number;
}

interface Props {
  src: string;
  className?: string;
  particleGap?: number;   // sampling stride in px (smaller = denser)
  radius?: number;        // cursor repulsion radius
  alt?: string;
}

export default function ParticleImage({ src, className = '', particleGap = 4, radius = 90, alt = '' }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();
  const touch = useIsTouch();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf = 0;
    let destroyed = false;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const gap = touch ? particleGap + 2 : particleGap;
    const pointer = { x: -9999, y: -9999, active: false };
    let particles: Particle[] = [];

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      if (destroyed) return;
      const rect = canvas.getBoundingClientRect();
      const w = rect.width, h = rect.height;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // sample pixels offscreen
      const off = document.createElement('canvas');
      off.width = w; off.height = h;
      const octx = off.getContext('2d')!;
      const scale = Math.max(w / img.width, h / img.height);
      const dw = img.width * scale, dh = img.height * scale;
      octx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);
      const data = octx.getImageData(0, 0, w, h).data;

      particles = [];
      for (let y = 0; y < h; y += gap) {
        for (let x = 0; x < w; x += gap) {
          const i = (y * w + x) * 4;
          const alpha = data[i + 3];
          if (alpha < 60) continue;
          const lum = (data[i] + data[i + 1] + data[i + 2]) / 3;
          if (lum < 26) continue; // skip near-black void pixels
          particles.push({
            x: Math.random() * w, y: Math.random() * h,
            ox: x, oy: y, vx: 0, vy: 0,
            r: gap * 0.42 * (0.7 + Math.random() * 0.6),
            color: [data[i], data[i + 1], data[i + 2]],
            a: Math.min(1, alpha / 255) * (0.55 + (lum / 255) * 0.45),
          });
        }
      }

      const draw = () => {
        raf = requestAnimationFrame(draw);
        ctx.clearRect(0, 0, w, h);
        for (const p of particles) {
          if (reduced) {
            p.x += (p.ox - p.x) * 0.2;
            p.y += (p.oy - p.y) * 0.2;
          } else {
            // spring back to origin
            const dx0 = p.ox - p.x, dy0 = p.oy - p.y;
            p.vx += dx0 * 0.018;
            p.vy += dy0 * 0.018;
            // cursor repulsion + swirl
            if (pointer.active) {
              const dx = p.x - pointer.x, dy = p.y - pointer.y;
              const dist = Math.hypot(dx, dy);
              if (dist < radius && dist > 0.001) {
                const f = ((radius - dist) / radius) ** 2 * 6;
                const nx = dx / dist, ny = dy / dist;
                p.vx += nx * f + -ny * f * 0.6; // tangential swirl term
                p.vy += ny * f + nx * f * 0.6;
              }
            }
            p.vx *= 0.86; p.vy *= 0.86;
            p.x += p.vx; p.y += p.vy;
          }
          ctx.globalAlpha = p.a;
          ctx.fillStyle = `rgb(${p.color[0]},${p.color[1]},${p.color[2]})`;
          ctx.fillRect(p.x, p.y, p.r, p.r);
        }
        ctx.globalAlpha = 1;
      };
      draw();
    };
    img.src = src;

    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = e.clientX - rect.left;
      pointer.y = e.clientY - rect.top;
      pointer.active = true;
    };
    const onLeave = () => { pointer.active = false; pointer.x = -9999; pointer.y = -9999; };

    if (!touch) {
      canvas.addEventListener('pointermove', onMove);
      canvas.addEventListener('pointerleave', onLeave);
    } else {
      // gentle auto-swirl on touch devices
      const t0 = performance.now();
      const anim = () => {
        const rect = canvas.getBoundingClientRect();
        const t = (performance.now() - t0) / 1000;
        pointer.x = rect.width / 2 + Math.cos(t * 0.7) * rect.width * 0.28;
        pointer.y = rect.height / 2 + Math.sin(t * 1.1) * rect.height * 0.28;
        pointer.active = true;
      };
      const id = window.setInterval(anim, 60);
      canvas.addEventListener('pointercancel', () => window.clearInterval(id));
    }

    const ro = new ResizeObserver(() => { /* re-seed by reloading */ 
      img.src = ''; img.src = src;
    });
    ro.observe(canvas);

    return () => {
      destroyed = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerleave', onLeave);
    };
  }, [src, particleGap, radius, reduced, touch]);

  return (
    <canvas
      ref={canvasRef}
      role="img"
      aria-label={alt || `Particle rendering of ${src}`}
      className={`w-full h-full ${className}`}
    />
  );
}
