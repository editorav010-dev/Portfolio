import { useEffect, useRef } from 'react';
import { useIsTouch, useReducedMotion } from '../../hooks/useReducedMotion';

/**
 * ParticleMorph — a halftone dot matrix that morphs from one image into the next
 * (React Bits "Particle Morph" adaptation).
 *
 * Licensing note: mirrors `@reactbits-starter/particle-morph-tw`; re-implemented
 * dependency-free because no REACTBITS_LICENSE_KEY was available at build time.
 */

interface Props {
  images: string[];        // sources to cycle through
  className?: string;
  dotSpacing?: number;
  intervalMs?: number;     // auto-morph cadence
}

interface Dot {
  x: number; y: number;
  sizeA: number; sizeB: number; size: number;
  ca: [number, number, number]; cb: [number, number, number]; c: [number, number, number];
}

export default function ParticleMorph({ images, className = '', dotSpacing = 7, intervalMs = 4200 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();
  const touch = useIsTouch();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf = 0, destroyed = false;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const spacing = touch ? dotSpacing + 2 : dotSpacing;
    const pointer = { x: -9999, y: -9999 };

    type Field = { w: number; h: number; data: Uint8ClampedArray };
    const fields: Field[] = [];
    let loaded = 0;

    const sample = (img: HTMLImageElement): Field => {
      const rect = canvas.getBoundingClientRect();
      const w = Math.max(1, Math.floor(rect.width)), h = Math.max(1, Math.floor(rect.height));
      const off = document.createElement('canvas');
      off.width = w; off.height = h;
      const octx = off.getContext('2d')!;
      const scale = Math.max(w / img.width, h / img.height);
      octx.drawImage(img, (w - img.width * scale) / 2, (h - img.height * scale) / 2, img.width * scale, img.height * scale);
      return { w, h, data: octx.getImageData(0, 0, w, h).data };
    };

    images.forEach((src) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        if (destroyed) return;
        fields.push(sample(img));
        loaded++;
        if (loaded === 1) start();
      };
      img.onerror = () => { fields.push({ w: 1, h: 1, data: new Uint8ClampedArray(4) }); loaded++; if (loaded === 1) start(); };
      img.src = src;
    });

    let dots: Dot[] = [];
    let idxA = 0, idxB = 1 % images.length;
    let progress = 1;         // 0..1 morph progress A->B
    let morphing = false;
    let lastT = 0;
    let timer = 0;

    const buildDots = () => {
      const rect = canvas.getBoundingClientRect();
      const w = rect.width, h = rect.height;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      dots = [];
      const fa = fields[idxA], fb = fields[idxB];
      for (let y = spacing / 2; y < h; y += spacing) {
        for (let x = spacing / 2; x < w; x += spacing) {
          const px = Math.floor(x), py = Math.floor(y);
          const ia = (Math.min(fa.h - 1, Math.floor((py / h) * fa.h)) * fa.w + Math.min(fa.w - 1, Math.floor((px / w) * fa.w))) * 4;
          const ib = (Math.min(fb.h - 1, Math.floor((py / h) * fb.h)) * fb.w + Math.min(fb.w - 1, Math.floor((px / w) * fb.w))) * 4;
          const la = (fa.data[ia] + fa.data[ia + 1] + fa.data[ia + 2]) / 765;
          const lb = (fb.data[ib] + fb.data[ib + 1] + fb.data[ib + 2]) / 765;
          dots.push({
            x, y, size: 0,
            sizeA: la * spacing * 1.15, sizeB: lb * spacing * 1.15,
            ca: [fa.data[ia], fa.data[ia + 1], fa.data[ia + 2]],
            cb: [fb.data[ib], fb.data[ib + 1], fb.data[ib + 2]],
            c: [fa.data[ia], fa.data[ia + 1], fa.data[ia + 2]],
          });
        }
      }
    };

    const start = () => {
      if (destroyed || fields.length < 2) return;
      buildDots();
      const loop = (t: number) => {
        raf = requestAnimationFrame(loop);
        const dt = Math.min(50, t - lastT); lastT = t;
        const rect = canvas.getBoundingClientRect();
        ctx.clearRect(0, 0, rect.width, rect.height);
        const ease = reduced ? 1 : Math.min(1, dt / 16 * 0.03);

        if (morphing) {
          progress += (1 - progress) * ease * 1.4;
          if (progress > 0.999) { progress = 1; morphing = false; }
        }

        for (const d of dots) {
          d.size = d.sizeA + (d.sizeB - d.sizeA) * progress;
          d.c[0] = d.ca[0] + (d.cb[0] - d.ca[0]) * progress;
          d.c[1] = d.ca[1] + (d.cb[1] - d.ca[1]) * progress;
          d.c[2] = d.ca[2] + (d.cb[2] - d.ca[2]) * progress;
          // cursor magnify ripple
          let s = d.size;
          if (!touch && !reduced) {
            const dist = Math.hypot(d.x - pointer.x, d.y - pointer.y);
            if (dist < 110) s *= 1 + (1 - dist / 110) ** 2 * 1.6;
          }
          if (s < 0.35) continue;
          ctx.beginPath();
          ctx.arc(d.x, d.y, s / 2, 0, Math.PI * 2);
          ctx.fillStyle = `rgb(${d.c[0] | 0},${d.c[1] | 0},${d.c[2] | 0})`;
          ctx.fill();
        }
      };
      raf = requestAnimationFrame(loop);

      timer = window.setInterval(() => {
        if (fields.length < 2) return;
        idxA = idxB;
        idxB = (idxB + 1) % fields.length;
        // rebuild targets without reallocating dot grid
        const fa = fields[idxA], fb = fields[idxB];
        for (const d of dots) {
          const ia = (Math.min(fa.h - 1, Math.floor((d.y / canvas.getBoundingClientRect().height) * fa.h)) * fa.w +
            Math.min(fa.w - 1, Math.floor((d.x / canvas.getBoundingClientRect().width) * fa.w))) * 4;
          const ib = (Math.min(fb.h - 1, Math.floor((d.y / canvas.getBoundingClientRect().height) * fb.h)) * fb.w +
            Math.min(fb.w - 1, Math.floor((d.x / canvas.getBoundingClientRect().width) * fb.w))) * 4;
          const la = (fa.data[ia] + fa.data[ia + 1] + fa.data[ia + 2]) / 765;
          const lb = (fb.data[ib] + fb.data[ib + 1] + fb.data[ib + 2]) / 765;
          d.sizeA = d.sizeB; d.sizeB = lb * spacing * 1.15;
          d.ca = [...d.cb] as [number, number, number];
          d.cb = [fb.data[ib], fb.data[ib + 1], fb.data[ib + 2]];
          void la;
        }
        progress = 0;
        morphing = true;
      }, intervalMs);
    };

    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = e.clientX - rect.left;
      pointer.y = e.clientY - rect.top;
    };

    canvas.addEventListener('pointermove', onMove);
    const ro = new ResizeObserver(() => {
      if (fields.length >= 2) { idxA = 0; idxB = 1; progress = 1; morphing = false; buildDots(); }
    });
    ro.observe(canvas);

    return () => {
      destroyed = true;
      cancelAnimationFrame(raf);
      clearInterval(timer);
      ro.disconnect();
      canvas.removeEventListener('pointermove', onMove);
    };
  }, [images, dotSpacing, intervalMs, reduced, touch]);

  return (
    <canvas
      ref={canvasRef}
      role="img"
      aria-label="Halftone particle matrix morphing between identity glyphs"
      className={`w-full h-full ${className}`}
    />
  );
}
