import { store } from "../data/store.js";

function activeIncidents() {
  return store.incidents.filter((i) => i.status === "ACTIVE");
}

function topPositions() {
  return Object.entries(store.accounts.acct_001.positions)
    .map(([symbol, qty]) => {
      const price = store.market[symbol]?.price || 0;
      return {
        symbol,
        qty,
        price,
        notional: Number((Math.abs(qty) * price).toFixed(2))
      };
    })
    .sort((a, b) => Math.abs(b.qty) - Math.abs(a.qty))
    .slice(0, 5);
}

function biggestMovers() {
  return Object.values(store.market)
    .map((asset) => ({
      symbol: asset.symbol,
      price: asset.price,
      changePercent: asset.changePercent || 0,
      sector: asset.sector || "Unknown"
    }))
    .sort((a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent))
    .slice(0, 5);
}

function snapshot() {
  return {
    state: store.state,
    account: store.accounts.acct_001,
    activeIncidents: activeIncidents(),
    topPositions: topPositions(),
    biggestMovers: biggestMovers(),
    recentTrades: store.trades.slice(0, 8),
    recentOrders: store.orders.slice(0, 8),
    recentEvents: store.events.slice(0, 8)
  };
}

function includesAny(text, words) {
  return words.some((word) => text.includes(word));
}

function formatMoney(num) {
  return `$${Number(num || 0).toLocaleString()}`;
}

function answerSystemStatus(ctx) {
  return `QuantTriage is currently in ${ctx.state.mode} mode with a ${ctx.state.riskScore}/100 risk score and ${ctx.state.severity} severity. Main cause: ${ctx.state.mainCause}. Current balance is ${formatMoney(ctx.state.balance)}, equity is ${formatMoney(ctx.state.equity)}, gross position is ${ctx.state.position}/${ctx.state.maxPosition}, latency is ${ctx.state.latencyMs}ms, and order rate is ${ctx.state.orderRate}/min.`;
}

function answerRisk(ctx) {
  if (ctx.activeIncidents.length === 0) {
    return `The biggest risk right now is not an active incident, it is drift. The system is normal, but the key things to watch are gross position, order rate, latency, and market-data freshness. Current risk is ${ctx.state.riskScore}/100, so nothing is urgent yet.`;
  }

  const incident = ctx.activeIncidents[0];

  return `The biggest risk right now is ${incident.title}. It violated ${incident.brokenRule}. Risk is ${ctx.state.riskScore}/100 with ${ctx.state.severity} severity. Why it matters: ${incident.explanation} First action: ${incident.recommendedActions?.[0] || "Contain the system and investigate."}`;
}

function answerMarket(ctx) {
  const movers = ctx.biggestMovers
    .map((m) => `${m.symbol} ${m.changePercent}% at $${m.price}`)
    .join(", ");

  return `The main market signals right now are: ${movers || "no strong movers yet"}. In this app, big market moves matter because they increase order flow, position exposure, and latency pressure. That can create a chain reaction: market move → more orders → higher order rate → latency pressure → invariant violation.`;
}

function answerTrades(ctx) {
  if (ctx.recentTrades.length === 0) {
    return `No trades have printed yet. Let the simulator run for a few seconds, then ask again.`;
  }

  const trades = ctx.recentTrades
    .slice(0, 5)
    .map((t) => `${t.side} ${t.qty} ${t.symbol} at $${t.price}`)
    .join("; ");

  return `Recent trades: ${trades}. The main thing to check is whether fills are creating concentrated exposure in one symbol or sector. Concentration matters because it can push gross position above the invariant limit.`;
}

function answerVulnerabilities(ctx) {
  const concerns = [];

  if (ctx.state.orderRate > 500) concerns.push("order flood risk");
  if (ctx.state.latencyMs > 250) concerns.push("latency/stale execution risk");
  if (ctx.state.position > ctx.state.maxPosition) concerns.push("position-limit breach");
  if (ctx.state.balance < 0) concerns.push("negative balance/capital-control failure");
  if (ctx.activeIncidents.length > 0) concerns.push("unresolved active incidents");

  if (concerns.length === 0) {
    return `No critical vulnerability is active right now. The main concerns to keep watching are replay-like order bursts, stale market data, weak rate limiting, runaway position growth, negative balance risk, and delayed incident response.`;
  }

  return `The main vulnerabilities or concerns are: ${concerns.join(", ")}. From a systems-security angle, the highest-risk pattern is a chain reaction where market volatility increases order flow, order flow increases latency, and latency causes stale or unsafe trading decisions.`;
}

function answerActions(ctx) {
  if (ctx.activeIncidents.length === 0) {
    return `No emergency action is needed. Keep monitoring the system. The next improvement I would build is automatic containment: rate-limit order floods, freeze trading on critical risk, and auto-flag stale market data.`;
  }

  const incident = ctx.activeIncidents[0];

  return `For ${incident.title}, do this in order: ${incident.recommendedActions.join(" → ")}. Containment comes first because the goal is to reduce risk before doing root-cause analysis.`;
}

function answerArchitecture(ctx) {
  return `QuantTriage works through this loop: live/simulated market data → generated orders → filled trades → account exposure → invariant engine → risk engine → incident creation → AI risk analyst. The important part is that the AI is not guessing from nothing. It reads the current backend state, active incidents, recent trades, market movers, order rate, latency, and broken invariants.`;
}

function answerCustomFallback(ctx, question) {
  return `Based on the current QuantTriage context, here is the best answer: the system is ${ctx.state.mode}, risk is ${ctx.state.riskScore}/100, severity is ${ctx.state.severity}, and the main cause is ${ctx.state.mainCause}. Your question was: "${question}". If you are asking about safety, the most important checks are position <= maxPosition, balance >= 0, latencyMs <= 250, orderRate <= 500, and riskScore < 80.`;
}

export function askAIAnalyst(question) {
  const q = question.toLowerCase();
  const ctx = snapshot();

  let answer;

  if (includesAny(q, ["status", "state", "program", "app", "system", "what is happening"])) {
    answer = answerSystemStatus(ctx);
  } else if (includesAny(q, ["risk", "danger", "biggest issue", "problem", "bad"])) {
    answer = answerRisk(ctx);
  } else if (includesAny(q, ["market", "stock", "price", "wall street", "mover"])) {
    answer = answerMarket(ctx);
  } else if (includesAny(q, ["trade", "order", "fill", "bought", "sold"])) {
    answer = answerTrades(ctx);
  } else if (includesAny(q, ["vulnerability", "security", "attack", "concern", "weakness", "exploit"])) {
    answer = answerVulnerabilities(ctx);
  } else if (includesAny(q, ["fix", "resolve", "action", "do next", "engineer"])) {
    answer = answerActions(ctx);
  } else if (includesAny(q, ["architecture", "how does it work", "backend", "flow", "pipeline"])) {
    answer = answerArchitecture(ctx);
  } else {
    answer = answerCustomFallback(ctx, question);
  }

  return {
    role: "QuantTriage AI Analyst",
    question,
    answer,
    timestamp: new Date().toISOString()
  };
}