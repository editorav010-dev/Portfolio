import { useEffect, useState } from 'react';
import GlitchText from '../reactbits/GlitchText';
import ParticleImage from '../reactbits/ParticleImage';
import SplitText from '../reactbits/SplitText';
import { useScrollProgress } from '../../hooks/useScrollProgress';

export default function Hero() {
  const [booted, setBooted] = useState(false);
  const { progress } = useScrollProgress<HTMLDivElement>();

  useEffect(() => {
    const t = setTimeout(() => setBooted(true), 150);
    return () => clearTimeout(t);
  }, []);

  // scroll parallax + dimensional recession of the hero composition
  const style = {
    transform: `translateY(${progress * -80}px) scale(${1 - progress * 0.12})`,
    opacity: Math.max(0, 1 - progress * 1.4),
  } as const;

  return (
    <section id="top" className="relative min-h-[100svh] flex items-center justify-center overflow-hidden">
      {/* oversized ghost type behind everything */}
      <div aria-hidden className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
        <span className="font-display font-black text-[26vw] leading-none tracking-tighter text-white/[0.03] whitespace-nowrap">
          VOID
        </span>
      </div>

      <div style={style} className="relative z-10 mx-auto w-full max-w-6xl px-5 pt-24 pb-16 grid gap-10 lg:grid-cols-[1.15fr_0.85fr] items-center">
        <div>
          <p className={`font-mono text-xs md:text-sm uppercase tracking-[0.35em] text-neon-lime transition-all duration-700 ${booted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            // Personal portfolio · v0.9 pre-release
          </p>

          <h1 className="mt-5 font-display font-black uppercase leading-[0.92] tracking-tight text-[clamp(2.6rem,8vw,6.2rem)]">
            <GlitchText text="COMING" className="text-white block" speed={0.25} />
            <span className="block">
              <GlitchText text="SOON" className="text-glow-cyan text-neon-cyan" speed={0.5} />
            </span>
          </h1>

          <SplitText
            as="p"
            text="Anmol Verma is building something worth the wait. The full portfolio materialises soon — until then, the void is open."
            className="mt-6 max-w-xl text-base md:text-lg text-zinc-400 leading-relaxed"
            wordClassName=""
            delayMs={35}
          />

          <div className={`mt-9 flex flex-wrap items-center gap-4 transition-all duration-1000 delay-500 ${booted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
            <a
              href="#social"
              className="group relative inline-flex items-center gap-3 overflow-hidden rounded-full border border-neon-cyan/60 px-7 py-3 font-mono text-sm uppercase tracking-widest text-neon-cyan transition-transform duration-300 hover:scale-[1.04] active:scale-95"
            >
              <span className="absolute inset-0 -z-0 bg-neon-cyan/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <span className="relative z-10">Explore profiles</span>
              <span aria-hidden className="relative z-10 transition-transform duration-300 group-hover:translate-y-1">↓</span>
            </a>
            <a
              href="#contact"
              className="group relative inline-flex items-center gap-3 rounded-full border border-neon-magenta/60 px-7 py-3 font-mono text-sm uppercase tracking-widest text-neon-magenta transition-transform duration-300 hover:scale-[1.04] active:scale-95"
            >
              <span className="absolute inset-0 bg-neon-magenta/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <span className="relative">Send a transmission</span>
              <span aria-hidden className="relative transition-transform duration-300 group-hover:translate-x-1">→</span>
            </a>
          </div>
        </div>

        {/* particle avatar column */}
        <div className={`relative mx-auto w-full max-w-[380px] aspect-square transition-all duration-1000 delay-300 ${booted ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}>
          <div className="absolute inset-0 rounded-full border border-neon-violet/30 animate-pulse-ring" aria-hidden />
          <div className="absolute inset-4 rounded-full border border-neon-cyan/20" aria-hidden />
          <div className="absolute inset-0 animate-floaty">
            <ParticleImage src="/avatar.png" radius={110} alt="Neon sigil portrait of Anmol Verma rendered as particles" />
          </div>
          <p className="absolute -bottom-2 left-1/2 -translate-x-1/2 font-mono text-[11px] uppercase tracking-[0.3em] text-zinc-500 whitespace-nowrap">
            cursor → disturb the signal
          </p>
        </div>
      </div>

      {/* scroll cue */}
      <div aria-hidden className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-zinc-600">
        <span className="font-mono text-[10px] uppercase tracking-[0.4em]">scroll</span>
        <span className="h-10 w-px bg-gradient-to-b from-neon-cyan/70 to-transparent animate-flicker" />
      </div>
    </section>
  );
}
