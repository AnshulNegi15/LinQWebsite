begin;

create function public.dashboard_product_analytics(p_days integer,p_include_tests boolean)
returns jsonb language sql stable security definer set search_path = '' as $$
with bounds as (
  select (date_trunc('day',now() at time zone 'UTC') - make_interval(days => least(90,greatest(1,p_days))-1))
    at time zone 'UTC' as start_at
), accounts as materialized (
  select u.id,u.created_at from auth.users u
  where not coalesce(u.is_anonymous,false) and (p_include_tests or not exists (
    select 1 from public.dashboard_test_accounts t where t.user_id=u.id
  ))
), active as (
  select distinct d.user_id from public.user_devices d join accounts a on a.id=d.user_id cross join bounds x
  where d.last_active_at >= x.start_at
), savers as (
  select a.id, count(distinct (b.created_at at time zone 'UTC')::date) as save_days
  from public.bookmarks b join accounts a on a.id=coalesce(b.created_by,b.user_id) cross join bounds x
  where b.created_at >= x.start_at group by a.id
)
select jsonb_build_object(
  'updatedAt',now(),
  'activeAccounts',(select count(*) from active),
  'returningAccounts',(select count(*) from active join accounts a on a.id=active.user_id cross join bounds x where a.created_at < x.start_at),
  'repeatSavers',(select count(*) from savers where save_days > 1),
  'saveAccounts',(select count(*) from savers)
);
$$;

create table public.dashboard_apple_daily (
  kind text not null check (kind in ('downloads','crashes')),
  day date not null,
  rows jsonb not null check (jsonb_typeof(rows) = 'array'),
  imported_at timestamptz not null default now(),
  primary key (kind,day)
);
alter table public.dashboard_apple_daily enable row level security;
revoke all on public.dashboard_apple_daily from public, anon, authenticated;
grant select, insert, update on public.dashboard_apple_daily to service_role;

create function public.dashboard_apple_analytics(p_days integer)
returns jsonb language sql stable set search_path = '' as $$
with report_days as materialized (
  select * from public.dashboard_apple_daily
  where day >= (now() at time zone 'UTC')::date - (least(90,greatest(1,p_days))-1)
), downloads as materialized (
  select r.* from report_days d cross join lateral
    jsonb_to_recordset(d.rows) as r(territory text, source text, total bigint) where d.kind='downloads'
), crashes as (
  select r.version, sum(r.total) as total from report_days d cross join lateral
    jsonb_to_recordset(d.rows) as r(version text, total bigint) where d.kind='crashes' group by r.version
), territories as (
  select territory as label,sum(total) as total from downloads group by territory order by total desc,label limit 12
), sources as (
  select source as label,sum(total) as total from downloads group by source order by total desc,label limit 12
), versions as (
  select version as label,total from crashes order by total desc,label limit 12
)
select jsonb_build_object(
  'updatedAt',now(),
  'downloads',(select sum(total) from downloads),
  'crashes',(select sum(total) from crashes),
  'coverage',(select jsonb_object_agg(kind,jsonb_build_object('days',days,'latest',latest,'importedAt',imported_at)) from (
    select kind,count(*) as days,max(day) as latest,max(imported_at) as imported_at from report_days group by kind
  ) b),
  'territories',coalesce((select jsonb_agg(to_jsonb(t) order by total desc,label) from territories t),'[]'::jsonb),
  'sources',coalesce((select jsonb_agg(to_jsonb(s) order by total desc,label) from sources s),'[]'::jsonb),
  'versions',coalesce((select jsonb_agg(to_jsonb(v) order by total desc,label) from versions v),'[]'::jsonb)
);
$$;

revoke all on function public.dashboard_product_analytics(integer,boolean), public.dashboard_apple_analytics(integer)
  from public, anon, authenticated;
grant execute on function public.dashboard_product_analytics(integer,boolean), public.dashboard_apple_analytics(integer) to service_role;
commit;
