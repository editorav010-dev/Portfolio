import { FormEvent, useEffect, useRef, useState } from 'react';
import GlitchText from '../reactbits/GlitchText';
import SplitText from '../reactbits/SplitText';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const LIMITS = { name: 80, email: 120, subject: 140, message: 5000 };

type Status = 'idle' | 'sending' | 'sent' | 'error';

interface FieldErrors { name?: string; email?: string; subject?: string; message?: string; }

export default function Contact() {
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<Status>('idle');
  const [serverMsg, setServerMsg] = useState('');
  const [formKey, setFormKey] = useState(0); // remount to clear after success
  const submittingRef = useRef(false);

  useEffect(() => {
    if (status !== 'sent') return;
    const t = setTimeout(() => setStatus('idle'), 9000);
    return () => clearTimeout(t);
  }, [status]);

  const validate = (data: Record<string, string>): FieldErrors => {
    const e: FieldErrors = {};
    if (!data.name.trim()) e.name = 'Your name is required.';
    else if (data.name.length > LIMITS.name) e.name = `Keep it under ${LIMITS.name} characters.`;
    if (!data.email.trim()) e.email = 'An email address is required so I can reply.';
    else if (!EMAIL_RE.test(data.email.trim())) e.email = 'That email address doesn\u2019t look valid.';
    else if (data.email.length > LIMITS.email) e.email = 'Email is too long.';
    if (!data.subject.trim()) e.subject = 'Give your transmission a title.';
    else if (data.subject.length > LIMITS.subject) e.subject = `Max ${LIMITS.subject} characters.`;
    if (!data.message.trim()) e.message = 'The message body is empty.';
    else if (data.message.length < 10) e.message = 'A few more words, please (min 10 characters).';
    else if (data.message.length > LIMITS.message) e.message = `Message exceeds ${LIMITS.message} characters.`;
    return e;
  };

  const onSubmit = async (ev: FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    if (submittingRef.current || status === 'sending') return; // guard duplicates
    const form = ev.currentTarget;
    const fd = new FormData(form);
    const data = {
      name: String(fd.get('name') ?? ''),
      email: String(fd.get('email') ?? ''),
      subject: String(fd.get('subject') ?? ''),
      message: String(fd.get('message') ?? ''),
      website: String(fd.get('website') ?? ''),   // honeypot
    };

    // honeypot filled → silently "succeed" without sending (bot trap)
    if (data.website) {
      form.reset();
      setStatus('sent');
      return;
    }

    const errs = validate(data);
    setErrors(errs);
    if (Object.keys(errs).length) return;

    submittingRef.current = true;
    setStatus('sending');
    setServerMsg('');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: data.name, email: data.email, subject: data.subject, message: data.message }),
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok && json.ok) {
        setStatus('sent');
        form.reset();
        setFormKey((k) => k + 1);
      } else {
        setStatus('error');
        setServerMsg(json.error || 'Transmission failed. Please try again or email directly.');
      }
    } catch {
      setStatus('error');
      setServerMsg('Network error — the void swallowed the signal. Try again.');
    } finally {
      submittingRef.current = false;
    }
  };

  const inputCls = (err?: string) =>
    `peer w-full rounded-lg border bg-void-900/70 px-4 pb-3 pt-6 text-sm md:text-base text-zinc-100 placeholder-transparent outline-none transition-all duration-300 focus:border-neon-cyan focus:shadow-neon-cyan ${
      err ? 'border-neon-magenta/70' : 'border-white/10 hover:border-white/25'
    }`;
  const labelCls = (err?: string) =>
    `pointer-events-none absolute left-4 top-4 origin-left text-sm text-zinc-500 transition-all duration-200 peer-focus:top-1.5 peer-focus:text-[10px] peer-focus:tracking-[0.25em] peer-focus:uppercase ${
      err ? 'peer-focus:text-neon-cyan text-neon-magenta' : 'peer-focus:text-neon-cyan'
    } peer-[&:not(:placeholder-shown)]:top-1.5 peer-[&:not(:placeholder-shown)]:text-[10px] peer-[&:not(:placeholder-shown)]:tracking-[0.25em] peer-[&:not(:placeholder-shown)]:uppercase`;

  return (
    <section id="contact" className="relative py-24 md:py-32">
      <div className="mx-auto max-w-3xl px-5">
        <p className="font-mono text-xs uppercase tracking-[0.35em] text-neon-lime">// open_frequency</p>
        <h2 className="mt-4 font-display font-black uppercase text-[clamp(1.8rem,4.5vw,3rem)] text-white">
          <GlitchText text="Send a transmission" speed={0.3} />
        </h2>
        <SplitText
          as="p"
          text="Before the portfolio launches, this channel is direct — your message arrives at anmolverma.env@gmail.com via Resend."
          className="mt-4 text-zinc-400 max-w-xl"
          delayMs={28}
        />

        <form key={formKey} onSubmit={onSubmit} noValidate className="relative mt-10 rounded-2xl border border-white/10 bg-void-800/60 p-6 md:p-9 backdrop-blur-sm overflow-hidden">
          {/* scanline ambience */}
          <span aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-neon-cyan/[0.06] to-transparent animate-scanline" />

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="relative">
              <input id="c-name" name="name" type="text" placeholder="Name" maxLength={LIMITS.name + 20} autoComplete="name" className={inputCls(errors.name)} aria-invalid={!!errors.name} aria-describedby={errors.name ? 'err-name' : undefined} />
              <label htmlFor="c-name" className={labelCls(errors.name)}>Your name</label>
              {errors.name && <p id="err-name" role="alert" className="mt-1.5 font-mono text-[11px] text-neon-magenta">{errors.name}</p>}
            </div>
            <div className="relative">
              <input id="c-email" name="email" type="email" placeholder="Email" maxLength={LIMITS.email + 20} autoComplete="email" className={inputCls(errors.email)} aria-invalid={!!errors.email} aria-describedby={errors.email ? 'err-email' : undefined} />
              <label htmlFor="c-email" className={labelCls(errors.email)}>Email address</label>
              {errors.email && <p id="err-email" role="alert" className="mt-1.5 font-mono text-[11px] text-neon-magenta">{errors.email}</p>}
            </div>
          </div>

          <div className="relative mt-5">
            <input id="c-subject" name="subject" type="text" placeholder="Subject" maxLength={LIMITS.subject + 20} className={inputCls(errors.subject)} aria-invalid={!!errors.subject} aria-describedby={errors.subject ? 'err-subject' : undefined} />
            <label htmlFor="c-subject" className={labelCls(errors.subject)}>Transmission title</label>
            {errors.subject && <p id="err-subject" role="alert" className="mt-1.5 font-mono text-[11px] text-neon-magenta">{errors.subject}</p>}
          </div>

          <div className="relative mt-5">
            <textarea id="c-message" name="message" rows={5} placeholder="Message" maxLength={LIMITS.message + 200} className={`${inputCls(errors.message)} resize-y`} aria-invalid={!!errors.message} aria-describedby={errors.message ? 'err-message' : undefined} />
            <label htmlFor="c-message" className={labelCls(errors.message)}>Your message</label>
            {errors.message && <p id="err-message" role="alert" className="mt-1.5 font-mono text-[11px] text-neon-magenta">{errors.message}</p>}
          </div>

          {/* honeypot — hidden from humans, bots fill it */}
          <input
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            className="absolute -left-[9999px] h-0 w-0 opacity-0"
          />

          <div className="mt-7 flex flex-col md:flex-row md:items-center gap-4">
            <button
              type="submit"
              disabled={status === 'sending'}
              className="group relative inline-flex items-center justify-center gap-3 overflow-hidden rounded-full bg-gradient-to-r from-neon-cyan via-neon-violet to-neon-magenta px-8 py-3.5 font-display text-sm font-bold uppercase tracking-widest text-void transition-transform duration-300 hover:scale-[1.03] active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
            >
              <span className="absolute inset-0 bg-white/0 transition-colors duration-300 group-hover:bg-white/15" aria-hidden />
              <span className="relative">
                {status === 'sending' ? 'Transmitting…' : status === 'sent' ? 'Signal received ✓' : 'Send transmission'}
              </span>
              {status === 'sending' && (
                <span aria-hidden className="relative h-4 w-4 animate-spin rounded-full border-2 border-void/30 border-t-void" />
              )}
            </button>

            <a
              href="mailto:anmolverma.env@gmail.com"
              className="font-mono text-xs uppercase tracking-[0.25em] text-zinc-500 underline-offset-4 transition-colors duration-300 hover:text-neon-cyan hover:underline"
            >
              or write directly ↓
            </a>
          </div>

          {/* status region for screen readers + visible feedback */}
          <div aria-live="polite" className="mt-5 min-h-[1.5rem]">
            {status === 'sent' && (
              <p className="rounded-lg border border-neon-lime/40 bg-neon-lime/5 px-4 py-3 font-mono text-xs md:text-sm text-neon-lime">
                ✓ Transmission delivered. Your message reached Anmol&rsquo;s inbox via Resend. Response expected soon.
              </p>
            )}
            {status === 'error' && (
              <p className="rounded-lg border border-neon-magenta/40 bg-neon-magenta/5 px-4 py-3 font-mono text-xs md:text-sm text-neon-magenta">
                ✕ {serverMsg}
              </p>
            )}
          </div>
        </form>
      </div>
    </section>
  );
}
