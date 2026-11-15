const mailbox = /^[^\s@,;<>]+@[^\s@,;<>]+$/;
const idPattern = /^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i;

export function supportMailConfig() {
  const { RESEND_API_KEY: incomingKey, RESEND_SEND_API_KEY: sendKey, RESEND_WEBHOOK_SECRET: webhook,
    SUPPORT_INBOUND_ADDRESS: inbound, SUPPORT_FROM_ADDRESS: from, SUPPORT_REPLY_TO_ADDRESS: replyTo } = process.env;
  return { key: sendKey || incomingKey, from, replyTo,
    inbound: Boolean(incomingKey && webhook && inbound),
    outbound: Boolean((sendKey || incomingKey) && from && replyTo && mailbox.test(from) && mailbox.test(replyTo)) };
}

export async function sendSupportReply(db, staff, body, config) {
  if (!idPattern.test(body.requestId) || !idPattern.test(body.id) ||
      typeof body.message !== 'string' || !body.message.trim() || body.message.length > 4000) {
    return { error: 'Enter a reply of up to 4,000 characters.', status: 400 };
  }
  const ids = { p_actor: staff.id, p_case: body.id, p_id: body.requestId };
  const prepared = await db.rpc('dashboard_prepare_reply', {
    ...ids, p_body: body.message.trim(), p_from: 'LinQ Support <' + config.from + '>', p_reply_to: config.replyTo,
  });
  if (prepared.error) throw prepared.error;
  if (prepared.data.provider_id) return { sent: true };

  let response;
  try {
    response = await fetch('https://api.resend.com/emails', {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + config.key,
        'Idempotency-Key': 'support-reply/' + body.requestId },
      body: JSON.stringify(prepared.data.envelope), signal: AbortSignal.timeout(8000),
    });
  } catch {
    return { error: 'The email provider did not confirm the send. Retry this same reply to check the result.', status: 503 };
  }
  if (!response.ok) {
    if ([400, 401, 403, 422, 429].includes(response.status)) {
      const released = await db.rpc('dashboard_discard_rejected_reply', ids);
      if (released.error) throw released.error;
      return { error: 'Resend rejected the reply. Check your email setup or try again later.', status: 502 };
    }
    return { error: 'The email provider did not confirm the send. Retry this same reply to check the result.', status: 503 };
  }
  const result = await response.json().catch(() => null);
  if (!idPattern.test(result?.id)) return { error: 'Resend returned no confirmation. Retry this same reply.', status: 503 };
  const recorded = await db.rpc('dashboard_finish_reply', { ...ids, p_provider: result.id });
  if (recorded.error) {
    console.error('Support reply confirmation failed', recorded.error.code);
    return { error: 'Resend accepted the email. Retry this same reply to finish recording it.', status: 503 };
  }
  return { sent: true };
}
