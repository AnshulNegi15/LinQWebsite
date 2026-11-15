# LinQ admin workspace

The dashboard lives at `/admin`. Staff sign in with a Supabase account and verify an authenticator code before loading dashboard data. A staff account can enroll its authenticator after the server checks its access.

1. In Vercel, confirm this repository’s **Root Directory** is `frontend`. Build with `npm run build` and use `dist` as the output directory. Copy the names in [frontend/.env.example](frontend/.env.example) to the preview project. Set the browser and server Supabase URLs to LinQ-org, and keep the environment label as **Testing**. Use the same project for both keys. The service role key belongs only in the server environment.
2. Review and apply [the migration](supabase/migrations/20261114090000_admin_dashboard.sql) to LinQ-org. It assumes the existing LinQ Auth, bookmarks, Spaces and link-report schema. The migration runs in a transaction. Add staff by their Supabase Auth UUID through the SQL editor. `admin` has access to all sections. `analyst` can view aggregates, `support` can also manage cases, and `moderator` can also review reported links. A Space role does not grant website access.

   ```sql
   insert into public.dashboard_staff(user_id, role) values ('<staff-account-uuid>', 'admin');
   insert into public.dashboard_test_accounts(user_id) values ('<test-account-uuid>');
   ```

3. For support intake, set up a Resend receiving address and route incoming `support@trylinq.tech` mail to it using your current mail provider. Keep the existing inbox reachable for replies. Set the receiving address as `SUPPORT_INBOUND_ADDRESS`, then configure Resend to send the **email.received** event to `/api/support-inbound`. Set the server API key and the signing secret for this endpoint in Vercel. Send a test message, redeliver the webhook, and confirm there is one case. Test a threaded reply using the original `Message-ID` or `References`. If your forwarding changes the sender or message headers, configure it to preserve them before using the inbox.
4. Preview with one authorized staff account and one ordinary app account. Check logged-out access, rejection of the ordinary account, a staff login requiring MFA, role-specific API access, case updates, and report updates. Compare dashboard totals with Supabase for the same UTC date range.

For local testing, copy `frontend/.env.example` to `frontend/.env.local` if the file is absent. Set both Supabase URLs, the publishable key, and the server key there, then restart `npm run dev` from `frontend`. It serves both the site and admin API at [127.0.0.1:5173/admin](http://127.0.0.1:5173/admin). LinQ-org already has all five dashboard migrations. Apply them in order only when setting up another compatible project. Add a staff role for an existing app account before signing in.

The overview groups by UTC day. Overview, Bookmarks and Spaces reuse the same response for the selected filters. The active dashboard or queue refreshes every 60 seconds while the browser tab is visible. Previously loaded data stays visible during refresh. Browser reload and the in-page Refresh button fetch directly from Supabase. The cache stays in memory for the signed-in workspace. New accounts exclude Supabase anonymous accounts if present. Include test accounts controls counts based on the explicit test account list. The support and moderation queue counts reflect current open work.

First save uses still-present synced bookmark rows for accounts that have had a full 24 hours to save. Shared Space metrics follow the app’s current `Personal` name convention. Reports distinguish the reporter from the reported member. The web review updates report status and audit history without removing shared content. The current iOS moderation screen shows pending reports only, so reports moved to Under review stay in the web queue.

Support ingests plain-text email, groups known replies using message headers, and tracks assignment, notes, category and status. When Resend is configured, staff reply directly from the dashboard and first-response time is recorded after Resend accepts the message. The support inbox does not backfill historical mail or display attachments. The dashboard reads from the existing LinQ reports table.

## Reports and analytics

Apply these migrations in order after the dashboard migration:

1. [Moderation](supabase/migrations/20261114093000_dashboard_moderation.sql) requires the LinQ iOS schema through Database/Migrations/20_moderation_dashboard_and_audit_trail.sql.
2. [Analytics](supabase/migrations/20261114094500_dashboard_analytics.sql) reads existing device activity and bookmark records and creates the Apple aggregate store.

The Reports queue includes member and link reports. The row shows the latest status, and evidence prefers the recorded snapshot for the title and URL. A status update and its audit entry are saved in the same transaction. If another staff member updated the report first, refresh the queue and reopen it before retrying. Review does not delete content or block members. The native app still owns report submission.

Product usage counts distinct accounts with a device heartbeat in the selected UTC date range. Returning accounts were registered before that range. Repeat savers have still-present synced bookmarks created on two or more UTC dates inside the range. These are period activity metrics. Native save-to-sync latency, retries, and search outcomes have no existing event data for this dashboard.

App Store uses the standard daily App Store Downloads and App Crashes reports from the Apple Analytics Reports API. Obtain all finalized daily segments for one kind and date before importing. From the frontend directory, run the importer with the Apple app ID and the segment files:

    node --env-file=.env.local server/import-apple.mjs downloads YYYY-MM-DD APPLE_APP_ID FILE [FILE …]
    node --env-file=.env.local server/import-apple.mjs crashes YYYY-MM-DD APPLE_APP_ID FILE [FILE …]

The importer accepts TSV and gzip files. Submit each segment once for that import, and submit the complete day together. Reimporting replaces that kind and day's aggregate, so reimport all segments when Apple issues a correction. The dashboard shows the number and latest date of imported days. Downloads exclude updates and restores. Apple crash totals depend on opt-in coverage. Missing reports display unavailable data. The dashboard reads these aggregates from Supabase when refreshed. Apple imports are manual.

- https://developer.apple.com/documentation/analytics-reports/app-download
- https://developer.apple.com/documentation/analytics-reports/app-crashes
- https://developer.apple.com/documentation/analytics-reports/data-completeness-corrections


## Bookmarks and Spaces dashboard

Apply [Bookmarks and Spaces](supabase/migrations/20261114101000_dashboard_bookmarks_spaces.sql)
after the moderation and analytics migrations. Overview shows repeat saving and links to open work.
Bookmarks and Spaces require the admin or analyst role and MFA. App Store appears in navigation
once at least one actual Apple report has been imported.

The bookmark operations view groups the stored source into known platform categories. It returns
bookmark ID, platform, UTC save time and summary status. It excludes local-only and trashed
bookmarks. Summary coverage uses all the synced saves listed in the selected range. The current
app syncs completed enrichments, so a missing summary says nothing definitive about AI failures.
The existing enrichment update timestamp does not measure first-ready time. Auto-collection
outcomes, eligible save count and native retry history have no reliable server-side measurement.

All Spaces returns Space IDs and counts. My Spaces requires both original creator and current
owner, including for each roster request. Roster responses include display names and roles.
Names of other private Spaces, member identities and bookmark contents are outside staff analytics.
Space activity uses a rolling 30-day window. Support shows open case categories and unanswered
cases. Reports supports severity filters.


## Report enforcement and direct support replies

The website preloads the first view of allowed tabs after sign-in. It also warms the cache
when focus or the pointer reaches a navigation link or queue row. Reports show an open
count and a marker beside pending reports. Report evidence includes the submitter's notes
when provided.

The two actions below require applying
[the reviewed dashboard actions migration](supabase/migrations/20261114103000_dashboard_actions.sql).
Both feature switches default to off.

- Set `DASHBOARD_REPORT_ENFORCEMENT=true` to enable admin-only enforcement. The admin
  confirms the action and supplies a reason. Deletion is scoped to the reported bookmark
  in its original shared Space and retains report evidence. Member reports can trigger
  a 7-day Auth sign-in suspension. This does not immediately eject existing sessions.
  Staff accounts are protected from these report-based suspensions. Status-only reviews
  and dismissals are still available to moderators.
- Set `DASHBOARD_SUPPORT_REPLIES=true` after the migration. Configure
  `SUPPORT_FROM_ADDRESS` on a verified Resend sending domain and `SUPPORT_REPLY_TO_ADDRESS`
  as the inbox address whose replies reach the inbound Resend webhook. Configure
  `RESEND_SEND_API_KEY` or use an existing sending-capable `RESEND_API_KEY`. Inbound
  requires the existing receiving key, webhook secret and recipient. Localhost cannot
  receive a Resend webhook directly without a public endpoint.
- Support shows a LinQ account ID only when the inbound sender matches one confirmed
  account email. That is an account lookup, and unauthenticated incoming email alone
  cannot prove who wrote it. Replies go to the case sender stored on the server. The
  console never uses a typed address or an ID from the message to choose the recipient.
- Outbound replies store the exact mail payload before sending and use a stable Resend
  idempotency key. A confirmed reply appears in the case and records the first response.
  If a send is still unconfirmed, the original sender can retry it within 23 hours.
  Investigate expired sends in Resend before unblocking that case. A successful API
  response means Resend accepted the message for delivery.
