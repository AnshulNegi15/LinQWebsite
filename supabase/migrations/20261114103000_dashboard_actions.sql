begin;

set local lock_timeout = '3s';
set local statement_timeout = '30s';

create function public.dashboard_enforce_report(p_actor uuid,p_id uuid,p_expected_at timestamptz,p_action text,p_note text)
returns void language plpgsql security definer set search_path = '' as $$
declare
  report public.content_reports%rowtype;
  removed uuid;
begin
  perform 1 from public.dashboard_staff where user_id=p_actor and role='admin' for share;
  if not found then raise insufficient_privilege; end if;
  if nullif(btrim(p_note),'') is null or length(p_note)>4000 then raise check_violation; end if;
  select * into report from public.content_reports where id=p_id for update;
  if not found then raise no_data_found; end if;
  if report.updated_at is distinct from p_expected_at then raise serialization_failure; end if;
  if report.status not in ('pending','under_review') or report.space_id is null then raise check_violation; end if;

  if p_action='delete_bookmark' and report.report_type='bookmark' then
    select b.id into removed from public.bookmarks b
    join public.spaces s on s.id=b.space_id
    where b.id=report.bookmark_id and b.space_id=report.space_id and s.name is distinct from 'Personal'
    for update of b;
    if not found then raise no_data_found; end if;
    update public.content_reports r set snapshot_title=coalesce(r.snapshot_title,b.title),
      snapshot_url=coalesce(r.snapshot_url,b.url)
    from public.bookmarks b where b.id=removed and r.id=p_id;
    delete from public.bookmarks where id=removed;
  elsif p_action='suspend_user' and report.report_type='user' and report.reported_user_id is distinct from p_actor then
    if exists (select 1 from public.dashboard_staff where user_id=report.reported_user_id) then
      raise insufficient_privilege;
    end if;
    update auth.users set banned_until=greatest(banned_until, now()+interval '7 days'),
      updated_at=now() where id=report.reported_user_id;
    if not found then raise no_data_found; end if;
  else
    raise check_violation;
  end if;

  update public.content_reports set status='resolved',updated_at=now(),resolved_at=now(),
    resolved_by=p_actor,resolution_action=p_action,resolution_notes=p_note where id=p_id;
  insert into public.dashboard_audit(actor,target_id,action,detail) values(p_actor,p_id,'report.updated',
    jsonb_build_object('previous',report.status,'status','resolved','enforcement',p_action,'note',p_note,
      'bookmark_id',removed,'reported_user_id',report.reported_user_id));
end;
$$;

alter table public.dashboard_case_entries drop constraint dashboard_case_entries_kind_check;
alter table public.dashboard_case_entries add constraint dashboard_case_entries_kind_check
  check (kind in ('inbound','note','outbound'));

create table public.dashboard_reply_outbox (
  id uuid primary key,
  case_id uuid not null references public.dashboard_cases on delete cascade,
  actor uuid not null,
  body text not null,
  envelope jsonb not null,
  created_at timestamptz not null default now(),
  provider_id text unique
);
alter table public.dashboard_reply_outbox enable row level security;
revoke all on public.dashboard_reply_outbox from public,anon,authenticated;
grant select on public.dashboard_reply_outbox to service_role;
create index dashboard_reply_outbox_case on public.dashboard_reply_outbox(case_id,created_at desc);

create function public.dashboard_case_customer(p_id uuid)
returns uuid language sql stable security definer set search_path = '' as $$
  select case when count(*)=1 then (array_agg(u.id))[1] end
  from public.dashboard_cases c join auth.users u on lower(u.email)=lower(c.sender)
  where c.id=p_id and u.email_confirmed_at is not null and not coalesce(u.is_anonymous,false);
$$;

create function public.dashboard_prepare_reply(p_actor uuid,p_case uuid,p_id uuid,p_body text,p_from text,p_reply_to text)
returns public.dashboard_reply_outbox language plpgsql security definer set search_path = '' as $$
declare
  ticket public.dashboard_cases%rowtype;
  reply public.dashboard_reply_outbox%rowtype;
  parent_id text;
begin
  perform 1 from public.dashboard_staff where user_id=p_actor and role in ('admin','support') for share;
  if not found then raise insufficient_privilege; end if;
  if nullif(btrim(p_body),'') is null or length(p_body)>4000 then raise check_violation; end if;
  select * into ticket from public.dashboard_cases where id=p_case for update;
  if not found then raise no_data_found; end if;
  select * into reply from public.dashboard_reply_outbox where id=p_id;
  if found then
    if reply.case_id<>p_case or reply.actor<>p_actor or reply.body<>p_body then raise check_violation; end if;
    if reply.provider_id is null and reply.created_at < now()-interval '23 hours' then raise check_violation; end if;
    return reply;
  end if;
  if ticket.status='closed' or ticket.sender !~ '^[^[:space:]@,;<>]+@[^[:space:]@,;<>]+$' then raise check_violation; end if;
  if exists(select 1 from public.dashboard_reply_outbox where case_id=p_case and provider_id is null) then
    raise serialization_failure;
  end if;
  select e.message_id into parent_id from public.dashboard_case_entries e
    where e.case_id=p_case and e.kind='inbound' and e.message_id ~ '^<[^[:space:]<>]+>$'
    order by e.created_at desc,e.id desc limit 1;
  insert into public.dashboard_reply_outbox(id,case_id,actor,body,envelope)
  values(p_id,p_case,p_actor,p_body,jsonb_strip_nulls(jsonb_build_object(
    'from',p_from,'to',jsonb_build_array(ticket.sender),
    'subject',case when ticket.subject ~* '^re:' then ticket.subject else 'Re: '||ticket.subject end,
    'reply_to',p_reply_to,'text',p_body,
    'headers',case when parent_id is not null then jsonb_build_object('In-Reply-To',parent_id,'References',parent_id) end
  ))) returning * into reply;
  return reply;
end;
$$;

create function public.dashboard_finish_reply(p_actor uuid,p_case uuid,p_id uuid,p_provider uuid)
returns void language plpgsql security definer set search_path = '' as $$
declare
  reply public.dashboard_reply_outbox%rowtype;
begin
  perform 1 from public.dashboard_staff where user_id=p_actor and role in ('admin','support') for share;
  if not found then raise insufficient_privilege; end if;
  perform 1 from public.dashboard_cases where id=p_case for update;
  if not found then raise no_data_found; end if;
  select * into reply from public.dashboard_reply_outbox where id=p_id and case_id=p_case and actor=p_actor for update;
  if not found then raise no_data_found; end if;
  if reply.provider_id is not null then return; end if;

  update public.dashboard_reply_outbox set provider_id=p_provider::text where id=p_id;
  insert into public.dashboard_case_entries(case_id,kind,body,actor,provider_id)
    values(p_case,'outbound',reply.body,p_actor,p_provider::text);
  update public.dashboard_cases set first_response_at=coalesce(first_response_at,now()),
    status=case when status='closed' or exists (
      select 1 from public.dashboard_case_entries where case_id=p_case and kind='inbound' and created_at>reply.created_at
    ) then status else 'awaiting_customer' end,
    updated_at=now() where id=p_case;
  insert into public.dashboard_audit(actor,target_id,action,detail)
    select p_actor,p_case,'support.updated',jsonb_build_object('email_sent',true,'status',status)
    from public.dashboard_cases where id=p_case;
end;
$$;

create function public.dashboard_discard_rejected_reply(p_actor uuid,p_case uuid,p_id uuid)
returns void language sql security definer set search_path = '' as $$
  delete from public.dashboard_reply_outbox where id=p_id and case_id=p_case and actor=p_actor and provider_id is null
    and exists(select 1 from public.dashboard_staff where user_id=p_actor and role in ('admin','support'));
$$;

revoke all on function public.dashboard_enforce_report(uuid,uuid,timestamptz,text,text),
 public.dashboard_case_customer(uuid),public.dashboard_prepare_reply(uuid,uuid,uuid,text,text,text),
 public.dashboard_finish_reply(uuid,uuid,uuid,uuid),public.dashboard_discard_rejected_reply(uuid,uuid,uuid)
 from public,anon,authenticated;
grant execute on function public.dashboard_enforce_report(uuid,uuid,timestamptz,text,text),
 public.dashboard_case_customer(uuid),public.dashboard_prepare_reply(uuid,uuid,uuid,text,text,text),
 public.dashboard_finish_reply(uuid,uuid,uuid,uuid),public.dashboard_discard_rejected_reply(uuid,uuid,uuid)
 to service_role;
commit;
