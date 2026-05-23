# Compass AI Interface

A web interface for **Compass AI**, a multi-chain USDC yield aggregator
managed by an AI agent across Arc and Arbitrum.

The interface lets users create their Compass account, deposit USDC,
configure risk strategy, and chat with the agent — while the agent
handles cross-chain bridging via Circle Gateway and rebalances yield
across venues like AAVE.

## Accessing the Interface

To access the Compass interface, visit [usecompassai.com](https://usecompassai.com).

## Repository Structure

```
src/
├── app/                  // Next.js App Router pages (chat, dashboard, create, activity)
├── components/
│   ├── account/          // Fund / Withdraw / Send / Session modals
│   ├── chat/             // Streaming chat, tool traces, hero
│   ├── chrome/           // AppHeader, NetworkGuard, UserStatePoller
│   ├── visuals/          // SvgDefs, icons, decorative
│   └── wizard/           // Strategy / market / deposit wizard
├── lib/api.ts            // Backend client (SSE chat, policy, session, balance, ...)
├── store/                // Zustand state (UI, userState)
└── providers.tsx         // wagmi + RainbowKit + React Query
```

## Local Development

```bash
npm install
npm run dev
```

Then open [`http://localhost:3000`](http://localhost:3000).

The interface proxies `/api/*` to the Compass backend via
`next.config.mjs` rewrites. Set the backend URL in `.env.local`:

```
BACKEND_URL=http://localhost:8787
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=<your-walletconnect-id>
```

## Deployment

Deploys to Cloudflare Pages via `@cloudflare/next-on-pages`:

```bash
npm run pages:build      # build artifact
npm run pages:preview    # local preview via wrangler
npm run pages:deploy     # push to Cloudflare
```

## License

MIT — see [LICENSE](./LICENSE).
