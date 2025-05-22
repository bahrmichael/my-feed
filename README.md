# My Feed - RSS Feed Reader

## Architecture

This project uses Vercel's serverless architecture to create a personal RSS feed reader:

1. **Scheduled Feed Fetching**: A Vercel cron job runs hourly to fetch and process RSS feeds
2. **Data Storage**: Vercel Postgres stores the feed items
3. **API Endpoints**: Serverless functions provide access to the stored feed items

## Setup

1. Deploy to Vercel and set up a Postgres database through the Vercel dashboard
2. Set the environment variable `CRON_SECRET` with a secure random string
3. Install dependencies: `npm install`
4. Run locally: `npm run dev`

## API Endpoints

### `/api/feed`

Get your feed items with optional pagination:

```
GET /api/feed?limit=20&offset=0
```

### `/api/cron/fetch-feed`

Endpoint for the Vercel cron job to fetch and process the RSS feed. Protected by the `CRON_SECRET` token.

## Environment Variables

- `CRON_SECRET`: Secret key for cron job authentication
- `POSTGRES_URL`: Automatically provided by Vercel