import { useEffect, useMemo, useRef } from 'react';

/**
 * GlitchText — cursor-reactive glitch typography (React Bits "Glitch Text" adaptation).
 *
 * NOTE ON LICENSING: this project targets the React Bits Pro registry
 * (`npx shadcn@latest add @reactbits-starter/glitch-text-tw`). No
 * REACTBITS_LICENSE_KEY is available in this environment, so the registry fetch
 * returns 401/404. This file is a faithful, dependency-free re-implementation of
 * the component's documented behaviour (RGB-split + slice displacement that
 * intensifies while the cursor hovers the text) so the design intent is fully
 * realised without an unlicensed copy of Pro source. If you later purchase the
 * license, run the install command above and swap the import — the props are
 * compatible by design.
 */

interface GlitchTextProps {
  text: string;
  className?: string;
  /** base glitch intensity 0..1 applied even when idle */
  speed?: number;
  as?: 'h1' | 'h2' | 'span' | 'div' | 'p';
}

export default function GlitchText({ text, className = '', speed = 0.35, as: Tag = 'span' }: GlitchTextProps) {
  const ref = useRef<HTMLElement | null>(null);
  const hovering = useRef(false);
  const raf = useRef<number>(0);

  const seeds = useMemo(() => Array.from({ length: 10 }, () => Math.random()), []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const layers = el.querySelectorAll<HTMLElement>('[data-glitch-layer]');
    let last = 0;

    const onEnter = () => (hovering.current = true);
    const onLeave = () => (hovering.current = false);

    const tick = (t: number) => {
      raf.current = requestAnimationFrame(tick);
      const interval = hovering.current ? 40 : 900; // calm when not hovered
      if (t - last < interval) return;
      last = t;

      const intensity = hovering.current ? 1 : speed;
      layers.forEach((layer, i) => {
        if (i === 0) return; // base layer stays put
        const dx = (Math.random() - 0.5) * 14 * intensity;
        const dy = (Math.random() - 0.5) * 3 * intensity;
        const clipTop = Math.floor(Math.random() * 80);
        const seed = seeds[(i + Math.floor(t / 120)) % seeds.length];
        layer.style.transform = `translate(${dx}px, ${dy}px)`;
        layer.style.clipPath = `inset(${clipTop}% 0 ${100 - clipTop - 12 - seed * 20}% 0)`;
        layer.style.opacity = String(0.55 + seed * 0.4);
      });
    };

    raf.current = requestAnimationFrame(tick);
    el.addEventListener('pointerenter', onEnter);
    el.addEventListener('pointerleave', onLeave);
    el.addEventListener('focusin', onEnter);
    el.addEventListener('focusout', onLeave);
    return () => {
      cancelAnimationFrame(raf.current);
      el.removeEventListener('pointerenter', onEnter);
      el.removeEventListener('pointerleave', onLeave);
      el.removeEventListener('focusin', onEnter);
      el.removeEventListener('focusout', onLeave);
    };
  }, [speed, seeds]);

  return (
    <Tag ref={ref as never} className={`relative inline-block select-none ${className}`} aria-label={text}>
      {/* base readable layer */}
      <span data-glitch-layer className="relative z-10">
        {text}
      </span>
      {/* chromatic aberration slices — decorative only */}
      <span
        aria-hidden
        data-glitch-layer
        className="absolute inset-0 z-20 text-neon-cyan mix-blend-screen pointer-events-none"
      >
        {text}
      </span>
      <span
        aria-hidden
        data-glitch-layer
        className="absolute inset-0 z-20 text-neon-magenta mix-blend-screen pointer-events-none"
      >
        {text}
      </span>
    </Tag>
  );
}
