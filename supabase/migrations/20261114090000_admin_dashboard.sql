begin;

create table public.dashboard_staff (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('admin', 'analyst', 'support', 'moderator'))
);
create table public.dashboard_test_accounts (
  user_id uuid primary key references auth.users(id) on delete cascade
);
create table public.dashboard_cases (
  id uuid primary key default gen_random_uuid(),
  sender text not null,
  subject text not null,
  status text not null default 'new' check (status in ('new','awaiting_staff','awaiting_customer','closed')),
  category text not null default 'general' check (category in ('general','account','sync','billing','bug','other')),
  assignee uuid references auth.users(id) on delete set null,
  first_response_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table public.dashboard_case_entries (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.dashboard_cases on delete cascade,
  kind text not null check (kind in ('inbound','note')),
  body text not null,
  actor uuid,
  provider_id text unique,
  message_id text unique,
  created_at timestamptz not null default now()
);
create table public.dashboard_audit (
  id uuid primary key default gen_random_uuid(),
  actor uuid not null,
  target_id uuid not null,
  action text not null,
  detail jsonb not null default '{}',
  created_at timestamptz not null default now()
);

alter table public.dashboard_staff enable row level security;
alter table public.dashboard_test_accounts enable row level security;
alter table public.dashboard_cases enable row level security;
alter table public.dashboard_case_entries enable row level security;
alter table public.dashboard_audit enable row level security;
revoke all on public.dashboard_staff, public.dashboard_test_accounts, public.dashboard_cases,
  public.dashboard_case_entries, public.dashboard_audit from public, anon, authenticated;
grant select on public.dashboard_staff, public.dashboard_cases,
  public.dashboard_case_entries, public.dashboard_audit to service_role;
grant insert, update on public.dashboard_cases to service_role;
grant insert on public.dashboard_case_entries, public.dashboard_audit to service_role;

create index if not exists dashboard_bookmark_saver_created
  on public.bookmarks ((coalesce(created_by,user_id)), created_at);
create index if not exists dashboard_bookmark_created on public.bookmarks (created_at);

create index dashboard_cases_status_date on public.dashboard_cases (status, updated_at desc);
create index dashboard_entries_case_date on public.dashboard_case_entries (case_id, created_at, id);
create index dashboard_audit_target_date on public.dashboard_audit (target_id, created_at desc);

create function public.dashboard_overview(p_days integer, p_include_tests boolean)
returns jsonb language sql stable security definer set search_path = '' as $$
with
  bounds as (
    select (now() at time zone 'UTC')::date as today,
      (now() at time zone 'UTC')::date - (least(90,greatest(1,p_days)) - 1) as start_date
  ),
  accounts as materialized (
    select u.id, u.created_at, u.email_confirmed_at
    from auth.users u
    where not coalesce(u.is_anonymous, false)
      and (p_include_tests or not exists (
        select 1 from public.dashboard_test_accounts t where t.user_id = u.id
      ))
  ),
  cohort as (
    select a.* from accounts a, bounds x
    where a.created_at >= x.start_date::timestamp at time zone 'UTC'
  ),
  saves as materialized (
    select b.created_at, coalesce(b.created_by,b.user_id) as saver,
      coalesce(nullif(btrim(b.source_app),''),'Unknown') as source, b.space_id
    from public.bookmarks b, bounds x
    where b.created_at >= x.start_date::timestamp at time zone 'UTC'
      and (p_include_tests or not exists (
        select 1 from public.dashboard_test_accounts t where t.user_id = coalesce(b.created_by,b.user_id)
      ))
  ),
  shared as (
    select id, created_at from public.spaces s
    where s.name is distinct from 'Personal' and
      (p_include_tests or not exists (
        select 1 from public.dashboard_test_accounts t where t.user_id = s.created_by
      ))
  ),
  signup_days as (
    select (created_at at time zone 'UTC')::date as day, count(*) as total
    from cohort group by 1
  ),
  save_days as (
    select (created_at at time zone 'UTC')::date as day, count(*) as total
    from saves group by 1
  ),
  sources as (
    select source, count(*) as total from saves group by source order by total desc, source limit 12
  )
select jsonb_build_object(
  'updatedAt', now(),
  'registered', (select count(*) from accounts),
  'verified', (select count(*) from accounts where email_confirmed_at is not null),
  'signups', (select count(*) from cohort),
  'eligible', (select count(*) from cohort where created_at <= now() - interval '24 hours'),
  'activated', (select count(*) from cohort a where a.created_at <= now() - interval '24 hours'
    and exists (select 1 from public.bookmarks b where coalesce(b.created_by,b.user_id) = a.id
      and b.created_at >= a.created_at and b.created_at < a.created_at + interval '24 hours')),
  'saves', (select count(*) from saves),
  'savers', (select count(distinct saver) from saves),
  'spaces', (select count(*) from shared),
  'newSpaces', (select count(*) from shared, bounds x where created_at >= x.start_date::timestamp at time zone 'UTC'),
  'sharingSpaces', (select count(distinct saves.space_id) from saves join shared on shared.id = saves.space_id),
  'sharedSaves', (select count(*) from saves join shared on shared.id = saves.space_id),
  'reports', (select count(*) from public.content_reports where status in ('pending','under_review')),
  'oldestReport', (select min(created_at) from public.content_reports where status in ('pending','under_review')),
  'cases', (select count(*) from public.dashboard_cases where status <> 'closed'),
  'sources', coalesce((select jsonb_agg(to_jsonb(s) order by total desc, source) from sources s),'[]'::jsonb),
  'days', (
    select jsonb_agg(jsonb_build_object('date', d.day::date,'signups',coalesce(a.total,0),
      'saves',coalesce(s.total,0)) order by d.day)
    from bounds x cross join lateral generate_series(x.start_date::timestamp,x.today::timestamp,interval '1 day') d(day)
    left join signup_days a on a.day = d.day::date left join save_days s on s.day = d.day::date
  )
);
$$;

create function public.dashboard_reports(p_status text, p_search text, p_page integer)
returns jsonb language sql stable set search_path = '' as $$
select coalesce(jsonb_agg(to_jsonb(r) order by r.created_at desc,r.id desc),'[]'::jsonb)
from (
  select cr.id, cr.reason, cr.status, cr.created_at, cr.reporter_id, cr.space_id, cr.bookmark_id,
    s.name as space, b.title as bookmark, reporter.username as reporter,
    coalesce(b.created_by,b.user_id) as author_id, author.username as author
  from public.content_reports cr
  left join public.spaces s on s.id = cr.space_id
  left join public.bookmarks b on b.id = cr.bookmark_id
  left join public.profiles reporter on reporter.id = cr.reporter_id
  left join public.profiles author on author.id = coalesce(b.created_by,b.user_id)
  where (p_status = 'all' or (p_status = 'open' and cr.status in ('pending','under_review')) or cr.status = p_status)
    and (p_search = '' or strpos(lower(concat_ws(' ',b.title,s.name,cr.reason,reporter.username,author.username)),lower(p_search)) > 0)
  order by cr.created_at desc,cr.id desc limit 26 offset (p_page * 25)
) r;
$$;

create function public.dashboard_report_url(p_id uuid)
returns text language sql stable set search_path = '' as $$
  select b.url from public.content_reports r join public.bookmarks b on b.id=r.bookmark_id where r.id=p_id;
$$;

create function public.dashboard_support(p_status text, p_search text, p_page integer)
returns jsonb language sql stable set search_path = '' as $$
select jsonb_build_object(
  'rows', coalesce((select jsonb_agg(to_jsonb(c) order by c.updated_at desc,c.id desc) from (
    select c.* from public.dashboard_cases c
    where (p_status = 'all' or (p_status = 'open' and c.status <> 'closed') or c.status = p_status)
      and (p_search = '' or strpos(lower(concat_ws(' ',c.sender,c.subject,c.category)),lower(p_search)) > 0)
    order by c.updated_at desc,c.id desc limit 26 offset (p_page * 25)
  ) c),'[]'::jsonb),
  'oldestOpen', (select min(created_at) from public.dashboard_cases where status <> 'closed'),
  'avgFirstResponseMinutes', (select round(avg(extract(epoch from first_response_at-created_at)/60))
    from public.dashboard_cases where first_response_at is not null)
);
$$;

create function public.dashboard_record_inbound(
  p_provider_id text, p_message_id text, p_references text[], p_from text, p_subject text, p_body text, p_received timestamptz
) returns uuid language plpgsql set search_path = '' as $$
declare
  target uuid;
begin
  perform pg_advisory_xact_lock(hashtextextended(coalesce(p_message_id,p_provider_id), 407));
  select case_id into target from public.dashboard_case_entries
    where provider_id = p_provider_id or message_id = p_message_id limit 1;
  if found then return target; end if;
  select c.id into target from public.dashboard_case_entries e
    join public.dashboard_cases c on c.id=e.case_id
    where e.message_id=any(p_references) and lower(c.sender)=lower(p_from)
    order by e.created_at desc limit 1 for update of c;
  if target is null then
    insert into public.dashboard_cases(sender,subject,created_at,updated_at)
      values(p_from,p_subject,p_received,p_received) returning id into target;
  else
    update public.dashboard_cases set status='awaiting_staff', updated_at=greatest(updated_at,p_received)
      where id=target;
  end if;
  insert into public.dashboard_case_entries(case_id,kind,body,provider_id,message_id,created_at)
    values(target,'inbound',p_body,p_provider_id,p_message_id,p_received);
  return target;
end;
$$;

create function public.dashboard_update_case(
  p_actor uuid, p_id uuid, p_status text, p_category text, p_assignment text, p_note text, p_record_reply boolean
) returns void language plpgsql security definer set search_path = '' as $$
declare
  prior public.dashboard_cases%rowtype;
begin
  perform 1 from public.dashboard_staff where user_id=p_actor and role in ('admin','support') for share;
  if not found then raise insufficient_privilege; end if;
  select * into prior from public.dashboard_cases where id=p_id for update;
  if not found then raise no_data_found; end if;
  if p_assignment not in ('self','clear','unchanged') and not exists (
    select 1 from public.dashboard_staff where user_id=p_assignment::uuid and role in ('admin','support')
  ) then raise check_violation; end if;
  update public.dashboard_cases set
    status=p_status, category=p_category,
    assignee=case p_assignment when 'self' then p_actor when 'clear' then null
      when 'unchanged' then prior.assignee else p_assignment::uuid end,
    first_response_at=case when p_record_reply then coalesce(prior.first_response_at,now()) else prior.first_response_at end,
    updated_at=now() where id=p_id;
  if p_note <> '' then
    insert into public.dashboard_case_entries(case_id,kind,body,actor) values(p_id,'note',p_note,p_actor);
  end if;
  insert into public.dashboard_audit(actor,target_id,action,detail) values(p_actor,p_id,'support.updated',
    jsonb_build_object('status',p_status,'previous_status',prior.status,'category',p_category,
      'assignment',p_assignment,'added_note',p_note<>'','recorded_reply',p_record_reply));
end;
$$;

create function public.dashboard_update_report(p_actor uuid,p_id uuid,p_status text,p_note text)
returns void language plpgsql security definer set search_path = '' as $$
declare
  prior text;
begin
  perform 1 from public.dashboard_staff where user_id=p_actor and role in ('admin','moderator') for share;
  if not found then raise insufficient_privilege; end if;
  if p_status not in ('pending','under_review','resolved','dismissed') then raise check_violation; end if;
  select status into prior from public.content_reports where id=p_id for update;
  if not found then raise no_data_found; end if;
  update public.content_reports set status=p_status,updated_at=now() where id=p_id;
  insert into public.dashboard_audit(actor,target_id,action,detail) values(p_actor,p_id,'report.updated',
    jsonb_build_object('previous_status',prior,'status',p_status,'note',p_note));
end;
$$;

revoke all on function public.dashboard_overview(integer,boolean), public.dashboard_reports(text,text,integer), public.dashboard_report_url(uuid),
  public.dashboard_support(text,text,integer), public.dashboard_record_inbound(text,text,text[],text,text,text,timestamptz),
  public.dashboard_update_case(uuid,uuid,text,text,text,text,boolean),
  public.dashboard_update_report(uuid,uuid,text,text) from public,anon,authenticated;
grant execute on function public.dashboard_overview(integer,boolean), public.dashboard_reports(text,text,integer), public.dashboard_report_url(uuid),
  public.dashboard_support(text,text,integer), public.dashboard_record_inbound(text,text,text[],text,text,text,timestamptz),
  public.dashboard_update_case(uuid,uuid,text,text,text,text,boolean),
  public.dashboard_update_report(uuid,uuid,text,text) to service_role;
commit;
