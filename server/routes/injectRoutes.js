import express from "express";
import { store, addEvent, createId, resetStore } from "../data/store.js";
import { checkInvariants } from "../engine/invariantEngine.js";
import { calculateRisk } from "../engine/riskEngine.js";
import { getRecommendedActions } from "../engine/decisionEngine.js";

const router = express.Router();

const injectionMessages = {
  PRICE_SPIKE: "External price movement detected. Market data requires validation.",
  POSITION_LIMIT_BREACH: "Position exceeded max exposure threshold.",
  LATENCY_SPIKE: "Service latency crossed safe execution threshold.",
  ORDER_FLOOD: "Order rate surged above expected operating range.",
  NEGATIVE_BALANCE: "Balance dropped below zero after unsafe transaction path.",
  DATABASE_DELAY: "Database response delay is affecting trading workflow reliability."
};

function normalizeType(type) {
  const key = type.toUpperCase();
  const aliases = {
    PRICE_SPIKE: "PRICE_SPIKE",
    PRICE: "PRICE_SPIKE",
    POSITION_BREACH: "POSITION_LIMIT_BREACH",
    POSITION_LIMIT_BREACH: "POSITION_LIMIT_BREACH",
    POSITION: "POSITION_LIMIT_BREACH",
    LATENCY_SPIKE: "LATENCY_SPIKE",
    LATENCY: "LATENCY_SPIKE",
    ORDER_FLOOD: "ORDER_FLOOD",
    FLOOD: "ORDER_FLOOD",
    NEGATIVE_BALANCE: "NEGATIVE_BALANCE",
    BALANCE: "NEGATIVE_BALANCE",
    DATABASE_DELAY: "DATABASE_DELAY",
    DATABASE: "DATABASE_DELAY"
  };

  return aliases[key] || key;
}

function mutateState(type) {
  const state = store.state;
  state.mode = "TRIAGE";

  if (type === "PRICE_SPIKE") {
    state.position = Math.max(state.position, 430);
    state.latencyMs = Math.max(state.latencyMs, 145);
  }

  if (type === "POSITION_LIMIT_BREACH") {
    state.position = state.maxPosition + 165;
  }

  if (type === "LATENCY_SPIKE") {
    state.latencyMs = 360;
  }

  if (type === "ORDER_FLOOD") {
    state.orderRate = 720;
  }

  if (type === "NEGATIVE_BALANCE") {
    state.balance = -25000;
    state.position = state.maxPosition + 85;
  }

  if (type === "DATABASE_DELAY") {
    state.latencyMs = 290;
    state.orderRate = Math.max(state.orderRate, 390);
  }

  state.financialExposure = Math.abs(state.position) * 1250;
}

function createIncidents(brokenInvariants, risk) {
  const activeTypes = new Set(store.incidents.filter((item) => item.status === "ACTIVE").map((item) => item.type));
  const newIncidents = [];

  for (const broken of brokenInvariants) {
    if (activeTypes.has(broken.type)) continue;

    const incident = {
      id: createId("inc"),
      type: broken.type,
      title: broken.title,
      brokenRule: broken.rule,
      severity: risk.severity === "CRITICAL" ? "CRITICAL" : broken.severity,
      riskScore: risk.riskScore,
      status: "ACTIVE",
      explanation: broken.explanation,
      recommendedActions: getRecommendedActions(broken.type),
      timestamp: new Date().toISOString()
    };

    store.incidents = [incident, ...store.incidents];
    newIncidents.push(incident);
  }

  return newIncidents;
}

router.post("/:type", (req, res) => {
  const type = normalizeType(req.params.type);

  if (!injectionMessages[type]) {
    return res.status(400).json({ error: `Unknown injection type: ${req.params.type}` });
  }

  mutateState(type);

  let broken = checkInvariants(store.state).filter((item) => item.type !== "RISK_SCORE_LIMIT");
  let risk = calculateRisk(store.state, broken, type);

  store.state.riskScore = risk.riskScore;
  store.state.severity = risk.severity;
  store.state.mainCause = risk.mainCause;
  store.state.lastUpdated = Date.now();

  broken = checkInvariants(store.state);
  risk = calculateRisk(store.state, broken, type);

  store.state.riskScore = risk.riskScore;
  store.state.severity = risk.severity;
  store.state.mainCause = risk.mainCause;

  const event = addEvent(type, store.state.severity, injectionMessages[type]);
  const newIncidents = createIncidents(broken, risk);

  return res.json({ state: store.state, event, incidents: newIncidents, brokenInvariants: broken });
});

router.post("/", (req, res) => {
  return res.status(400).json({ error: "Use POST /api/inject/:type" });
});

export default router;

export function resolveSystem(req, res) {
  resetStore();
  return res.json({ state: store.state, events: store.events, incidents: store.incidents });
}
