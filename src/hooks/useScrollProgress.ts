import { useEffect, useState } from 'react';

/** Returns 0..1 progress of an element through the viewport (for parallax). */
export function useScrollProgress<T extends HTMLElement>() {
  const [progress, setProgress] = useState(0);
  const ref = { current: null as T | null };
  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const el = ref.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        const p = 1 - (r.top + r.height / 2) / (window.innerHeight + r.height / 2);
        setProgress(Math.min(1, Math.max(0, p)));
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);
  return { ref, progress };
}
