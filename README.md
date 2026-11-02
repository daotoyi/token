# DyToken

A model gateway and token relay interface inspired by OpenRouter.

The interface supports English and Simplified Chinese, with English as the default language.

## Accounts

The site includes:

- Email verification-code registration and sign-in
- Google, Apple, GitHub, and X OAuth sign-in
- Secure HttpOnly session cookies
- SQLite-backed users, OAuth identities, sessions, and rate-limited email codes

Copy `.env.example` to `.env` for local development. In production, OAuth apps must use
these callback URLs:

```text
https://token.dyinvest.cn/api/auth/oauth/google/callback
https://token.dyinvest.cn/api/auth/oauth/apple/callback
https://token.dyinvest.cn/api/auth/oauth/github/callback
https://token.dyinvest.cn/api/auth/oauth/x/callback
```

Resend over HTTPS is preferred for reliable email delivery. SMTP is also supported.
The local `sendmail` option is disabled by default because many cloud hosts block
outbound port 25.

## Development

```bash
npm install
npm run dev
```

## Production build

```bash
npm run build
```

The static production output is written to `dist/`.

## Deployment

```bash
./scripts/deploy.sh
```

The deploy script uploads `dist/` to `/www/wwwroot/token.dyinvest.cn`.
It also deploys the API to `/opt/dytoken-api`, starts it with PM2, and configures
Nginx to proxy `/api/` to port `4100`.
Token Transfer Station
