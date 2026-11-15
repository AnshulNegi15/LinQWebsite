import { useCallback, useEffect, useMemo, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { QueryClient, QueryClientProvider, useQuery, useQueryClient } from '@tanstack/react-query';
import { Activity, ArrowDownToLine, ArrowLeft, ArrowRight, Bookmark, ChevronDown, CircleHelp, Eye, EyeOff, Flag,
  Inbox, LayoutGrid, LogOut, RefreshCw, Search, Users, X } from 'lucide-react';
import '@fontsource-variable/geist';
import './admin.css';

const env = import.meta.env;
const supabase = env.VITE_SUPABASE_URL && env.VITE_SUPABASE_PUBLISHABLE_KEY
  ? createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_PUBLISHABLE_KEY) : null;
const nav = [
  ['overview', 'Overview', LayoutGrid], ['bookmarks', 'Bookmarks', Bookmark, ['admin', 'analyst']],
  ['spaces', 'Spaces', Users, ['admin', 'analyst']],
  ['reports', 'Reports', Flag, ['admin', 'moderator']], ['support', 'Support', Inbox, ['admin', 'support']],
  ['appstore', 'App Store', ArrowDownToLine, ['admin', 'analyst']],
];
const reportTypes = [['all', 'All'], ['user', 'Members'], ['bookmark', 'Links']];
const reportStatuses = ['pending', 'under_review', 'resolved', 'dismissed'];
const caseStatuses = ['new', 'awaiting_staff', 'awaiting_customer', 'closed'];
const categories = ['general', 'account', 'sync', 'billing', 'bug', 'other'];
const refreshInterval = 60_000;
const names = { pending: 'Pending', under_review: 'Under review', resolved: 'Resolved', dismissed: 'Dismissed',
  new: 'New', awaiting_staff: 'Awaiting staff', awaiting_customer: 'Awaiting customer', closed: 'Closed' };
const number = value => Number(value).toLocaleString();
const date = value => value ? new Intl.DateTimeFormat(undefined, {
  month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC',
}).format(new Date(value)) : '—';
const clock = value => new Date(value).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
const shortId = value => value ? value.slice(0, 8) : '—';

const reportTitle = item => item.report_type === 'user'
  ? item.target || 'Member ' + shortId(item.target_id)
  : item.bookmark || 'Unavailable bookmark';
const reportAge = value => {
  const days = Math.floor((Date.now() - Date.parse(value)) / 86_400_000);
  return days < 1 ? 'Today' : days + (days === 1 ? ' day ago' : ' days ago');
};

async function api(token, params = {}, payload, signal) {
  const response = await fetch('/api/admin?' + new URLSearchParams(params), {
    signal, cache: 'no-store',
    headers: { Authorization: 'Bearer ' + token, ...(payload && { 'Content-Type': 'application/json' }) },
    ...(payload && { method: 'PATCH', body: JSON.stringify(payload) }),
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const error = new Error(data?.error || 'The admin API is unavailable.');
    error.status = response.status;
    throw error;
  }
  if (!data) throw new Error('The admin API returned an unexpected response. Try again.');
  return data;
}

function accessDenied(error) {
  return [401, 403].includes(error?.status);
}

function createAdminCache() {
  return new QueryClient({ defaultOptions: { queries: {
    staleTime: refreshInterval,
    gcTime: 5 * refreshInterval,
    retry: false,
  } } });
}

function adminQuery(token, params) {
  return {
    queryKey: ['admin-data', params.view, params],
    queryFn: ({ signal }) => api(token, params, undefined, signal),
    staleTime: params.id ? 15_000 : refreshInterval,
  };
}

function queueParams(view, status = 'open', q = '', page = 0, type = 'all', severity = 'all') {
  return { view, status, q, page, ...(view === 'reports' && { type, severity }) };
}

function useData(token, params, enabled = true) {
  const detail = Boolean(params.id);
  const result = useQuery({
    enabled,
    ...adminQuery(token, params),
    refetchInterval: detail ? false : refreshInterval,
    refetchIntervalInBackground: false,
  });
  return {
    ...result,
    data: accessDenied(result.error) ? undefined : result.data,
    error: result.error?.message,
  };
}

function AdminLink({ to, navigate, children, prefetch, ...props }) {
  return <a href={to} {...props} onPointerEnter={prefetch} onFocus={prefetch} onClick={event => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    navigate(to);
  }}>{children}</a>;
}

function Refresh({ label, result, onClick }) {
  return <button className="la-icon-button" title={label} aria-label={label} aria-busy={result.isFetching}
    onClick={onClick || (() => { void result.refetch({ cancelRefetch: false }); })}>
    <RefreshCw size={17} />
  </button>;
}

function Brand() {
  return <div className="la-brand"><img src="/assets/linq-icon.png" alt="" /><span>LinQ</span></div>;
}

function Notice({ children, error = false }) {
  return <div className={'la-notice' + (error ? ' error' : '')} role={error ? 'alert' : 'status'}>{children}</div>;
}

function SignIn({ onSignedIn }) {
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function submit(event) {
    event.preventDefault();
    if (!supabase || busy) return;
    const fields = new FormData(event.currentTarget);
    setBusy(true);
    setError('');
    try {
      const result = await supabase.auth.signInWithPassword({
        email: fields.get('email').trim(),
        password: fields.get('password'),
      });
      if (result.error) {
        setError(result.error.message);
      } else if (result.data.session) {
        onSignedIn(result.data.session);
      } else {
        setError('Sign-in did not return a session. Try again.');
      }
    } catch {
      setError('Could not reach sign-in. Try again.');
    } finally {
      setBusy(false);
    }
  }

  return <main className="la-gate"><section className="la-gate-panel" aria-labelledby="sign-in-title">
    <Brand />
    <h1 id="sign-in-title">Sign in</h1>
    <p>Open your LinQ dashboard.</p>
    {supabase ? <form className="la-sign-in" onSubmit={submit} aria-busy={busy}>
      <label htmlFor="sign-in-email">Email
        <input id="sign-in-email" name="email" type="email" autoComplete="username" required />
      </label>
      <div className="la-password-field">
        <label htmlFor="sign-in-password">Password</label>
        <div className="la-password-input">
          <input id="sign-in-password" name="password" type={showPassword ? 'text' : 'password'}
            autoComplete="current-password" required />
          <button type="button" onClick={() => setShowPassword(visible => !visible)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}>
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>
      {error && <Notice error>{error}</Notice>}
      <button className="la-primary" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'} <ArrowRight size={16} aria-hidden="true" /></button>
    </form> : <Notice error>Sign-in is currently unavailable.</Notice>}
    <a href="/"><ArrowLeft size={15} aria-hidden="true" /> Back to LinQ</a>
  </section></main>;
}

function WorkspaceLoading({ checkingAccess = false }) {
  return <main className="la-gate"><section className="la-gate-panel la-gate-loading" aria-labelledby="workspace-loading-title">
    <Brand />
    <h1 id="workspace-loading-title">Opening LinQ</h1>
    <p role="status">{checkingAccess ? 'Checking your dashboard access…' : 'Restoring your session…'}</p>
    <progress aria-label="Loading the LinQ dashboard" />
  </section></main>;
}

function Metrics({ items }) {
  return <dl className="la-metrics">{items.map(([label, value, caption]) => <div key={label}>
    <dt>{label}</dt><dd>{value}<span>{caption}</span></dd>
  </div>)}</dl>;
}

function Trend({ points, savesOnly = false }) {
  const [series, setSeries] = useState('saves');
  const width = 690;
  const height = 196;
  const top = 18;
  const left = 46;
  const bottom = 162;
  const peak = Math.max(1, ...points.map(day => day[series]));
  const step = Math.max(1, Math.ceil(peak / 4));
  const ceiling = step * 4;
  const coordinates = points.map((day, index) => [left + (width - left - 18) * index / Math.max(1, points.length - 1),
    bottom - day[series] / ceiling * (bottom - top)]);
  const line = coordinates.map(point => point.join(',')).join(' ');
  const first = points[0];
  const last = points.at(-1);
  return <section className="la-panel la-trend">
    <div className="la-panel-head"><div><h2>{savesOnly ? 'Saves over time' : 'Activity over time'}</h2><p>{savesOnly ? 'Daily totals in UTC, including trashed saves' : 'Daily totals in UTC'}</p></div>
      {!savesOnly && <div className="la-segment" aria-label="Activity series">
        <button aria-pressed={series === 'saves'} onClick={() => setSeries('saves')}>Saves</button>
        <button aria-pressed={series === 'signups'} onClick={() => setSeries('signups')}>Signups</button>
      </div>}
    </div>
    <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`${series} by day, peak ${peak === 1 && points.every(day => !day[series]) ? 0 : peak}`}>
      {[0, 1, 2, 3, 4].map(index => {
        const y = bottom - index * (bottom - top) / 4;
        return <g key={index}><line x1={left} x2={width - 18} y1={y} y2={y} />
          <text x={left - 10} y={y + 4} textAnchor="end">{index * step}</text></g>;
      })}
      <polygon points={`${left},${bottom} ${line} ${coordinates.at(-1)?.[0] || left},${bottom}`} />
      <polyline points={line} />
      {coordinates.map(([x, y], index) => <circle key={points[index].date} cx={x} cy={y} r="7" fill="transparent"><title>
        {`${date(points[index].date)} • ${points[index][series]} ${series}`}</title></circle>)}
      <text x={left} y={189}>{date(first?.date)}</text><text x={width - 18} y={189} textAnchor="end">{date(last?.date)}</text>
    </svg>
    <details className="la-chart-data"><summary>Daily data</summary><div className="la-table-scroll">
      <table><thead><tr><th>Date</th><th>Saves</th>{!savesOnly && <th>Signups</th>}</tr></thead><tbody>
        {[...points].reverse().map(day => <tr key={day.date}><td>{date(day.date)}</td><td>{day.saves}</td>{!savesOnly && <td>{day.signups}</td>}</tr>)}
      </tbody></table></div></details>
  </section>;
}

function Overview({ token, role, navigate, days, setDays, tests, setTests }) {
  const result = useData(token, { view: 'overview', days, tests });
  const stat = result.data;
  return <>
    <div className="la-page-head"><div><h1>Overview</h1><p>Signup, saving activity, and work awaiting review.</p></div>
      <div className="la-actions">
        <label className="la-check"><input type="checkbox" checked={tests} onChange={event => setTests(event.target.checked)} /> Include test accounts</label>
        <label className="la-select"><span className="la-sr">Date range</span><select value={days} onChange={event => setDays(Number(event.target.value))}>
          {[7, 30, 90].map(day => <option key={day} value={day}>Last {day} days</option>)}
        </select><ChevronDown size={14} /></label>
        <Refresh label="Refresh dashboard" result={result} />
      </div>
    </div>
    {result.error && <Notice error>{stat ? 'Showing the last successful update. ' : ''}{result.error}</Notice>}
    {!stat ? (!result.error && <Notice>Loading dashboard…</Notice>) : <>
        <Metrics items={[
          ['Registered accounts', number(stat.registered), `${number(stat.verified)} email confirmed`],
          ['New accounts', number(stat.signups), `Last ${days} days`],
          ['First save within 24h', stat.eligible ? Math.round(stat.activated / stat.eligible * 100) + '%' : '—', `${stat.activated} of ${stat.eligible} eligible accounts`],
          ['Repeat saving', number(stat.repeatSavers), `${number(stat.repeatSavers)} of ${number(stat.saveAccounts)} savers saved on multiple days`],
        ]} />
        <div className="la-overview-grid"><Trend points={stat.days} /><section className="la-panel la-queue-summary">
          <div className="la-panel-head"><div><h2>Needs attention</h2><p>Open queues and current processing issues</p></div></div>
          {[[Flag, 'Member reports', stat.reportCounts.members, 'reports', 'user'], [Flag, 'Link reports', stat.reportCounts.links, 'reports', 'bookmark'],
            [Inbox, 'Unanswered cases', stat.unanswered, 'support', 'unanswered'],
            [Activity, 'Bookmarks without a summary', stat.missingSummaries, 'bookmarks', 'no_summary']].map(([Icon, label, value, path, type]) =>
            <div className="la-queue-link" key={label}><Icon size={18} /><span>{label}</span><strong>{number(value)}</strong>
              {nav.find(item => item[0] === path)[3].includes(role) && <AdminLink to={'/admin/' + path + (type ? '?type=' + type : '')} navigate={navigate}
                aria-label={'Open ' + label}><ArrowRight size={17} /></AdminLink>}
            </div>)}
        </section></div>
      <div className="la-caption"><Activity size={14} /> Updated {clock(stat.updatedAt)} <span>•</span> Supabase data
        {result.isFetching && <span role="status"> · Refreshing…</span>}
      </div>
    </>}
  </>;
}

const bookmarkStatuses = {
  summary_available: 'Summary available', no_summary: 'No summary yet',
  pending: 'Pending', analyzing: 'Analyzing', processing: 'Pending or analyzing',
  retryable_failure: 'Retryable failure',
};

function SelectFilter({ label, value, onChange, options }) {
  return <label className="la-select"><span className="la-sr">{label}</span>
    <select value={value} onChange={event => onChange(event.target.value)}>
      {options.map(([key, title]) => <option key={key} value={key}>{title}</option>)}
    </select><ChevronDown size={14} />
  </label>;
}

function ViewPicker({ label, value, onChange, options }) {
  return <div className="la-report-filters la-view-picker" role="group" aria-label={label}>
    {options.map(([key, title]) => <button key={key} type="button" className="la-button"
      aria-pressed={value === key} onClick={() => onChange(key)}>{title}</button>)}
  </div>;
}

function Pages({ page, onChange, hasMore }) {
  return <div className="la-pagination"><span>Page {page + 1}</span>
    <button className="la-icon-button" disabled={page === 0} onClick={() => onChange(page - 1)} aria-label="Previous page"><ArrowLeft size={17} /></button>
    <button className="la-icon-button" disabled={!hasMore} onClick={() => onChange(page + 1)} aria-label="Next page"><ArrowRight size={17} /></button>
  </div>;
}

const summaryReasons = {
  no_enrichment: 'No enrichment record',
  no_error: 'No error recorded',
  unavailable: 'Error details unavailable',
};

const outcomes = [
  ['summary_available', 'summarized', 'With summary'],
  ['no_summary', 'missing', 'No summary yet'],
  ['processing', 'processing', 'In progress'],
  ['retryable_failure', 'retrying', 'Retryable failure'],
];

const percent = (value, total) => total ? new Intl.NumberFormat(undefined, {
  style: 'percent', maximumFractionDigits: 1,
}).format(value / total) : '—';

function SourceChart({ health, chooseSource, activeSource }) {
  return <section className="la-panel la-bookmark-chart">
    <div className="la-panel-head"><div><h2>Save sources</h2><p>Share of synced, untrashed saves</p></div></div>
    {health.sources.length ? <ul className="la-source-bars">{health.sources.map(row => <li key={row.source}>
      <button type="button" className="la-chart-filter" onClick={() => chooseSource(row.source)}
        aria-pressed={activeSource === row.source}>
        <span className="la-chart-label"><strong>{row.source}</strong><span>{number(row.total)} · {percent(row.total, health.total)}</span></span>
        <span className="la-bar-track" aria-hidden="true"><span style={{ width: (100 * row.total / health.total) + '%' }} /></span>
      </button>
    </li>)}</ul> : <p className="la-empty">No saves in this period.</p>}
  </section>;
}

function SummaryChart({ health, status, chooseStatus }) {
  const { total, summarized } = health;
  const coverage = percent(summarized, total);
  const segments = outcomes.filter(([key, field]) => ['summary_available','no_summary'].includes(key) || health[field]);
  return <section className="la-panel la-bookmark-chart">
    <div className="la-panel-head"><div><h2>Summary coverage</h2><p>Among synced, untrashed bookmarks</p></div></div>
    <div className="la-summary-chart">
      <div className="la-summary-score"><strong>{coverage}</strong><span>{number(summarized)} of {number(total)} bookmarks have a summary</span></div>
      <div className="la-coverage-track" aria-hidden="true">{segments.map(([key, field]) =>
        <span key={key} className={key} style={{ flexGrow: health[field] }} />)}</div>
      <ul className="la-summary-legend">{segments.map(([key, field, label]) => <li key={key}>
        <button type="button" className="la-chart-filter la-legend-row" aria-pressed={status === key}
          onClick={() => chooseStatus(key)}>
          <span><i className={key} aria-hidden="true" />{label}</span>
          <strong>{number(health[field])} · {percent(health[field], total)}</strong>
        </button>
      </li>)}</ul>
      <p className="la-summary-note"><strong>Actual failure rate unavailable.</strong> Missing summaries have no confirmed outcome. Check the records below for any logged reason.</p>
    </div>
  </section>;
}

function Bookmarks({ token, initialFilter, days, setDays, tests, setTests }) {
  const [status, setStatus] = useState(['no_summary', 'retryable_failure'].includes(initialFilter) ? initialFilter : 'all');
  const [source, setSource] = useState('');
  const [page, setPage] = useState(0);
  const health = useData(token, { view: 'bookmarks', days, tests, summary: true });
  const list = useData(token, { view: 'bookmarks', days, tests, page, status, source });
  const overview = useData(token, { view: 'overview', days, tests });
  const stat = health.data;
  function filter(nextStatus, nextSource) {
    setStatus(nextStatus);
    setSource(nextSource);
    setPage(0);
  }
  const listedStatuses = outcomes.filter(([key, field]) =>
    ['summary_available', 'no_summary', status].includes(key) || stat?.[field]);
  return <>
    <div className="la-page-head"><div><h1>Bookmarks</h1><p>See what people save and which bookmarks have a summary.</p></div>
      <div className="la-actions">
        <label className="la-check"><input type="checkbox" checked={tests}
          onChange={event => { setTests(event.target.checked); filter(status, ''); }} /> Include test accounts</label>
        <SelectFilter label="Date range" value={days} onChange={value => { setDays(Number(value)); filter(status, ''); }}
          options={[7, 30, 90].map(day => [day, 'Last ' + day + ' days'])} />
        <Refresh label="Refresh bookmarks" result={{ isFetching: health.isFetching || list.isFetching || overview.isFetching }}
          onClick={() => { void health.refetch(); void list.refetch(); void overview.refetch(); }} />
      </div>
    </div>
    {health.error && <Notice error>{health.error}</Notice>}
    {!stat && !health.error && <Notice>Loading bookmark charts…</Notice>}
    {stat && <>
      <Metrics items={[
        ['Synced saves', number(stat.total), 'Excludes trashed bookmarks'],
        ['Summary coverage', percent(stat.summarized, stat.total), number(stat.summarized) + ' with a summary'],
        ['No summary yet', number(stat.missing), percent(stat.missing, stat.total) + ' of saves'],
      ]} />
      <div className="la-bookmark-grid">
        <SourceChart health={stat} activeSource={source}
          chooseSource={value => filter(status, source === value ? '' : value)} />
        <SummaryChart health={stat} status={status} chooseStatus={value => filter(status === value ? 'all' : value, source)} />
      </div>
    </>}
    {overview.error && <Notice error>{overview.error}</Notice>}
    {overview.data && <Trend points={overview.data.days} savesOnly />}
    <section className="la-panel la-bookmark-records">
      <div className="la-panel-head"><div><h2>Bookmark records</h2>
        <p>Choose a source or summary status above to filter these records.</p></div></div>
      <div className="la-toolbar">
        <SelectFilter label="Summary status" value={status} onChange={value => filter(value, source)}
          options={ [['all', 'All statuses'], ...listedStatuses.map(([key]) => [key, bookmarkStatuses[key]])] } />
        <SelectFilter label="Source" value={source} onChange={value => filter(status, value)}
          options={ [['', 'All sources'], ...(stat?.sources || []).map(row => [row.source, row.source])] } />
        {(status !== 'all' || source) && <button type="button" className="la-button" onClick={() => filter('all', '')}>Clear filters</button>}
      </div>
      {list.error && <Notice error>{list.error}</Notice>}
      {!list.data && !list.error && <Notice>Loading bookmark records…</Notice>}
      {list.data && <>
        {list.data.rows.length ? <div className="la-table-scroll"><table>
          <thead><tr><th>Bookmark ID</th><th>Source</th><th>Saved (UTC)</th><th>Summary status</th><th>Recorded reason</th></tr></thead>
          <tbody>{list.data.rows.map(row => <tr key={row.id}><td><code title={row.id}>{shortId(row.id)}</code></td>
            <td>{row.source}</td><td>{date(row.saved_at)}</td>
            <td><span className={'la-status ' + row.status}>{bookmarkStatuses[row.status]}</span></td>
            <td>{summaryReasons[row.reason] || '—'}</td></tr>)}</tbody>
        </table></div> : <p className="la-empty">No bookmark records match these filters.</p>}
        <Pages page={page} onChange={setPage} hasMore={list.data.hasMore} />
      </>}
    </section>
  </>;
}

function SpaceRoster({ token, space, close }) {
  const [page, setPage] = useState(0);
  const result = useData(token, { view: 'spaces', scope: 'mine', id: space.id, page });
  return <section className="la-panel la-detail">
    <div className="la-panel-head"><div><h2>{result.data && !result.error ? space.name : 'Space members'}</h2><p>Owner access</p></div>
      <button className="la-icon-button" aria-label="Close member list" onClick={close}><X size={18} /></button></div>
    {result.error && <Notice error>{result.error}</Notice>}
    {!result.data && !result.error && <Notice>Loading members…</Notice>}
    {result.data && !result.error && !result.isFetching && <>
      <ul className="la-source-list">{result.data.rows.map(member => <li key={member.id}>
        <span>{member.name || 'Member ' + shortId(member.id)}</span><strong>{member.role || 'Member'}</strong></li>)}</ul>
      <Pages page={page} onChange={setPage} hasMore={result.data.hasMore} />
    </>}
  </section>;
}

function Spaces({ token }) {
  const [scope, setScope] = useState('all');
  const [sort, setSort] = useState('recent');
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState(null);
  const client = useQueryClient();
  const result = useData(token, { view: 'spaces', scope, sort, page });
  const stat = result.data;
  return <>
    <div className="la-page-head"><div><h1>Spaces</h1><p>Compare how much people share and how many contribute.</p></div>
      <Refresh label="Refresh Spaces" result={result} onClick={() => { void client.invalidateQueries({ queryKey: ['admin-data', 'spaces'] }); }} /></div>
    <ViewPicker label="Spaces view" value={scope}
      onChange={value => { setScope(value); setPage(0); setSelected(null); }}
      options={ [['all', 'All Spaces'], ['mine', 'My Spaces']] } />
    {stat && <Metrics items={[
      ['Shared Spaces', number(stat.total), scope === 'mine' ? 'Spaces you created and still own' : 'Across LinQ'],
      ['Active Spaces', number(stat.active), 'With a save in the last 30 days'],
      ['Multiple contributors', number(stat.multiContributor), 'Two or more in the last 30 days'],
    ]} />}
    <section className="la-panel">
      <div className="la-toolbar">
        <SelectFilter label="Sort Spaces" value={sort} onChange={value => { setSort(value); setPage(0); }}
          options={ [['recent', 'Recent shares'], ['members', 'Member count'], ['bookmarks', 'Total shared bookmarks'], ['contributors', 'Recent contributors']] } />
      </div>
      {result.error && <Notice error>{result.error}</Notice>}
      {!stat && !result.error && <Notice>Loading Spaces…</Notice>}
      {stat && <>
        {stat.rows.length ? <div className="la-table-scroll"><table><thead><tr><th>Space</th><th>Members</th>
          <th>Shared bookmarks</th><th>Shares · 30 days</th><th>Contributors · 30 days</th></tr></thead>
          <tbody>{stat.rows.map(space => <tr key={space.id}><td>{scope === 'mine'
            ? <button className="la-row-link" onClick={() => setSelected(space)}>{space.name}</button>
            : <code title={space.id}>{shortId(space.id)}</code>}</td>
            <td>{number(space.members)}</td><td>{number(space.bookmarks)}</td>
            <td>{number(space.recent)}</td><td>{number(space.contributors)}</td></tr>)}</tbody></table></div>
          : <p className="la-empty">{scope === 'mine' ? 'No Spaces you created and still own.' : 'No shared Spaces.'}</p>}
        <Pages page={page} onChange={setPage} hasMore={stat.hasMore} />
      </>}
    </section>
    {selected && scope === 'mine' && !accessDenied(result.failureReason) &&
      <SpaceRoster key={selected.id} token={token} space={selected} close={() => setSelected(null)} />}
  </>;
}

function Breakdown({ heading, rows, empty }) {
  return <section className="la-panel">
    <div className="la-panel-head"><h2>{heading}</h2></div>
    {rows.length ? <ul className="la-source-list">{rows.map(row => <li key={row.label}>
      <span>{row.label}</span><strong>{number(row.total)}</strong></li>)}</ul>
      : <p className="la-empty">{empty}</p>}
  </section>;
}

function AppStore({ token, days, setDays }) {
  const result = useData(token, { view: 'appstore', days });
  const stat = result.data;
  const coverage = (kind, empty) => {
    const entry = stat.coverage?.[kind];
    return entry ? `${entry.days} report days · through ${date(entry.latest)}` : empty;
  };
  return <>
    <div className="la-page-head"><div><h1>App Store</h1>
      <p>Downloads, acquisition and crashes from Apple reports.</p></div>
      <div className="la-actions">
        <label className="la-select"><span className="la-sr">Date range</span>
          <select value={days} onChange={event => setDays(Number(event.target.value))}>
            {[7, 30, 90].map(day => <option key={day} value={day}>Last {day} days</option>)}
          </select><ChevronDown size={14} /></label>
        <Refresh label="Refresh analytics" result={result} />
      </div>
    </div>
    {result.error && <Notice error>{stat ? 'Showing the last successful update. ' : ''}{result.error}</Notice>}
    {!stat ? (!result.error && <Notice>Loading analytics…</Notice>) : <>
      <Metrics items={[
        ['Downloads', stat.downloads == null ? '—' : number(stat.downloads), coverage('downloads', 'No download reports imported for this period')],
        ['Reported crashes', stat.crashes == null ? '—' : number(stat.crashes), coverage('crashes', 'No crash reports imported for this period')],
      ]} />
      <div className="la-overview-grid">
        <Breakdown heading="Downloads by territory" rows={stat.territories} empty="No download data for this period." />
        <Breakdown heading="Downloads by source" rows={stat.sources} empty="No download data for this period." />
        <Breakdown heading="Crashes by app version" rows={stat.versions} empty="No crash data for this period." />
      </div>
      <p className="la-caption">Downloads count first-time downloads and redownloads. Apple crash reports reflect opt-in analytics.</p>
    </>}
    {stat && <div className="la-caption"><Activity size={14} /> Checked {clock(stat.updatedAt)}
      {result.isFetching && <span role="status"> · Refreshing…</span>}
    </div>}
  </>;
}

const enforcementLabels = {
  delete_bookmark: 'Delete reported bookmark',
  suspend_user: 'Suspend sign-in for 7 days',
};
const entryLabels = { inbound: 'Incoming email', note: 'Staff note', outbound: 'Sent reply' };

function Enforcement({ item, token, action, saved }) {
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function submit(event) {
    event.preventDefault();
    const note = new FormData(event.currentTarget).get('reason');
    setBusy(true);
    setError('');
    try {
      await api(token, { view: 'reports' }, { id: item.id, action, note, expectedAt: item.updated_at });
      saved();
    } catch (failure) { setError(failure.message); }
    finally { setBusy(false); }
  }
  return <div className="la-case-action">
    {confirming ? <form className="la-detail-form" onSubmit={submit}>
      <strong>{enforcementLabels[action]}</strong>
      <p>{action === 'delete_bookmark' ? 'Permanently removes the bookmark from this Space and keeps the report evidence.'
        : 'Prevents new sign-ins across LinQ. Existing sessions may continue.'}</p>
      <label>Reason for this action<textarea name="reason" rows={3} maxLength={4000} required /></label>
      {error && <Notice error>{error}</Notice>}
      <div className="la-actions"><button type="button" className="la-button" disabled={busy}
        onClick={() => { setConfirming(false); setError(''); }}>Cancel</button>
        <button className="la-danger" disabled={busy}>{busy ? 'Applying…' : 'Confirm action'}</button></div>
    </form> : <button type="button" className="la-button la-danger-text" onClick={() => setConfirming(true)}>
      {enforcementLabels[action]}</button>}
  </div>;
}

function SupportReply({ token, item, email, saved }) {
  const [message, setMessage] = useState('');
  const [requestId, setRequestId] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const pending = email.pending;
  const pendingId = pending?.own ? pending.id : null;
  const text = pendingId ? pending.body : message;
  async function send(event) {
    event.preventDefault();
    const id = pendingId || requestId || crypto.randomUUID();
    setRequestId(id);
    setBusy(true);
    setError('');
    try {
      await api(token, { view: 'support' }, { id: item.id, action: 'send_reply', requestId: id, message: text });
      setMessage('');
      setRequestId(null);
      saved();
    } catch (failure) {
      setError(failure.message);
      if (failure.status === 502) setRequestId(null);
    } finally { setBusy(false); }
  }
  return <form className="la-detail-form la-case-action" onSubmit={send}>
    <strong>Reply by email</strong>
    <p>To {item.sender}</p>
    {pending && (!pending.own || pending.expired) ? <Notice error>
      {pending.expired ? 'An earlier send needs reconciliation in Resend.' : 'Another staff member has a reply awaiting confirmation.'}
    </Notice> : <>
      <label>Message<textarea value={text} onChange={event => setMessage(event.target.value)}
        readOnly={Boolean(pendingId || requestId) || busy} rows={5} maxLength={4000} required /></label>
      {error && <Notice error>{error}</Notice>}
      <button className="la-primary" disabled={busy || !text.trim()}>
        {busy ? 'Sending…' : pendingId || requestId ? 'Retry same reply' : 'Send reply'}</button>
    </>}
  </form>;
}

function QueueDetail({ view, item, token, access, close, saved, refresh }) {
  const isReport = view === 'reports';
  const result = useData(token, { view, id: item.id });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const action = isReport && ['pending','under_review'].includes(item.status)
    ? (item.report_type === 'bookmark' && item.bookmark_id ? 'delete_bookmark'
      : item.report_type === 'user' && item.target_id ? 'suspend_user' : null) : null;
  async function submit(event) {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget));
    setBusy(true);
    setError('');
    try { await api(token, { view }, { ...data, id: item.id, expectedAt: item.updated_at, recordReply: data.recordReply === 'on' }); saved(); }
    catch (failure) { setError(failure.message); }
    finally { setBusy(false); }
  }
  return <section className="la-panel la-detail" aria-labelledby="queue-item-title">
    <div className="la-panel-head"><div><h2 id="queue-item-title">{isReport ? reportTitle(item) : item.subject}</h2>
      <p>{isReport ? item.reason : item.sender}</p></div>
      <button className="la-icon-button" onClick={close} aria-label="Close details"><X size={19} /></button>
    </div>
    {isReport && <dl className="la-report-meta">
      <div><dt>Space</dt><dd>{item.space || shortId(item.space_id)}</dd></div>
      <div><dt>Reported by</dt><dd>{item.reporter || shortId(item.reporter_id)}</dd></div>
      <div><dt>Reported member</dt><dd>{item.target || shortId(item.target_id)}</dd></div>
      {item.bookmark_id && <div><dt>Bookmark ID</dt><dd>{item.bookmark_id}</dd></div>}
      <div><dt>Severity</dt><dd className="la-severity">{item.severity}</dd></div>
      <div><dt>Submitted</dt><dd>{date(item.created_at)}</dd></div>
      {result.data && <div className="la-review-url"><dt>Reporter’s notes</dt><dd>{result.data.details || "No notes provided."}</dd></div>}
      {result.data?.resolvedAt && <div><dt>Closed</dt><dd>{date(result.data.resolvedAt)}</dd></div>}
      {result.data?.url && <div className="la-review-url"><dt>Reported URL</dt><dd>{result.data.url}</dd></div>}
    </dl>}
    {result.error && <Notice error>{result.data ? 'Showing the last successful update. ' : ''}{result.error}</Notice>}
    {!result.data ? (!result.error && <Notice>Loading history…</Notice>) : <>
      {result.data.entries?.map(entry => <article className="la-entry" key={entry.id}><div><strong>{entryLabels[entry.kind] || entry.kind}</strong><time>{date(entry.created_at)}</time></div><p>{entry.body}</p></article>)}
      {!!result.data.audit?.length && <details className="la-history"><summary>Activity history</summary><ul>
        {result.data.audit.map(entry => <li key={entry.id}><strong>{enforcementLabels[entry.detail.enforcement] || (entry.detail.email_sent ? 'Email reply sent' : names[entry.detail.status])}</strong> by staff {shortId(entry.actor)} · {date(entry.created_at)}
          {entry.detail.note && <p>{entry.detail.note}</p>}</li>)}
      </ul></details>}
    </>}
    <form className="la-detail-form" onSubmit={submit}>
      <label>Status<select name="status" defaultValue={item.status}>{(isReport ? reportStatuses : caseStatuses).map(status =>
        <option key={status} value={status}>{names[status]}</option>)}</select></label>
      {!isReport && <>
        <label>Category<select name="category" defaultValue={item.category}>{categories.map(category =>
          <option key={category} value={category}>{category[0].toUpperCase() + category.slice(1)}</option>)}</select></label>
        <label>Assignment<select name="assignment"><option value="unchanged">
          {item.assignee ? 'Keep ' + (result.data?.staff?.find(staff => staff.id === item.assignee)?.name || shortId(item.assignee)) : 'Unassigned'}
        </option><option value="self">Assign to me</option>
          {result.data?.staff?.map(staff => <option key={staff.id} value={staff.id}>{staff.name}</option>)}
          <option value="clear">Unassign</option></select></label>
        {!item.first_response_at && <label className="la-check"><input type="checkbox" name="recordReply" /> Record a reply already sent from the support inbox</label>}

      </>}
      <label>Staff note<textarea name="note" rows={3} maxLength={4000} /></label>
      {isReport && <p className="la-caption">Status updates record your review and keep the bookmark available.</p>}
      {error && <Notice error>{error}</Notice>}
      <button className="la-primary" disabled={busy || (isReport && !result.data) || accessDenied(result.failureReason)}>{busy ? 'Saving…' : 'Save changes'}</button>
    </form>
    {access.role === 'admin' && action && result.data && (access.enforcement
      ? <Enforcement token={token} item={item} action={action} saved={saved} />
      : <p className="la-case-action la-caption">{enforcementLabels[action]} · Enforcement setup pending.</p>)}
    {!isReport && result.data?.email && <div className="la-case-action">
      {result.data.customerId && <p className="la-caption">Matched LinQ account <code>{result.data.customerId}</code></p>}
      {result.data.email.lookup && !result.data.customerId && <p className="la-caption">No verified LinQ account matched to the sender.</p>}
      {!result.data.email.inbound && <p className="la-caption">Incoming email setup pending.</p>}
      {result.data.email.outbound && item.status !== 'closed'
        ? <SupportReply token={token} item={item} email={result.data.email} saved={refresh} />
        : <p className="la-caption">{item.status === 'closed' ? 'Reopen this case to send another reply.' : 'Email sending setup pending.'}</p>}
    </div>}
  </section>;
}

function Queue({ view, token, initialType, access }) {
  const isReport = view === 'reports';
  const [status, setStatus] = useState(!isReport && initialType === 'unanswered' ? 'unanswered' : 'open');
  const [type, setType] = useState(isReport && initialType !== 'unanswered' ? initialType : 'all');
  const [severity, setSeverity] = useState('all');
  const [q, setQ] = useState('');
  const [page, setPage] = useState(0);
  const [item, setItem] = useState(null);
  const [confirmed, setConfirmed] = useState(false);
  const client = useQueryClient();
  const result = useData(token, queueParams(view, status, q, page, type, severity));
  return <>
    <div className="la-page-head"><div><h1>{isReport ? 'Reports' : 'Support'}</h1>
      <p>{isReport ? 'Review member and bookmark reports from Spaces.' : 'Triage incoming support email and track replies.'}</p></div></div>
    {confirmed && <Notice>Changes saved.</Notice>}
    {isReport && result.data && <Metrics items={[
      ['Open member reports', number(result.data.counts.members), 'Pending or under review'],
      ['Open link reports', number(result.data.counts.links), 'Pending or under review'],
    ]} />}
    {!isReport && result.data && <Metrics items={[
      ['Unanswered cases', number(result.data.signals.unanswered), 'Open cases with no recorded reply'],
      ['Oldest open case', date(result.data.oldestOpen), 'Across all open cases'],
      ['Average first response', result.data.avgFirstResponseMinutes == null ? '—' : number(result.data.avgFirstResponseMinutes) + ' min', 'From recorded replies'],
    ]} />}
    {!isReport && result.data && <Breakdown heading="Open cases by category"
      rows={result.data.signals.categories.map(row => ({ label: row.category, total: row.total }))}
      empty="No open cases." />}
    <section className="la-panel">
      {isReport && <div className="la-report-filters" role="group" aria-label="Report type">
        {reportTypes.map(([value, label]) => <button key={value} className="la-button" aria-pressed={type === value}
          onClick={() => { setType(value); setPage(0); }}>{label}</button>)}
      </div>}
      <div className="la-toolbar">
        <form className="la-search" onSubmit={event => { event.preventDefault(); setQ(new FormData(event.currentTarget).get('query').trim()); setPage(0); }}>
          <Search size={17} /><input name="query" maxLength={120} aria-label={isReport ? 'Search reports' : 'Search support cases'} placeholder={isReport ? 'Search reports' : 'Search cases'} />
          <button className="la-button">Search</button>
        </form>
        <label className="la-select"><span className="la-sr">Filter status</span><select value={status} onChange={event => { setStatus(event.target.value); setPage(0); }}>
          <option value="open">Open</option>{!isReport && <option value="unanswered">Unanswered</option>}<option value="all">All statuses</option>
          {(isReport ? reportStatuses : caseStatuses).map(value => <option key={value} value={value}>{names[value]}</option>)}
        </select><ChevronDown size={14} /></label>
        {isReport && <label className="la-select"><span className="la-sr">Filter severity</span>
          <select value={severity} onChange={event => { setSeverity(event.target.value); setPage(0); }}>
            {['all','low','medium','high','critical'].map(value => <option key={value} value={value}>
              {value === 'all' ? 'All severities' : value[0].toUpperCase() + value.slice(1)}</option>)}
          </select><ChevronDown size={14} /></label>}
        <Refresh label="Refresh queue" result={result} onClick={() => {
          void result.refetch({ cancelRefetch: false });
          if (item) void client.invalidateQueries({ queryKey: ['admin-data', view, { view, id: item.id }] });
        }} />
      </div>
      {result.error && <Notice error>{result.data ? 'Showing the last successful update. ' : ''}{result.error}</Notice>}
      {!result.data ? (!result.error && <Notice>Loading queue…</Notice>) : <>
        {result.data.rows.length ? <div className="la-table-scroll"><table>
          <thead><tr><th>{isReport ? 'Report' : 'Subject'}</th><th>{isReport ? 'Space' : 'Sender'}</th>{isReport && <><th>Reported by</th><th>Severity</th></>}<th>Status</th><th>{isReport ? 'Reported' : 'Last update'}</th></tr></thead>
          <tbody>{result.data.rows.map(row => <tr key={row.id}>
            <td>{isReport && row.status === 'pending' && <span className="la-report-dot" aria-label="Awaiting review" />}
              <button className="la-row-link" onFocus={() => void client.prefetchQuery(adminQuery(token, { view, id: row.id }))}
                onPointerEnter={() => void client.prefetchQuery(adminQuery(token, { view, id: row.id }))}
                onClick={event => { setConfirmed(false); setItem(row); if (event.detail) window.requestAnimationFrame(() => document.getElementById('queue-item-title')?.scrollIntoView({ block: 'center' })); }}>
              {isReport ? reportTitle(row) : row.subject}</button>
              {isReport && <small>{row.report_type === 'user' ? 'Member' : 'Link'} · {row.reason}</small>}</td>
            <td>{isReport ? row.space || shortId(row.space_id) : row.sender}</td>
            {isReport && <><td>{row.reporter || shortId(row.reporter_id)}</td><td className="la-severity">{row.severity}</td></>}
            <td><span className={'la-status ' + row.status}>{names[row.status] || row.status}</span></td>
            <td>{isReport ? <time dateTime={row.created_at} title={date(row.created_at)}>{reportAge(row.created_at)}</time> : date(row.updated_at)}</td>
          </tr>)}</tbody>
        </table></div> : <p className="la-empty">No {isReport ? 'reports' : 'cases'} match these filters.</p>}
        <div className="la-pagination"><span>Page {page + 1}</span>
          <button className="la-icon-button" disabled={page === 0} onClick={() => setPage(page - 1)} aria-label="Previous page"><ArrowLeft size={17} /></button>
          <button className="la-icon-button" disabled={!result.data.hasMore} onClick={() => setPage(page + 1)} aria-label="Next page"><ArrowRight size={17} /></button>
        </div>
      </>}
    </section>
    {item && !accessDenied(result.failureReason) && <QueueDetail key={item.id} item={item} token={token} view={view} access={access} close={() => setItem(null)}
      refresh={() => {
        void client.invalidateQueries({ queryKey: ['admin-data', view] });
        void client.invalidateQueries({ queryKey: ['admin-data', 'overview'] });
      }}
      saved={() => {
        setItem(null);
        setConfirmed(true);
        void client.invalidateQueries({ queryKey: ['admin-data', view] });
        void client.invalidateQueries({ queryKey: ['admin-data', 'overview'] });
      }} />}
  </>;
}

function AdminGate() {
  const [session, setSession] = useState(supabase ? undefined : null);
  const [identity, setIdentity] = useState(0);
  const client = useQueryClient();
  useEffect(() => {
    document.title = 'LinQ Admin';
    if (!supabase) return;
    const { data } = supabase.auth.onAuthStateChange((event, next) => {
      if (event === 'SIGNED_OUT') {
        client.removeQueries({ queryKey: ['access'] });
        setIdentity(value => value + 1);
      }
      setSession(next);
    });
    return () => data.subscription.unsubscribe();
  }, [client]);
  const token = session?.access_token;
  const access = useQuery({
    queryKey: ['access', session?.user.id, identity],
    queryFn: ({ signal }) => api(token, { view: 'access' }, undefined, signal),
    enabled: Boolean(token),
  });
  if (session === undefined) return <WorkspaceLoading />;
  if (!session) return <SignIn onSignedIn={setSession} />;
  if (access.error && (!access.data || accessDenied(access.error))) return <div className="la-gate"><div className="la-gate-panel"><Brand /><h1>Admin access</h1>
    <Notice error>{access.error.message}</Notice><div className="la-actions"><button className="la-button" onClick={() => { void access.refetch(); }}>Try again</button>
    <button className="la-button" onClick={() => supabase.auth.signOut()}>Sign out</button></div></div></div>;
  if (!access.data) return <WorkspaceLoading checkingAccess />;
  return <Workspace key={session.user.id + ':' + identity + ':' + access.data.role} token={token} access={access.data} />;
}

function AdminNavigation({ token, role, allowed, view, navigate, prefetch, unread }) {
  const apple = useData(token, { view: 'appstore', availability: true }, ['admin','analyst'].includes(role));
  return <nav aria-label="Admin navigation">{allowed.filter(([key]) => key !== 'appstore' || apple.data?.available)
    .map(([key, label, Icon]) => <AdminLink key={key} aria-current={view === key ? 'page' : undefined}
      to={key === 'overview' ? '/admin' : '/admin/' + key} navigate={navigate} prefetch={() => prefetch(key)}>
      <Icon size={18} />{label}{key === 'reports' && unread > 0 && <span className="la-report-count" aria-label={unread + ' open reports'}>{number(unread)}</span>}</AdminLink>)}</nav>;
}

function Workspace({ token, access }) {
  const { role, environment } = access;
  const [client] = useState(createAdminCache);
  const [path, setPath] = useState(() => window.location.pathname + window.location.search);
  const [days, setDays] = useState(30);
  const [tests, setTests] = useState(false);
  const prefetch = useCallback(key => {
    const queries = {
      overview: [{ view: 'overview', days, tests }],
      bookmarks: [{ view: 'bookmarks', days, tests, summary: true },
        { view: 'bookmarks', days, tests, page: 0, status: 'all', source: '' }, { view: 'overview', days, tests }],
      spaces: [{ view: 'spaces', scope: 'all', sort: 'recent', page: 0 }],
      reports: [queueParams('reports')],
      support: [queueParams('support')],
      appstore: [{ view: 'appstore', days }],
    };
    return Promise.all(queries[key].map(params => client.prefetchQuery(adminQuery(token, params))));
  }, [client, token, days, tests]);
  const reportCount = useQuery({ ...adminQuery(token, { view: 'reports', counts: true }),
    enabled: ['admin', 'moderator'].includes(role), refetchInterval: refreshInterval });
  const counts = accessDenied(reportCount.error) ? null : reportCount.data;
  const openReports = counts ? counts.members + counts.links : 0;
  useEffect(() => {
    const onPopState = () => setPath(window.location.pathname + window.location.search);
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);
  function navigate(to) {
    if (window.location.pathname + window.location.search === to) return;
    window.history.pushState(null, '', to);
    setPath(to);
    window.scrollTo(0, 0);
  }
  const allowed = useMemo(() => nav.filter(([, , , roles]) => !roles || roles.includes(role)), [role]);
  const view = allowed.find(([key]) => key === path.split('?')[0].split('/')[2])?.[0] || 'overview';
  useEffect(() => {
    let cancelled = false;
    const timer = window.setTimeout(async () => {
      for (const [key] of allowed) {
        if (cancelled) break;
        if (key !== view && key !== 'appstore') await prefetch(key);
      }
    }, 450);
    return () => { cancelled = true; window.clearTimeout(timer); };
  }, [allowed, prefetch, view]);
  const requestedType = new URLSearchParams(path.split('?')[1]).get('type');
  const initialType = reportTypes.some(([type]) => type === requestedType) || requestedType === 'unanswered' ? requestedType : 'all';
  return <QueryClientProvider client={client}><div className="la-shell">
    <a className="la-skip" href="#admin-content">Skip to content</a>
    <aside className="la-sidebar"><Brand />
      <AdminNavigation token={token} role={role} allowed={allowed} view={view} navigate={navigate} prefetch={prefetch} unread={openReports} />
      <div className="la-side-bottom"><a href="/"><ArrowDownToLine size={16} /> Public site</a>
        <button onClick={() => supabase.auth.signOut()}><LogOut size={16} /> Sign out</button></div>
    </aside>
    <div className="la-body"><header className="la-top"><span>Admin workspace</span><div>
      {environment && <span className="la-environment">{environment}</span>}<span className="la-role">{role}</span>
    </div></header>
      <main id="admin-content" className="la-main">{['reports', 'support'].includes(view)
        ? <Queue key={view + initialType} view={view} token={token} initialType={initialType} access={access} />
        : view === 'appstore' ? <AppStore token={token} days={days} setDays={setDays} />
        : view === 'bookmarks' ? <Bookmarks key={path} initialFilter={requestedType} token={token} days={days}
          setDays={setDays} tests={tests} setTests={setTests} />
        : view === 'spaces' ? <Spaces token={token} />
        : <Overview token={token} role={role} navigate={navigate} days={days} setDays={setDays} tests={tests} setTests={setTests} />}
        <footer><CircleHelp size={15} /> LinQ internal workspace</footer>
      </main>
    </div>
  </div></QueryClientProvider>;
}

export default function Admin() {
  const [client] = useState(createAdminCache);
  return <QueryClientProvider client={client}><AdminGate /></QueryClientProvider>;
}
