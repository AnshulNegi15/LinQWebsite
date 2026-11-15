begin;

create function public.dashboard_report_counts()
returns jsonb language sql stable set search_path = '' as $$
  select jsonb_build_object(
    'members', count(*) filter (where report_type = 'user'),
    'links', count(*) filter (where report_type = 'bookmark')
  )
  from public.content_reports where status in ('pending','under_review');
$$;

create function public.dashboard_moderation_queue(p_status text, p_search text, p_page integer, p_type text)
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
      and (p_search = '' or strpos(lower(concat_ws(' ',cr.snapshot_title,b.title,s.name,cr.reason,
        reporter.username,target.username,cr.reported_user_id::text)),lower(p_search)) > 0)
    order by cr.created_at desc, cr.id desc limit 26 offset (p_page * 25)
  ) r;
$$;

create function public.dashboard_report_evidence(p_id uuid)
returns jsonb language sql stable set search_path = '' as $$
  select jsonb_build_object('url',coalesce(nullif(r.snapshot_url,''),b.url),'details',r.details,
    'resolutionAction',r.resolution_action,'resolvedAt',r.resolved_at)
  from public.content_reports r left join public.bookmarks b on b.id = r.bookmark_id where r.id = p_id;
$$;

create function public.dashboard_review_report(p_id uuid, p_actor uuid, p_status text, p_note text, p_expected_at timestamptz)
returns void language plpgsql security definer set search_path = '' as $$
declare
  prior public.content_reports%rowtype;
  terminal boolean := p_status in ('resolved','dismissed');
begin
  perform 1 from public.dashboard_staff where user_id = p_actor and role in ('admin','moderator') for share;
  if not found then raise insufficient_privilege; end if;
  if p_status is null or p_status not in ('pending','under_review','resolved','dismissed') or
      length(coalesce(p_note,'')) > 4000 or p_expected_at is null then raise check_violation; end if;
  select * into prior from public.content_reports where id = p_id for update;
  if not found then raise no_data_found; end if;
  if prior.updated_at is distinct from p_expected_at then raise serialization_failure; end if;
  if p_status = prior.status and nullif(btrim(p_note),'') is null then return; end if;
  update public.content_reports set status = p_status, updated_at = now(),
    resolved_by = case when p_status = prior.status then prior.resolved_by when terminal then p_actor end,
    resolved_at = case when p_status = prior.status then prior.resolved_at when terminal then now() end,
    resolution_action = case when p_status = prior.status then prior.resolution_action when terminal then 'dashboard_review' end,
    resolution_notes = case when p_status = prior.status then prior.resolution_notes when terminal then nullif(btrim(p_note),'') end
  where id = p_id;
  insert into public.dashboard_audit(actor,target_id,action,detail) values(p_actor,p_id,'report.updated',
    jsonb_build_object('previous',prior.status,'status',p_status,'note',nullif(btrim(p_note),'')));
end;
$$;

revoke all on function public.dashboard_report_counts(), public.dashboard_moderation_queue(text,text,integer,text),
  public.dashboard_report_evidence(uuid), public.dashboard_review_report(uuid,uuid,text,text,timestamptz) from public, anon, authenticated;
grant execute on function public.dashboard_report_counts(), public.dashboard_moderation_queue(text,text,integer,text),
  public.dashboard_report_evidence(uuid), public.dashboard_review_report(uuid,uuid,text,text,timestamptz) to service_role;
commit;
