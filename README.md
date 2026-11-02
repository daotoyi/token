# DyToken

A model gateway and token relay interface inspired by OpenRouter.

The interface supports English and Simplified Chinese, with English as the default language.

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
Token Transfer Station
