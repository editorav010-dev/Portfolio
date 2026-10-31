export interface ContactPayload {
  name: string;
  email: string;
  subject: string;
  message: string;
  website?: string; // honeypot
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function sanitize(s: unknown, max: number): string {
  return String(s ?? '')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .trim()
    .slice(0, max);
}

export function validateContact(body: unknown): { data?: ContactPayload; error?: string } {
  const b = (body ?? {}) as Record<string, unknown>;
  const name = sanitize(b.name, 80);
  const email = sanitize(b.email, 120);
  const subject = sanitize(b.subject, 140);
  const message = sanitize(b.message, 5000);
  const website = typeof b.website === 'string' ? b.website : '';

  if (website) return { error: 'SPAM_DETECTED' };
  if (!name) return { error: 'Name is required.' };
  if (!email) return { error: 'Email is required.' };
  if (!EMAIL_RE.test(email)) return { error: 'Email address is not valid.' };
  if (!subject) return { error: 'Subject is required.' };
  if (!message || message.length < 10) return { error: 'Message is too short.' };
  if (message.length > 5000) return { error: 'Message is too long.' };

  return { data: { name, email, subject, message } };
}
