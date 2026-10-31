import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Resend } from 'resend';
import { validateContact } from './_lib/validate.js';

/**
 * Server-side contact endpoint → Resend → anmolverma.env@gmail.com
 * Env vars (never exposed to the client):
 *   RESEND_API_KEY       – from https://resend.com/api-keys
 *   RESEND_FROM          – a verified sender on your Resend account, e.g.
 *                          "Portfolio Signal <onboarding@resend.dev>" (test) or
 *                          "Anmol Verma <hello@yourdomain.com>" (verified domain)
 *   CONTACT_TO           – defaults to anmolverma.env@gmail.com
 * Rate limiting: fixed-window in-memory per IP (best-effort on serverless).
 */

const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 3;
const hits = new Map<string, { count: number; reset: number }>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = hits.get(ip);
  if (!entry || now > entry.reset) {
    hits.set(ip, { count: 1, reset: now + WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > MAX_PER_WINDOW;
}

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string));

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed.' });
  }

  const ip = (req.headers['x-forwarded-for']?.toString().split(',')[0] || req.socket.remoteAddress || 'unknown').trim();
  if (rateLimited(ip)) {
    return res.status(429).json({ ok: false, error: 'Too many transmissions — please wait a minute and try again.' });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM;
  const to = process.env.CONTACT_TO || 'anmolverma.env@gmail.com';

  if (!apiKey || !from) {
    console.error('Missing RESEND_API_KEY or RESEND_FROM environment variable');
    return res.status(500).json({ ok: false, error: 'Contact channel is not configured yet. Please try again later.' });
  }

  const { data, error } = validateContact(req.body);
  if (error === 'SPAM_DETECTED') return res.status(200).json({ ok: true }); // fool bots
  if (error) return res.status(400).json({ ok: false, error });

  const d = data!;
  const resend = new Resend(apiKey);

  const html = `
    <div style="font-family:'Space Grotesk',Arial,sans-serif;background:#04030a;color:#e8e6f0;padding:32px;border-radius:12px">
      <p style="color:#22f7e6;font-size:12px;letter-spacing:4px;text-transform:uppercase;margin:0">// transmission from anmolverma-portfolio</p>
      <h2 style="margin:12px 0 24px;color:#fff">${escapeHtml(d.subject)}</h2>
      <table style="border-collapse:collapse;font-size:14px;line-height:1.7">
        <tr><td style="color:#8b8fa8;padding-right:16px">From</td><td style="color:#fff">${escapeHtml(d.name)} &lt;${escapeHtml(d.email)}&gt;</td></tr>
        <tr><td style="color:#8b8fa8;padding-right:16px">Reply-to</td><td style="color:#fff">${escapeHtml(d.email)}</td></tr>
      </table>
      <div style="margin-top:24px;padding:20px;background:#0b0a16;border-left:3px solid #ff2ea6;border-radius:6px;white-space:pre-wrap">${escapeHtml(d.message)}</div>
      <p style="margin-top:24px;color:#5b5f75;font-size:11px">Sent via the Anmol Verma portfolio contact form · ${new Date().toISOString()}</p>
    </div>`;

  try {
    const { id, error: resendError } = await resend.emails.send({
      from,
      to,
      replyTo: d.email,
      subject: `[Portfolio] ${d.subject}`,
      text: `From: ${d.name} <${d.email}>\nSubject: ${d.subject}\n\n${d.message}`,
      html,
    });
    if (resendError) {
      console.error('Resend error:', resendError);
      return res.status(502).json({ ok: false, error: 'The mail relay rejected the transmission. Please try again later.' });
    }
    return res.status(200).json({ ok: true, id });
  } catch (e) {
    console.error('Resend exception:', e);
    return res.status(502).json({ ok: false, error: 'Delivery failed on our side. Please try again or email directly.' });
  }
}
