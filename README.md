# Shorty

A small URL shortener API built with Hono, TypeScript and Prisma on MongoDB. It creates short codes, redirects visitors and counts clicks.

## The problem

Long links are hard to share and hard to measure. Shorty gives each target URL a six-character code, redirects visitors to the target and keeps a click count. It also has a CLI mode that returns the target without redirecting or counting a click, so a link can be checked without opening it.

## What it does

- **Create a short link**: `POST /` takes the target URL from the query string or a JSON body and returns the full short URL.
- **Redirect**: `GET /:shortUrl` redirects to the target and increments its `clicks` count.
- **Inspect without redirecting**: `GET /:shortUrl?cli=true` returns the target as JSON and does not change the click count.
- **Unique codes**: codes are random base-36 strings. The server checks each one against the database and tries up to 10 times before returning an error.
- **Consistent errors**: JSON responses with 400 for a missing URL, 404 for an unknown code and 500 for server failures, which are also logged.
- **Configuration**: the port comes from `PORT` (default 3000). The returned short URL uses the production host when `NODE_ENV` is `production`.

## How it's built

- **Server**: Hono 4 on `@hono/node-server`, with the built-in logger middleware.
- **Database**: Prisma 5 with the MongoDB provider. One `Url` model (`url`, `shortUrl` with a unique index, `clicks`, timestamps) in `prisma/schema.prisma`.
- **Runtime**: TypeScript run directly with `tsx`. `tsx watch` gives live reload in development.
- **Decision 1: one route, two modes.** The CLI check is a query flag on the same `GET` route rather than a separate endpoint, so both modes share the same lookup.
- **Decision 2: pre-check, then insert.** Before creating a record, `checkShortUrl` looks for a collision. The unique index on `shortUrl` is the final guard.

## Running it locally

Requires Node.js 18 or newer and a MongoDB database.

```bash
pnpm install
```

Create a `.env` file in the project root:

```env
DATABASE_URL="your-mongodb-connection-string"
PORT=3000
```

Then generate the Prisma client and start the dev server:

```bash
pnpm generate
pnpm dev
```

Other scripts: `pnpm studio` (Prisma Studio), `pnpm format` (Prettier), `pnpm start` (generate and start without watching).

## What I learned / what I'd do next

- `POST /` accepts any non-empty string as a URL, and `GET` redirects to whatever was stored. Validate that the target is an `http` or `https` URL before saving it.
- Codes come from `Math.random()`. Use a cryptographically secure generator with a fixed length.
- The check-then-insert step is not atomic. Two requests can pick the same code, and the unique index then makes one of them fail with a 500. Retry on that error instead.
- There are no tests. The redirect, CLI and collision paths are the first ones to cover.
- Every start script runs `api.js` before the server. Review that file, or remove it from the scripts.

## Author

Created by [Mehfooz-ur-Rehman](https://github.com/MehfoozurRehman).
