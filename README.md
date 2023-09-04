# bus-reminder

![Location Check](https://cronitor.io/badges/8frC2k/production/XcmWhvdYm0OyCRuinS1IP6MEUiE.svg)

A cron-job based personal notification system for myself.

## Purpose

I have a problem with letting time get away from me, and in turn, I have
accidentally missed the last bus several times.

Additionally, I allow my parentals (who live 200 miles away from me) to make
sure I'm safe using the location tracking app Life360. For background, I
consented to this and brought up it's usage in the first place, so I do not mind
it.

After thinking about it, I thought it might be a great idea to use their
location data for myself: I could check my location occasionally, and if I'm
still at the library on weekdays right before the bus stops running, I can send
myself a notification.

And that's pretty much the whole idea.

## Stack

Next.js was complete overkill for this, and in retrospect, using something like
AWS Lambda or Azure Functions may be much more ideal. Even Cloudflare Workers
might be easier (although I require Node APIs, I believe).

- [Next.js][nextjs]
  - Overkill for the most part, I will eventually transfer to AWS Lambda with
    Express
- [`life360-node-api`][life360-node-api] for the Life360 API
- [Vercel][vercel] for Serverless Functions (free)
- [Cronitor][cronitor] for Cron Job Monitoring (free)
- [cron-jobs.org][cron-jobs] for Cron Job Execution
  - Why both, you may ask? I prefer Cronitor's more verbose telemetry API, and I
    plan to switch off Vercel eventually.
  - Vercel has cron jobs, why not use that? Because Vercel requires a Pro plan
    for cron jobs that execute more than once a day. I unfortunately do not need
    anything other than cron jobs.
- [Upstash][upstash] for Redis (free)
- [Discord][discord] to deliver notifications via Bot account.

## Setup

- Requires Node v18 (`Intl.supportedValuesOf` will issue type errors otherwise)
- Requires credentials specified in `.env` (use [`.env.example`](./.env.example) as a template)
  - Redis
  - Discord
  - Life360 (username, password)
  - Optional: Loki (logging)

[nextjs]: https://nextjs.org/
[life360-node-api]: https://github.com/kaylathedev/life360-node-api
[vercel]: https://vercel.com
[cronitor]: https://cronitor.io
[cron-jobs]: https://cron-jobs.org
[upstash]: https://upstash.com
[discord]: https://discord.com
