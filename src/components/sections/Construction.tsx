import ParticleMorph from '../reactbits/ParticleMorph';
import ParticleText from '../reactbits/ParticleText';
import SplitText from '../reactbits/SplitText';
import GlitchText from '../reactbits/GlitchText';
import { useInView } from '../../hooks/useInView';

const STATS = [
  { k: 'Identity', v: 'Anmol Verma' },
  { k: 'Born', v: '29 · 06 · 2008' },
  { k: 'Origin', v: 'Shahjahanpur, UP — India' },
  { k: 'Status', v: 'Portfolio under construction' },
];

export default function Construction() {
  const { ref, inView } = useInView<HTMLDivElement>();

  return (
    <section id="status" className="relative py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-5">
        <div className="grid gap-14 lg:grid-cols-[0.9fr_1.1fr] items-center">
          {/* morphing identity sigil */}
          <div ref={ref} className={`relative aspect-square w-full max-w-[440px] mx-auto transition-all duration-1000 ${inView ? 'opacity-100 translate-y-0 rotate-0' : 'opacity-0 translate-y-12 rotate-[-2deg]'}`}>
            <div className="absolute inset-0 rounded-3xl border border-neon-violet/25 bg-void-800/40 backdrop-blur-sm" aria-hidden />
            <div className="absolute inset-0 p-6">
              <ParticleMorph images={['/avatar.png', '/sigil.png']} intervalMs={4600} />
            </div>
            <span className="absolute -top-3 left-6 font-mono text-[10px] uppercase tracking-[0.35em] text-neon-violet">identity.sigil</span>
            <span className="absolute bottom-2 right-6 font-mono text-[10px] uppercase tracking-[0.3em] text-zinc-600">morph → avatar ⇄ sigil</span>
          </div>

          <div>
            <p className="font-mono text-xs uppercase tracking-[0.35em] text-neon-magenta">// status_report</p>
            <h2 className="mt-4 font-display font-black uppercase text-[clamp(1.9rem,5vw,3.4rem)] leading-[1.02] text-white">
              <GlitchText text="UNDER" speed={0.3} />{' '}
              <span className="text-glow-magenta text-neon-magenta"><GlitchText text="CONSTRUCTION" speed={0.45} /></span>
            </h2>

            <SplitText
              as="p"
              text="The complete portfolio — projects, case studies and the full body of work — is being assembled now. This page is the deliberate first signal: a temporary monument before the launch."
              className="mt-6 max-w-lg text-zinc-400 leading-relaxed"
              delayMs={28}
            />

            <dl className="mt-9 grid grid-cols-1 sm:grid-cols-2 gap-px bg-white/5 border border-white/5 rounded-xl overflow-hidden">
              {STATS.map((s) => (
                <div key={s.k} className="group bg-void-900/80 px-5 py-4 transition-colors duration-300 hover:bg-void-700/80">
                  <dt className="font-mono text-[10px] uppercase tracking-[0.3em] text-zinc-500 group-hover:text-neon-cyan transition-colors">{s.k}</dt>
                  <dd className="mt-1 text-sm md:text-base text-zinc-200 font-medium">{s.v}</dd>
                </div>
              ))}
            </dl>

            {/* STAY TUNED scatter typography */}
            <div className="mt-10 h-24 md:h-28">
              <ParticleText text="STAY TUNED" fontSize={110} />
            </div>
            <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-zinc-600">↑ run your cursor through it</p>
          </div>
        </div>
      </div>
    </section>
  );
}
