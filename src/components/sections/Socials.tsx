import { useRef, useState } from 'react';
import SplitText from '../reactbits/SplitText';

/** Custom neon "channel" cards with 3D tilt, animated conic border and glitch hover. */

interface Channel {
  name: string;
  handle: string;
  url: string;
  accent: string;      // hex
  icon: JSX.Element;
}

const XIcon = (
  <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor" aria-hidden><path d="M18.9 1.2h3.7l-8.2 9.4L24 22.8h-7.5l-5.9-7.6-6.7 7.6H.1l8.7-10L0 1.2h7.7l5.3 7 5.9-7Zm-1.3 19.3h2L6.5 3.3h-2.2l11.1 17.2Z"/></svg>
);
const GitIcon = (
  <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor" aria-hidden><path d="M12 .5A11.5 11.5 0 0 0 .5 12a11.5 11.5 0 0 0 7.9 10.9c.6.1.8-.2.8-.6v-2c-3.2.7-3.9-1.4-3.9-1.4-.5-1.3-1.3-1.7-1.3-1.7-1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.7 1.3 3.4 1 .1-.8.4-1.3.7-1.6-2.6-.3-5.3-1.3-5.3-5.7 0-1.3.5-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.2 1.2a11 11 0 0 1 5.8 0C17.3 4.9 18.3 5.2 18.3 5.2c.6 1.6.2 2.8.1 3.1.8.8 1.2 1.8 1.2 3.1 0 4.4-2.7 5.4-5.3 5.7.4.4.8 1.1.8 2.2v3.2c0 .4.2.7.8.6A11.5 11.5 0 0 0 23.5 12 11.5 11.5 0 0 0 12 .5Z"/></svg>
);
const InIcon = (
  <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor" aria-hidden><path d="M4.98 3.5A2.5 2.5 0 1 1 0 3.5a2.5 2.5 0 0 1 4.98 0ZM.4 8.6h4.6V24H.4V8.6Zm7.6 0h4.4v2.1h.1c.6-1.2 2.1-2.4 4.3-2.4 4.6 0 5.5 3 5.5 7V24h-4.6v-6.9c0-1.7 0-3.8-2.3-3.8s-2.7 1.8-2.7 3.7V24H8V8.6Z"/></svg>
);
const IgIcon = (
  <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor" aria-hidden><path d="M12 2.2c3.2 0 3.6 0 4.9.1 1.2.1 1.8.2 2.2.4.6.2 1 .5 1.4.9.4.4.7.8.9 1.4.2.4.4 1 .4 2.2.1 1.3.1 1.7.1 4.9s0 3.6-.1 4.9c0 1.2-.2 1.8-.4 2.2-.2.6-.5 1-.9 1.4-.4.4-.8.7-1.4.9-.4.2-1 .4-2.2.4-1.3.1-1.7.1-4.9.1s-3.6 0-4.9-.1c-1.2 0-1.8-.2-2.2-.4-.6-.2-1-.5-1.4-.9-.4-.4-.7-.8-.9-1.4-.2-.4-.4-1-.4-2.2C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.9c0-1.2.2-1.8.4-2.2.2-.6.5-1 .9-1.4.4-.4.8-.7 1.4-.9.4-.2 1-.4 2.2-.4C8.4 2.2 8.8 2.2 12 2.2Zm0 1.8c-3.1 0-3.5 0-4.7.1-1.1 0-1.7.2-2.1.4-.5.2-.9.4-1.2.8-.4.3-.6.7-.8 1.2-.2.4-.3 1-.4 2.1 0 1.2-.1 1.6-.1 4.7s0 3.5.1 4.7c0 1.1.2 1.7.4 2.1.2.5.4.9.8 1.2.3.4.7.6 1.2.8.4.2 1 .3 2.1.4 1.2 0 1.6.1 4.7.1s3.5 0 4.7-.1c1.1 0 1.7-.2 2.1-.4.5-.2.9-.4 1.2-.8.4-.3.6-.7.8-1.2.2-.4.3-1 .4-2.1 0-1.2.1-1.6.1-4.7s0-3.5-.1-4.7c0-1.1-.2-1.7-.4-2.1-.2-.5-.4-.9-.8-1.2a3 3 0 0 0-1.2-.8c-.4-.2-1-.3-2.1-.4-1.2 0-1.6-.1-4.7-.1Zm0 3a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 8.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4Zm6.4-8.4a1.2 1.2 0 1 1-2.4 0 1.2 1.2 0 0 1 2.4 0Z"/></svg>
);

const CHANNELS: Channel[] = [
  { name: 'X / Twitter', handle: '@anmol_dev_010', url: 'https://x.com/anmol_dev_010', accent: '#22f7e6', icon: XIcon },
  { name: 'GitHub', handle: 'editorav010-dev', url: 'https://github.com/editorav010-dev', accent: '#c8f31d', icon: GitIcon },
  { name: 'LinkedIn', handle: 'anmol-verma', url: 'https://www.linkedin.com/in/anmol-verma-4aa7b3391/', accent: '#8b5cf6', icon: InIcon },
  { name: 'Instagram', handle: '@the_obscure.horizon', url: 'https://www.instagram.com/the_obscure.horizon/', accent: '#ff2ea6', icon: IgIcon },
];

function TiltCard({ c }: { c: Channel }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });

  const onMove = (e: React.PointerEvent) => {
    const el = ref.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    setTilt({ rx: -py * 10, ry: px * 12 });
    el.style.setProperty('--mx', `${(px + 0.5) * 100}%`);
    el.style.setProperty('--my', `${(py + 0.5) * 100}%`);
  };

  return (
    <a
      ref={ref}
      href={c.url}
      target="_blank"
      rel="noopener noreferrer"
      onPointerMove={onMove}
      onPointerLeave={() => setTilt({ rx: 0, ry: 0 })}
      className="group relative block rounded-2xl p-[1px] transition-transform duration-200 will-change-transform hover:-translate-y-1 active:scale-[0.98]"
      style={{ transform: `perspective(700px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)` }}
      aria-label={`${c.name} — ${c.handle} (opens in a new tab)`}
    >
      {/* animated conic glow border */}
      <span
        aria-hidden
        className="absolute inset-0 rounded-2xl opacity-40 blur-[6px] transition-opacity duration-500 group-hover:opacity-100 group-focus-visible:opacity-100"
        style={{ background: `conic-gradient(from var(--angle,0deg), transparent 40%, ${c.accent}, transparent 60%)`, animation: 'spinAngle 4s linear infinite' }}
      />
      <span className="relative flex items-center gap-4 rounded-2xl bg-void-900/95 px-5 py-5 md:px-6">
        <span
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border transition-all duration-300 group-hover:scale-110 group-hover:rotate-[-6deg]"
          style={{ borderColor: `${c.accent}66`, color: c.accent, boxShadow: `inset 0 0 18px ${c.accent}22` }}
        >
          {c.icon}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-display text-sm md:text-base font-bold uppercase tracking-wide text-white transition-colors duration-300" style={{ }}>
            {c.name}
          </span>
          <span className="mt-0.5 block truncate font-mono text-xs text-zinc-500 transition-colors duration-300 group-hover:text-zinc-300">
            {c.handle}
          </span>
        </span>
        <span
          aria-hidden
          className="ml-auto translate-x-0 text-lg transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1"
          style={{ color: c.accent }}
        >
          ↗
        </span>
        {/* cursor spotlight */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{ background: `radial-gradient(240px circle at var(--mx,50%) var(--my,50%), ${c.accent}14, transparent 65%)` }}
        />
      </span>
    </a>
  );
}

export default function Socials() {
  return (
    <section id="social" className="relative py-24 md:py-32">
      <div className="mx-auto max-w-5xl px-5">
        <p className="font-mono text-xs uppercase tracking-[0.35em] text-neon-cyan">// open_channels</p>
        <SplitText
          as="h2"
          text="Find me in the wild"
          className="mt-4 font-display font-black uppercase text-[clamp(1.8rem,4.5vw,3rem)] text-white"
          delayMs={70}
        />
        <p className="mt-4 max-w-xl text-zinc-400">
          The full portfolio is loading — but the channels are live now. Every link opens in a new tab.
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {CHANNELS.map((c) => (
            <TiltCard key={c.name} c={c} />
          ))}
        </div>
      </div>

      <style>{`
        @property --angle { syntax: '<angle>'; initial-value: 0deg; inherits: false; }
        @keyframes spinAngle { to { --angle: 360deg; } }
        @media (prefers-reduced-motion: reduce) { [style*="spinAngle"] { animation: none !important; } }
      `}</style>
    </section>
  );
}
