import { Webhook } from 'svix';
import { database, json, unwrap } from '../server/admin.js';

const mailbox = value => (String(value).match(/<([^<>]+)>/)?.[1] || String(value)).trim().toLowerCase();
const header = (headers, name) => Object.entries(headers || {})
  .find(([key]) => key.toLowerCase() === name)?.[1];
const ids = value => String(value || '').match(/<[^<>\s]+>/g) || [];
const messageId = value => {
  const raw = String(value || '').trim();
  return ids(raw)[0] || (/^[^<>\s]+@[^<>\s]+$/.test(raw) ? '<' + raw + '>' : null);
};

export default {
  async fetch(request) {
    if (request.method !== 'POST') return json({ error: 'Method unavailable.' }, 405);
    const { RESEND_WEBHOOK_SECRET: secret, RESEND_API_KEY: key, SUPPORT_INBOUND_ADDRESS: address } = process.env;
    if (!secret || !key || !address) return json({ error: 'Inbox is not connected.' }, 503);
    let event;
    try {
      const raw = await request.text();
      if (raw.length > 250_000) return json({ error: 'Webhook too large.' }, 413);
      event = new Webhook(secret).verify(raw, {
        'svix-id': request.headers.get('svix-id'),
        'svix-timestamp': request.headers.get('svix-timestamp'),
        'svix-signature': request.headers.get('svix-signature'),
      });
    } catch {
      return json({ error: 'Invalid webhook signature.' }, 401);
    }
    if (event.type !== 'email.received') return json({ received: true });
    const id = event.data?.email_id;
    if (typeof id !== 'string' || !/^[\da-f-]{36}$/i.test(id)) return json({ error: 'Invalid email ID.' }, 400);
    try {
      const response = await fetch('https://api.resend.com/emails/receiving/' + id, {
        headers: { Authorization: 'Bearer ' + key }, signal: AbortSignal.timeout(8000),
      });
      if (!response.ok) throw new Error('Provider lookup failed');
      const email = await response.json();
      if (!Array.isArray(email.to) || !email.to.some(to => mailbox(to) === mailbox(address))) return json({ received: true });
      const sender = mailbox(email.from || '');
      if (!/^[^\s@]+@[^\s@]+$/.test(sender) || sender.length > 320) return json({ error: 'Invalid sender.' }, 400);
      const references = [...ids(header(email.headers, 'in-reply-to')), ...ids(header(email.headers, 'references'))];
      const date = new Date(email.created_at || event.created_at);
      unwrap(await database().rpc('dashboard_record_inbound', {
        p_provider_id: id,
        p_message_id: messageId(email.message_id || header(email.headers, 'message-id'))?.slice(0, 998) || null,
        p_references: references.slice(-30).map(value => value.slice(0, 998)),
        p_from: sender,
        p_subject: String(email.subject || '(No subject)').slice(0, 400),
        p_body: String(email.text || 'This message has no plain-text body. View the original in the inbox.').slice(0, 20000),
        p_received: Number.isFinite(date.getTime()) ? date.toISOString() : new Date().toISOString(),
      }));
      return json({ received: true });
    } catch (error) {
      console.error('Support intake failed', error.code || error.name);
      return json({ error: 'Could not record this email.' }, 503);
    }
  },
};
