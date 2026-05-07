# QuantTriage

QuantTriage is a full-stack systems risk engineering app for simulated trading infrastructure. It monitors system state, detects invariant violations, scores operational and financial risk, and recommends ranked containment actions for engineers under time pressure.

This is not a SOC tool, SIEM, pentesting project, or compliance dashboard. It is correctness-first engineering, internal risk observability, and human-in-the-loop decision support.

## Stack

- React + Vite frontend
- Node.js + Express backend
- In-memory data store
- REST API
- Plain CSS with polished light UI and animations

## Run locally

### Terminal 1: Backend

```bash
cd quanttriage/server
npm install
npm run dev
```

Backend runs on:

```bash
http://localhost:5001
```

Test it:

```bash
curl http://localhost:5001/api/state
```

### Terminal 2: Frontend

```bash
cd quanttriage/client
npm install
npm run dev
```

Open the Vite URL, usually:

```bash
http://localhost:5173
```

## Demo flow

1. Start backend.
2. Start frontend.
3. Open dashboard.
4. Show NORMAL mode.
5. Click Inject Position Breach.
6. Show invariant violation.
7. Show risk score changing.
8. Show incident creation.
9. Show recommended actions.
10. Click Resolve System.
11. Show system returning to NORMAL mode.

## API routes

- GET /api/state
- GET /api/events
- GET /api/incidents
- POST /api/inject/:type
- PATCH /api/incidents/:id/resolve
- POST /api/resolve

## Injection types

- PRICE_SPIKE
- POSITION_LIMIT_BREACH
- LATENCY_SPIKE
- ORDER_FLOOD
- NEGATIVE_BALANCE
- DATABASE_DELAY
