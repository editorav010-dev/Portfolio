import { useEffect, useState } from 'react';

/** Fixed nav + status ticker marquee + footer. */

const LINKS = [
  { href: '#status', label: 'Status' },
  { href: '#social', label: 'Channels' },
  { href: '#contact', label: 'Contact' },
];

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${scrolled ? 'backdrop-blur-md bg-void/70 border-b border-white/5' : ''}`}>
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4" aria-label="Primary">
        <a href="#top" className="group font-display text-sm font-black uppercase tracking-[0.3em] text-white transition-colors hover:text-neon-cyan">
          Anmol<span className="text-neon-magenta transition-transform duration-300 group-hover:inline-block group-hover:-translate-y-0.5">·</span>Verma
        </a>
        <div className="hidden sm:flex items-center gap-7">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} className="relative font-mono text-xs uppercase tracking-[0.25em] text-zinc-400 transition-colors duration-300 hover:text-white after:absolute after:-bottom-1 after:left-0 after:h-px after:w-0 after:bg-neon-cyan after:transition-all after:duration-300 hover:after:w-full">
              {l.label}
            </a>
          ))}
        </div>
        <a href="#contact" className="sm:hidden font-mono text-xs uppercase tracking-[0.25em] text-neon-cyan">Contact</a>
      </nav>
    </header>
  );
}

export function Ticker() {
  const items = ['COMING SOON', 'STAY TUNED', 'UNDER CONSTRUCTION', 'ANMOL VERMA', 'PORTFOLIO v0.9', 'THE VOID IS OPEN'];
  const row = [...items, ...items];
  return (
    <div aria-hidden className="relative overflow-hidden border-y border-white/5 bg-void-900/60 py-3">
      <div className="flex w-max animate-marquee gap-10 whitespace-nowrap will-change-transform hover:[animation-play-state:paused]">
        {row.concat(row).map((t, i) => (
          <span key={i} className={`font-display text-xs md:text-sm font-bold uppercase tracking-[0.35em] ${i % 3 === 0 ? 'text-neon-cyan/80' : i % 3 === 1 ? 'text-neon-magenta/80' : 'text-zinc-500'}`}>
            {t} <span className="text-neon-lime/60 mx-2">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}

export function Footer() {
  return (
    <footer className="relative mt-8 border-t border-white/5 py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-5 px-5 text-center">
        <p className="font-display text-lg font-black uppercase tracking-[0.2em] text-white">
          ANMOL <span className="text-neon-cyan text-glow-cyan">VERMA</span>
        </p>
        <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-zinc-500">
          b. 29 · 06 · 2008 — Shahjahanpur, Uttar Pradesh, India
        </p>
        <a href="mailto:anmolverma.env@gmail.com" className="font-mono text-xs text-zinc-400 underline-offset-4 transition-colors hover:text-neon-lime hover:underline">
          anmolverma.env@gmail.com
        </a>
        <div className="hairline w-full max-w-md" />
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-zinc-600">
          © {new Date().getFullYear()} Anmol Verma — pre-launch signal. Full portfolio loading…
        </p>
      </div>
    </footer>
  );
}
