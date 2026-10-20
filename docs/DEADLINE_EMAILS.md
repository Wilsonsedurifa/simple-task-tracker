# Deadline email reminders

Run migrations before starting workers. Users default to email reminders enabled
and Asia/Manila timezone; both are editable under Settings → Account.
The scheduler checks every 15 minutes. From 8 AM local time it queues a digest of
pending tasks due tomorrow, today, or yesterday. Owners and accepted collaborators
receive reminders; pending invitees do not. There is no recurring overdue nag.
Date-only deadlines mean "tomorrow" is a calendar-day reminder, not exactly 24 hours.

## Local development

Run `php artisan schedule:work` and `php artisan queue:work --tries=3 --timeout=60`
in separate terminals. The default log mailer writes emails to Laravel's logs;
it does not deliver emails. For a one-off check run
`php artisan tasks:send-deadline-reminders`, then process the queue.

## Railway

Keep the existing web service. Add two services from this repository:

- Scheduler start command: `php artisan schedule:work`
- Worker start command: `php artisan queue:work --tries=3 --timeout=60`

All services must use the same persistent database and cache. Set
`QUEUE_CONNECTION=database`, `CACHE_STORE=database`, and the production database
variables on each service. Separate service-local SQLite files cannot share jobs;
use a shared production database for a multi-service deployment.
Ensure service-level commands override the web startCommand in railway.json.
Set APP_URL to the real HTTPS site URL so task links work.

Configure MAIL_MAILER=smtp, MAIL_HOST, MAIL_PORT, MAIL_USERNAME, MAIL_PASSWORD,
MAIL_SCHEME (as required by your provider), MAIL_FROM_ADDRESS and MAIL_FROM_NAME.
Use the provider's verified sender. Never commit credentials.
Run `php artisan migrate --force` before deployment and restart workers after code
changes. Inspect `php artisan queue:failed` and retry failed jobs after repairing
the mail configuration.

## Delivery guarantees

A unique queued job per user prevents overlapping queued digests. Successful
deliveries record each user/task/deadline/reminder kind; retries skip those records.
The job rechecks preferences, access and deadlines at execution time. Mail errors
retry three times with backoff and then appear in failed_jobs.
SMTP cannot guarantee exactly-once delivery: a process crash after SMTP accepts
an email but before the database records it can cause a duplicate on retry.
Changing a deadline creates a new reminder key; returning to an already-notified
deadline does not resend that same reminder.
