import { useEffect, useRef, useState } from 'react';

/**
 * SplitText — word-by-word masked entrance animation triggered when the element
 * scrolls into view (React Bits "Split Text" adaptation; CSS-only, no deps).
 */

interface Props {
  text: string;
  className?: string;
  wordClassName?: string;
  delayMs?: number;
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'div';
}

export default function SplitText({ text, className = '', wordClassName = '', delayMs = 60, as: Tag = 'div' }: Props) {
  const ref = useRef<HTMLElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setShown(true); return; }
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setShown(true); io.disconnect(); } },
      { threshold: 0.25 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const words = text.split(' ');
  return (
    <Tag ref={ref as never} className={className}>
      {words.map((word, i) => (
        <span key={i} className="inline-block overflow-hidden align-bottom mr-[0.28em]">
          <span
            className={`inline-block will-change-transform transition-transform duration-700 ease-[cubic-bezier(.2,.7,.2,1)] ${wordClassName} ${
              shown ? 'translate-y-0' : 'translate-y-full'
            }`}
            style={{ transitionDelay: `${i * delayMs}ms` }}
          >
            {word}
          </span>
        </span>
      ))}
    </Tag>
  );
}
