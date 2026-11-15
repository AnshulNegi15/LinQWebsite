begin;

-- Allowlist platform categories because source_app may contain a private site's domain.
create function public.dashboard_bookmark_source(value text)
returns text language sql immutable set search_path = '' as $$
  select coalesce((select s.label from (values
    ('YouTube',array['youtube','youtube.com','youtu.be']),
    ('Instagram',array['instagram','instagram.com']),
    ('TikTok',array['tiktok','tiktok.com']),
    ('X',array['x','x.com','twitter','twitter.com']),
    ('LinkedIn',array['linkedin','linkedin.com']),
    ('Reddit',array['reddit','reddit.com']),
    ('Pinterest',array['pinterest','pinterest.com']),
    ('GitHub',array['github','github.com']),
    ('Safari',array['safari','mobile safari','com.apple.mobilesafari']),
    ('Chrome',array['chrome','com.google.chrome','com.google.chrome.ios']),
    ('WhatsApp',array['whatsapp','whatsapp.com','wa.me']),
    ('Unknown',array['','unknown'])
  ) s(label,aliases) where regexp_replace(lower(btrim(coalesce(value,''))),'^www\.','') = any(s.aliases)), 'Other sources');
$$;

create function public.dashboard_bookmark_operations(p_days integer,p_include_tests boolean)
returns table (id uuid, source text, saved_at timestamptz, status text)
language sql stable set search_path = '' as $$
  select b.id,public.dashboard_bookmark_source(b.source_app),b.created_at,
    case
      when e.analysis_status = 'retryable_failure' then 'retryable_failure'
      when e.analysis_status in ('pending','analyzing') then e.analysis_status
      when nullif(btrim(e.summary),'') is not null then 'summary_available'
      else 'no_summary'
    end
  from public.bookmarks b left join public.search_enrichments e on e.bookmark_id=b.id
  where b.created_at >= (date_trunc('day',now() at time zone 'UTC') -
    make_interval(days => least(90,greatest(1,p_days))-1)) at time zone 'UTC'
    and not coalesce(b.is_trashed,false)
    and (p_include_tests or not exists (
      select 1 from public.dashboard_test_accounts t where t.user_id=coalesce(b.created_by,b.user_id)
    ));
$$;

create function public.dashboard_bookmark_health(p_days integer,p_include_tests boolean)
returns jsonb language sql stable security definer set search_path = '' as $$
  with counts as (
    select source, count(*) as total, count(*) filter (where status='summary_available') as summarized,
      count(*) filter (where status='retryable_failure') as retrying,
      count(*) filter (where status in ('pending','analyzing')) as processing,
      count(*) filter (where status='no_summary') as missing
    from public.dashboard_bookmark_operations(p_days,p_include_tests) group by source
  )
  select jsonb_build_object('total',coalesce(sum(total),0),'summarized',coalesce(sum(summarized),0),
    'retrying',coalesce(sum(retrying),0),'processing',coalesce(sum(processing),0),'missing',coalesce(sum(missing),0),
    'sources',coalesce(jsonb_agg(to_jsonb(counts) order by total desc,source),'[]'::jsonb))
  from counts;
$$;

create function public.dashboard_bookmark_rows(
  p_days integer,p_include_tests boolean,p_status text,p_source text,p_page integer
)
returns jsonb language sql stable security definer set search_path = '' as $$
  select coalesce(jsonb_agg(to_jsonb(r) order by r.saved_at desc,r.id desc),'[]'::jsonb)
  from (
    select * from public.dashboard_bookmark_operations(p_days,p_include_tests)
    where (p_status = 'all' or status = p_status or (p_status = 'processing' and status in ('pending','analyzing')))
      and (p_source = '' or source = p_source)
    order by saved_at desc,id desc limit 26 offset (p_page*25)
  ) r;
$$;

create function public.dashboard_spaces_directory(p_actor uuid,p_scope text,p_sort text,p_page integer)
returns jsonb language sql stable security definer set search_path = '' as $$
  with selected as materialized (
    select s.id,case when p_scope='mine' then s.name end as name
    from public.spaces s
    where s.name is distinct from 'Personal' and (p_scope='all' or (
      p_scope='mine' and s.created_by=p_actor and public.is_space_owner(s.id,p_actor)
    ))
  ), membership as (
    select m.space_id,count(distinct m.user_id) as members
    from public.space_members m join selected s on s.id=m.space_id group by m.space_id
  ), shares as (
    select b.space_id,count(*) as bookmarks,
      count(*) filter (where b.created_at >= now()-interval '30 days') as recent,
      count(distinct coalesce(b.created_by,b.user_id)) filter (where b.created_at >= now()-interval '30 days') as contributors
    from public.bookmarks b join selected s on s.id=b.space_id
    where not coalesce(b.is_trashed,false) group by b.space_id
  ), rows as (
    select s.id,s.name,coalesce(m.members,0) as members,coalesce(b.bookmarks,0) as bookmarks,
      coalesce(b.recent,0) as recent,coalesce(b.contributors,0) as contributors
    from selected s left join membership m on s.id=m.space_id left join shares b on s.id=b.space_id
  ), scored as (
    select *,case p_sort when 'members' then members when 'bookmarks' then bookmarks
      when 'contributors' then contributors else recent end as score from rows
  ), paged as (
    select * from scored order by score desc,id limit 26 offset (p_page*25)
  )
  select jsonb_build_object(
    'rows',coalesce((select jsonb_agg(to_jsonb(paged)-'score' order by score desc,id) from paged),'[]'::jsonb),
    'total',(select count(*) from rows),
    'active',(select count(*) from rows where recent>0),
    'multiContributor',(select count(*) from rows where contributors>1)
  );
$$;

create function public.dashboard_space_roster(p_actor uuid,p_space uuid,p_page integer)
returns jsonb language sql stable security definer set search_path = '' as $$
  select case when exists (
    select 1 from public.spaces s where s.id=p_space and s.created_by=p_actor and s.name is distinct from 'Personal'
      and public.is_space_owner(s.id,p_actor)
  ) then (
    select coalesce(jsonb_agg(to_jsonb(r) order by r.role,r.name,r.id),'[]'::jsonb)
    from (
      select m.user_id as id,p.username as name,m.role
      from public.space_members m left join public.profiles p on p.id=m.user_id
      where m.space_id=p_space and m.user_id is not null
      order by m.role,p.username,m.user_id limit 26 offset (p_page*25)
    ) r
  ) end;
$$;

create function public.dashboard_support_signals()
returns jsonb language sql stable set search_path = '' as $$
  with categories as (
    select category,count(*) as total from public.dashboard_cases where status<>'closed' group by category
  )
  select jsonb_build_object(
    'unanswered',(select count(*) from public.dashboard_cases where status<>'closed' and first_response_at is null),
    'categories',coalesce((select jsonb_agg(to_jsonb(categories) order by total desc,category) from categories),'[]'::jsonb)
  );
$$;

create function public.dashboard_has_apple_reports()
returns boolean language sql stable set search_path = '' as $$
  select exists(select 1 from public.dashboard_apple_daily);
$$;

revoke all on function public.dashboard_bookmark_source(text), public.dashboard_bookmark_operations(integer,boolean),
  public.dashboard_bookmark_health(integer,boolean), public.dashboard_bookmark_rows(integer,boolean,text,text,integer),
  public.dashboard_spaces_directory(uuid,text,text,integer), public.dashboard_space_roster(uuid,uuid,integer),
  public.dashboard_support_signals(), public.dashboard_has_apple_reports() from public,anon,authenticated;

grant execute on function public.dashboard_bookmark_health(integer,boolean),
  public.dashboard_bookmark_rows(integer,boolean,text,text,integer),
  public.dashboard_spaces_directory(uuid,text,text,integer), public.dashboard_space_roster(uuid,uuid,integer),
  public.dashboard_support_signals(), public.dashboard_has_apple_reports() to service_role;

create function public.dashboard_moderation_queue(p_status text, p_search text, p_page integer, p_type text, p_severity text)
returns jsonb language sql stable set search_path = '' as $$
  select jsonb_build_object(
    'counts', public.dashboard_report_counts(),
    'rows', coalesce(jsonb_agg(to_jsonb(r) order by r.created_at desc, r.id desc), '[]'::jsonb)
  )
  from (
    select cr.id, cr.report_type, cr.severity, cr.reason, cr.status, cr.created_at, cr.updated_at,
      cr.reporter_id, cr.space_id, cr.bookmark_id,
      s.name as space, coalesce(nullif(cr.snapshot_title,''),nullif(b.title,'')) as bookmark,
      reporter.username as reporter, target.username as target,
      coalesce(cr.reported_user_id,b.created_by,b.user_id) as target_id
    from public.content_reports cr
    left join public.spaces s on s.id = cr.space_id
    left join public.bookmarks b on b.id = cr.bookmark_id
    left join public.profiles reporter on reporter.id = cr.reporter_id
    left join public.profiles target on target.id = coalesce(cr.reported_user_id,b.created_by,b.user_id)
    where (p_status = 'all' or (p_status = 'open' and cr.status in ('pending','under_review')) or cr.status = p_status)
      and (p_type = 'all' or cr.report_type = p_type)
      and (p_severity = 'all' or cr.severity = p_severity)
      and (p_search = '' or strpos(lower(concat_ws(' ',cr.snapshot_title,b.title,s.name,cr.reason,
        reporter.username,target.username,cr.reported_user_id::text)),lower(p_search)) > 0)
    order by cr.created_at desc, cr.id desc limit 26 offset (p_page * 25)
  ) r;
$$;

revoke all on function public.dashboard_moderation_queue(text,text,integer,text,text) from public,anon,authenticated;
grant execute on function public.dashboard_moderation_queue(text,text,integer,text,text) to service_role;

create or replace function public.dashboard_support(p_status text, p_search text, p_page integer)
returns jsonb language sql stable set search_path = '' as $$
select jsonb_build_object(
  'rows', coalesce((select jsonb_agg(to_jsonb(c) order by c.updated_at desc,c.id desc) from (
    select c.* from public.dashboard_cases c
    where (p_status = 'all' or (p_status = 'open' and c.status <> 'closed') or (p_status = 'unanswered' and c.status <> 'closed' and c.first_response_at is null) or c.status = p_status)
      and (p_search = '' or strpos(lower(concat_ws(' ',c.sender,c.subject,c.category)),lower(p_search)) > 0)
    order by c.updated_at desc,c.id desc limit 26 offset (p_page * 25)
  ) c),'[]'::jsonb),
  'oldestOpen', (select min(created_at) from public.dashboard_cases where status <> 'closed'),
  'avgFirstResponseMinutes', (select round(avg(extract(epoch from first_response_at-created_at)/60))
    from public.dashboard_cases where first_response_at is not null)
);
$$;

create function public.dashboard_admin_overview(p_days integer,p_include_tests boolean)
returns jsonb language sql stable security definer set search_path = '' as $$
  with saving_accounts as (
    select coalesce(b.created_by,b.user_id) as id, count(distinct (b.created_at at time zone 'UTC')::date) as days
    from public.bookmarks b
    join auth.users u on u.id=coalesce(b.created_by,b.user_id)
    where not coalesce(u.is_anonymous,false)
      and b.created_at >= (date_trunc('day',now() at time zone 'UTC') -
        make_interval(days => least(90,greatest(1,p_days))-1)) at time zone 'UTC'
      and not coalesce(b.is_trashed,false)
      and (p_include_tests or not exists(select 1 from public.dashboard_test_accounts t where t.user_id=u.id))
    group by 1
  )
  select (public.dashboard_overview(p_days,p_include_tests)-'sources') || jsonb_build_object(
    'reportCounts',public.dashboard_report_counts(),
    'repeatSavers',(select count(*) from saving_accounts where days>1),
    'saveAccounts',(select count(*) from saving_accounts),
    'missingSummaries',(public.dashboard_bookmark_health(p_days,p_include_tests)->'missing'),
    'unanswered',(public.dashboard_support_signals()->'unanswered')
  );
$$;
revoke all on function public.dashboard_admin_overview(integer,boolean) from public,anon,authenticated;
grant execute on function public.dashboard_admin_overview(integer,boolean) to service_role;

commit;
