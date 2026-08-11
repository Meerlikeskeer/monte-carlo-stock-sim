# Monte Carlo Stock Simulator

Pick a stock, run a Monte Carlo simulation of its possible future price paths, and watch it work: a staged reveal walks through fetching history, estimating drift/volatility, simulating paths, and computing distributions, then shows the simulated paths and the resulting return/final-price distributions.

- **Model**: Geometric Brownian Motion, drift/volatility estimated from the ticker's own recent daily closes.
- **Data**: live-fetched from Yahoo Finance's public chart API (no API key required).
- **Stack**: Vite + React 19 + TypeScript, Tailwind v4, shadcn (Base UI primitives), Convex (compute backend), recharts.

## Develop

Two processes, both from the project root:

```bash
bunx convex dev   # local Convex backend
bun run dev       # Vite dev server
```

## Test

```bash
bun run test        # vitest, once
bun run test:watch  # vitest, watch mode
```

## Build

```bash
bun run build
```

## Project layout

- `convex/lib/` — pure simulation math (GBM path generation, drift/volatility estimation, Yahoo Finance fetch/parse, distribution stats), unit-tested independently of Convex and React.
- `convex/simulate.ts` — the `runSimulation` action tying the above together into one request/response.
- `src/components/simulation/` — the config form, staged-reveal panel, paths chart, and distribution charts.
- `src/hooks/useStagedReveal.ts` — drives the "watch it compute" animation on top of an already-complete result.
