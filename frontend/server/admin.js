import { createClient } from '@supabase/supabase-js';
import { sendSupportReply, supportMailConfig } from './support-reply.js';

const statuses = {
  reports: ['pending', 'under_review', 'resolved', 'dismissed'],
  support: ['new', 'awaiting_staff', 'awaiting_customer', 'closed'],
};
const categories = ['general', 'account', 'sync', 'billing', 'bug', 'other'];
const permissions = {
  overview: ['admin', 'analyst', 'support', 'moderator'],
  reports: ['admin', 'moderator'],
  bookmarks: ['admin', 'analyst'],
  spaces: ['admin', 'analyst'],
  appstore: ['admin', 'analyst'],
  support: ['admin', 'support'],
};
const uuid = /^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i;

export const json = (data, status = 200) => Response.json(data, {
  status, headers: { 'Cache-Control': 'private, no-store' },
});

function supabaseUrl() {
  return process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
}

export function database() {
  const url = supabaseUrl();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Missing server database configuration');
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

export function unwrap(result) {
  if (result.error) throw result.error;
  return result.data;
}

async function identify(request, db) {
  const token = request.headers.get('authorization')?.match(/^Bearer ([\w.-]+)$/i)?.[1];
  if (!token || token.length > 8192) return { error: json({ error: 'Sign in to continue.' }, 401) };
  const key = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  if (!key) throw new Error('Missing public authentication key');
  const auth = createClient(supabaseUrl(), key, { auth: { persistSession: false, autoRefreshToken: false } });
  const result = await auth.auth.getUser(token);
  const user = result.data?.user;
  if (result.error || !user || user.is_anonymous) return { error: json({ error: 'Your session has expired.' }, 401) };
  const staff = unwrap(await db.from('dashboard_staff').select('role').eq('user_id', user.id).maybeSingle());
  if (!staff) return { error: json({ error: 'This account has no staff access.' }, 403) };
  return { id: user.id, role: staff.role };
}

async function bookmarkIssueReasons(db, rows) {
  const ids = rows.filter(row => ['no_summary', 'retryable_failure'].includes(row.status)).map(row => row.id);
  if (!ids.length) return rows;
  const result = await db.from('search_enrichments').select('bookmark_id').in('bookmark_id', ids);
  if (result.error) {
    console.warn('Bookmark error details unavailable', result.error.code);
    return rows.map(row => ids.includes(row.id) ? { ...row, reason: 'unavailable' } : row);
  }
  const enriched = new Set(result.data.map(row => row.bookmark_id));
  return rows.map(row => ids.includes(row.id)
    ? { ...row, reason: enriched.has(row.id) ? 'no_error' : 'no_enrichment' }
    : row);
}

async function details(db, view, id, actor) {
  const audit = db.from('dashboard_audit').select('id,actor,action,detail,created_at')
    .eq('target_id', id).eq('action', view === 'reports' ? 'report.updated' : 'support.updated')
    .order('created_at', { ascending: false }).limit(50);
  if (view === 'reports') {
    const [history, url] = await Promise.all([audit, db.rpc('dashboard_report_evidence', { p_id: id })]);
    const evidence = unwrap(url);
    return evidence ? { audit: unwrap(history), ...evidence } : null;
  }
  const mail = supportMailConfig();
  const enabled = process.env.DASHBOARD_SUPPORT_REPLIES === 'true';
  const [entries, history, roster, customer, pending] = await Promise.all([
    db.from('dashboard_case_entries').select('id,kind,body,actor,created_at').eq('case_id', id)
      .order('created_at', { ascending: false }).order('id', { ascending: false }).limit(50),
    audit,
    db.from('dashboard_staff').select('user_id,role').in('role', ['admin', 'support']).order('user_id').limit(100),
    enabled ? db.rpc('dashboard_case_customer', { p_id: id }) : null,
    enabled ? db.from('dashboard_reply_outbox').select('id,actor,body,created_at').eq('case_id', id)
      .is('provider_id', null).limit(1).maybeSingle() : null,
  ]);
  const staff = unwrap(roster);
  const profiles = staff.length ? unwrap(await db.from('profiles').select('id,username').in('id', staff.map(item => item.user_id))) : [];
  const pendingReply = pending && unwrap(pending);
  return { entries: unwrap(entries).reverse(), audit: unwrap(history), customerId: customer && unwrap(customer),
    email: { inbound: mail.inbound, lookup: enabled, outbound: enabled && mail.outbound,
      pending: pendingReply ? { own: pendingReply.actor === actor,
        ...(pendingReply.actor === actor && { id: pendingReply.id, body: pendingReply.body }),
        expired: Date.now() - Date.parse(pendingReply.created_at) >= 23 * 60 * 60 * 1000 } : null },
    staff: staff.map(item => ({
    id: item.user_id, name: profiles.find(profile => profile.id === item.user_id)?.username || item.user_id.slice(0, 8),
  })) };
}

async function update(db, view, staff, request) {
  if (!Object.hasOwn(statuses, view)) return json({ error: 'Method unavailable.' }, 405);
  if (!request.headers.get('content-type')?.startsWith('application/json')) {
    return json({ error: 'Expected a JSON update.' }, 415);
  }
  const raw = await request.text();
  if (raw.length > 24000) return json({ error: 'Update is too large.' }, 413);
  const body = JSON.parse(raw);
  if (view === 'support' && body?.action === 'send_reply') {
    const config = supportMailConfig();
    if (process.env.DASHBOARD_SUPPORT_REPLIES !== 'true' || !config.outbound) {
      return json({ error: 'Email replies are not connected.' }, 503);
    }
    const result = await sendSupportReply(db, staff, body, config);
    return result.error ? json({ error: result.error }, result.status) : json({ sent: true });
  }
  if (view === 'reports' && ['delete_bookmark', 'suspend_user'].includes(body?.action)) {
    if (staff.role !== 'admin' || process.env.DASHBOARD_REPORT_ENFORCEMENT !== 'true') {
      return json({ error: 'Moderation enforcement is unavailable.' }, 403);
    }
    if (!uuid.test(body.id) || typeof body.note !== 'string' || !body.note.trim() || body.note.length > 4000 ||
        typeof body.expectedAt !== 'string' || body.expectedAt.length > 40 || !Number.isFinite(Date.parse(body.expectedAt))) {
      return json({ error: 'A current report and an enforcement reason are required.' }, 400);
    }
    unwrap(await db.rpc('dashboard_enforce_report', {
      p_actor: staff.id, p_id: body.id, p_expected_at: body.expectedAt, p_action: body.action, p_note: body.note.trim(),
    }));
    return json({ saved: true });
  }
  if (!body || !uuid.test(body.id) || !statuses[view].includes(body.status) ||
      typeof body.note !== 'string' || body.note.length > 4000) {
    return json({ error: 'Check the status and note and try again.' }, 400);
  }
  const values = { p_id: body.id, p_actor: staff.id, p_status: body.status, p_note: body.note.trim() };
  if (view === 'support') {
    if (!categories.includes(body.category) || !(['unchanged', 'self', 'clear'].includes(body.assignment) || uuid.test(body.assignment)) ||
        typeof body.recordReply !== 'boolean') return json({ error: 'Check the case details.' }, 400);
    Object.assign(values, { p_category: body.category, p_assignment: body.assignment, p_record_reply: body.recordReply });
  }
  if (view === 'reports') {
    if (typeof body.expectedAt !== 'string' || body.expectedAt.length > 40 || !Number.isFinite(Date.parse(body.expectedAt))) {
      return json({ error: 'Refresh the report and try again.' }, 400);
    }
    values.p_expected_at = body.expectedAt;
  }
  unwrap(await db.rpc(view === 'reports' ? 'dashboard_review_report' : 'dashboard_update_case', values));
  return json({ saved: true });
}

export async function handleAdmin(request) {
  try {
    const params = new URL(request.url).searchParams;
    const view = params.get('view') || 'overview';
    if (!['GET', 'PATCH'].includes(request.method)) return json({ error: 'Method unavailable.' }, 405);
    if (view !== 'access' && !Object.hasOwn(permissions, view)) return json({ error: 'Page not found.' }, 404);
    if (view === 'access' && request.method !== 'GET') return json({ error: 'Method unavailable.' }, 405);
    if (!request.headers.has('authorization')) return json({ error: 'Sign in to continue.' }, 401);
    const missing = [
      !supabaseUrl() && 'SUPABASE_URL or VITE_SUPABASE_URL',
      !process.env.SUPABASE_SERVICE_ROLE_KEY && 'SUPABASE_SERVICE_ROLE_KEY',
      !process.env.VITE_SUPABASE_PUBLISHABLE_KEY && 'VITE_SUPABASE_PUBLISHABLE_KEY',
    ].filter(Boolean);
    if (missing.length) {
      console.error('Missing admin Supabase configuration:', missing.join(', '));
      return json({ error: 'The dashboard cannot verify access until its server configuration is complete. Contact the site administrator.' }, 503);
    }
    const db = database();
    const staff = await identify(request, db);
    if (staff.error) return staff.error;
    if (view === 'access') return json({ role: staff.role, id: staff.id, environment: process.env.ADMIN_ENVIRONMENT || null,
      enforcement: staff.role === 'admin' && process.env.DASHBOARD_REPORT_ENFORCEMENT === 'true' });
    if (!permissions[view].includes(staff.role)) return json({ error: 'This action requires staff permission.' }, 403);
    if (request.method === 'PATCH') return await update(db, view, staff, request);
    if (view === 'reports' && params.get('counts') === 'true') {
      return json(unwrap(await db.rpc('dashboard_report_counts')));
    }
    if (view === 'appstore' && params.get('availability') === 'true') {
      return json({ available: unwrap(await db.rpc('dashboard_has_apple_reports')) });
    }
    const page = Number(params.get('page') || 0);
    if (!Number.isInteger(page) || page < 0 || page > 1000) return json({ error: 'Invalid page.' }, 400);
    if (view === 'spaces') {
      const scope = params.get('scope') || 'all';
      const sort = params.get('sort') || 'recent';
      const space = params.get('id');
      if (!['all', 'mine'].includes(scope) || !['recent', 'members', 'bookmarks', 'contributors'].includes(sort) ||
          (space && (scope !== 'mine' || !uuid.test(space)))) return json({ error: 'Invalid Spaces filters.' }, 400);
      if (space) {
        const rows = unwrap(await db.rpc('dashboard_space_roster', { p_actor: staff.id, p_space: space, p_page: page }));
        return rows ? json({ rows: rows.slice(0, 25), hasMore: rows.length > 25 })
          : json({ error: 'This Space is unavailable.' }, 404);
      }
      const data = unwrap(await db.rpc('dashboard_spaces_directory', {
        p_actor: staff.id, p_scope: scope, p_sort: sort, p_page: page,
      }));
      return json({ ...data, rows: data.rows.slice(0, 25), hasMore: data.rows.length > 25 });
    }
    if (['overview', 'bookmarks', 'appstore'].includes(view)) {
      const days = Number(params.get('days') || 30);
      if (![7, 30, 90].includes(days)) return json({ error: 'Choose a supported date range.' }, 400);
      const options = { p_days: days, p_include_tests: params.get('tests') === 'true' };
      if (view === 'bookmarks') {
        if (params.get('summary') === 'true') return json(unwrap(await db.rpc('dashboard_bookmark_health', options)));
        const status = params.get('status') || 'all';
        const source = params.get('source') || '';
        if (!['all', 'summary_available', 'no_summary', 'processing', 'retryable_failure'].includes(status) || source.length > 40) {
          return json({ error: 'Invalid bookmark filters.' }, 400);
        }
        const rows = unwrap(await db.rpc('dashboard_bookmark_rows', {
          ...options, p_status: status, p_source: source, p_page: page,
        }));
        return json({ rows: await bookmarkIssueReasons(db, rows.slice(0, 25)), hasMore: rows.length > 25 });
      }
      if (view === 'appstore') return json(unwrap(await db.rpc('dashboard_apple_analytics', { p_days: days })));
      return json(unwrap(await db.rpc('dashboard_admin_overview', options)));
    }
    const id = params.get('id');
    if (id) {
      if (!uuid.test(id)) return json({ error: 'Invalid item.' }, 400);
      const item = await details(db, view, id, staff.id);
      return item ? json(item) : json({ error: 'This item is no longer available.' }, 404);
    }
    const status = params.get('status') || 'open';
    if (!['open', 'all', ...statuses[view], ...(view === 'support' ? ['unanswered'] : [])].includes(status)) {
      return json({ error: 'Invalid queue filters.' }, 400);
    }
    const type = params.get('type') || 'all';
    if (view === 'reports' && !['all', 'user', 'bookmark'].includes(type)) return json({ error: 'Invalid report type.' }, 400);
    const severity = params.get('severity') || 'all';
    if (view === 'reports' && !['all', 'low', 'medium', 'high', 'critical'].includes(severity)) return json({ error: 'Invalid severity.' }, 400);
    const queue = db.rpc(view === 'reports' ? 'dashboard_moderation_queue' : 'dashboard_support', {
      ...(view === 'reports' ? { p_type: type, p_severity: severity } : {}),
      p_status: status, p_search: (params.get('q') || '').trim().slice(0, 120), p_page: page,
    });
    const [response, signals] = await Promise.all([
      queue, view === 'support' ? db.rpc('dashboard_support_signals') : null,
    ]);
    const data = unwrap(response);
    const { rows, counts } = data;
    return json({ rows: rows.slice(0, 25), hasMore: rows.length > 25, counts,
      ...(signals && { signals: unwrap(signals) }),
      oldestOpen: data.oldestOpen, avgFirstResponseMinutes: data.avgFirstResponseMinutes });
  } catch (error) {
    if (error instanceof SyntaxError) return json({ error: 'Invalid request.' }, 400);
    if (error.code === 'P0002') return json({ error: 'This item is no longer available.' }, 404);
    if (error.code === '42501') return json({ error: 'Access denied.' }, 403);
    if (['23514', '40001'].includes(error.code)) return json({ error: 'This update is no longer valid. Refresh and try again.' }, 409);
    console.error('Dashboard request failed', error.code || error.name);
    return json({ error: 'The dashboard could not load this data. Try again.' }, 503);
  }
}
