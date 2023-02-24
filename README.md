# bus-reminder

A cron-job based personal notification system for myself.

## Purpose

I have a problem with letting time get away from me, and in turn, I have accidentally missed the last bus several times.

Additionally, I allow my parentals (who live 200 miles away from me) to make sure I'm safe using the location tracking app Life360. For background, I consented to this and brought up it's usage in the first place, so I do not mind it.

After thinking about it, I thought it might be a great idea to use their location data for myself: I could check my location occasionally, and if I'm still at the library on weekdays right before the bus stops running, I can send myself a notification.

And that's pretty much the whole idea.

## Stack

Next.js was complete overkill for this, and in retrospect, using something like AWS Lambda or Azure Functions may be much more ideal. Even Cloudflare Workers might be easier (although I require Node APIs, I believe).

- [Next.js][nextjs]
- [`life360-node-api`][life360-node-api] for the Life360 API
- [Vercel][vercel] for Serverless Functions
- [Cronitor][cronitor] for Cron Job Monitoring
- [cron-jobs.org][cron-jobs] for Cron Job Execution
  - Why both, you may ask? I prefer Cronitor's more verbose telemetry API, and I plan to switch off Vercel eventually.
  - Vercel has cron jobs, why not use that? Because Vercel requires a Pro plan for cron jobs that execute more than once a day. I unfortunately do not need anything other than cron jobs.

[nextjs]: https://nextjs.org/
[life360-node-api]: https://github.com/kaylathedev/life360-node-api
[vercel]: https://vercel.com
[cronitor]: https://cronitor.io
[cron-jobs]: https://cron-jobs.org


## TODO
- Integrate Discord notifications
- Create system for dynamically disabling the check for the rest of the day ([Upstash](upstash.com) for Redis)