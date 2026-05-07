import mongoose from "mongoose";
import dotenv from "dotenv";
import Event from "./models/Event.js";
import Incident from "./models/Incident.js";
import express from "express";
import cors from "cors";
import { store, addEvent, resetStore } from "./data/store.js";
import { tickFinancialSystem } from "./engine/financialSystem.js";
import { updateLiveMarketData } from "./engine/marketDataEngine.js";
import { calculateRisk } from "./engine/riskEngine.js";
import { checkInvariants } from "./engine/invariantEngine.js";
import { getActions } from "./engine/decisionEngine.js";
import { askAIAnalyst } from "./engine/aiAnalystEngine.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;
app.use(cors());
app.use(express.json());

function createIncidentsFromBrokenRules(brokenRules) {
  for (const rule of brokenRules) {
    const alreadyActive = store.incidents.some(
      (incident) => incident.title === rule.title && incident.status === "ACTIVE"
    );

    if (!alreadyActive) {
      store.incidents.unshift({
        id: `inc_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        title: rule.title,
        brokenRule: rule.brokenRule,
        severity: store.state.severity,
        riskScore: store.state.riskScore,
        status: "ACTIVE",
        explanation: rule.explanation,
        recommendedActions: getActions(rule.key),
        timestamp: new Date().toISOString()
      });
      const newIncident = new Incident({
        title: rule.title,
        brokenRule: rule.brokenRule,
        severity: store.state.severity,
        riskScore: store.state.riskScore,
        status: "ACTIVE",
        explanation: rule.explanation,
        recommendedActions: getActions(rule.key)
      });
      
      newIncident.save();

      addEvent(rule.key, store.state.severity, `${rule.title}: ${rule.brokenRule} violated.`);
    }
  }
}

function evaluateSystem() {
  const risk = calculateRisk(store.state);
  store.state.riskScore = risk.riskScore;
  store.state.severity = risk.severity;

  const brokenRules = checkInvariants(store.state);

  if (brokenRules.length > 0) {
    store.state.mode = store.state.severity === "CRITICAL" ? "CONTAINMENT" : "DEGRADED";
    store.state.mainCause = brokenRules[0].title;
  } else {
    store.state.mode = "NORMAL";
    store.state.mainCause = "Live multi-symbol market simulation operating normally";
  }

  createIncidentsFromBrokenRules(brokenRules);
  store.state.lastUpdated = Date.now();
}

updateLiveMarketData();

setInterval(async () => {
  await updateLiveMarketData();
}, 15000);

setInterval(() => {
  tickFinancialSystem();
  evaluateSystem();
}, 2500);

app.get("/", (req, res) => {
  res.json({
    app: "QuantTriage",
    status: "running",
    purpose: "Live trading-risk simulation with custom local AI analyst"
  });
});

app.get("/api/state", (req, res) => res.json(store.state));
app.get("/api/market", (req, res) => res.json(store.market));
app.get("/api/accounts", (req, res) => res.json(store.accounts));
app.get("/api/orders", (req, res) => res.json(store.orders));
app.get("/api/trades", (req, res) => res.json(store.trades));
app.get("/api/events", (req, res) => res.json(store.events));
app.get("/api/incidents", (req, res) => res.json(store.incidents));

app.post("/api/ai/ask", (req, res) => {
  const { question } = req.body;

  if (!question || question.trim().length === 0) {
    return res.status(400).json({ error: "Question is required" });
  }

  res.json(askAIAnalyst(question));
});

app.post("/api/inject/:type", (req, res) => {
  const type = req.params.type.toUpperCase();

  if (type === "PRICE_SPIKE") {
    const symbols = Object.keys(store.market);
    const symbol = symbols[Math.floor(Math.random() * symbols.length)];

    store.market[symbol].price = Number((store.market[symbol].price * 1.18).toFixed(2));
    store.state.mainCause = `${symbol} price feed moved outside expected range`;

    addEvent("PRICE_SPIKE", "HIGH", `${symbol} price spiked 18% inside the simulated market feed.`);
  }

  if (type === "POSITION_LIMIT_BREACH") {
    const symbols = Object.keys(store.market);
    const symbol = symbols[Math.floor(Math.random() * symbols.length)];

    store.accounts.acct_001.positions[symbol] = 800;
    store.state.mainCause = `${symbol} position exceeded configured max position`;

    addEvent("POSITION_LIMIT_BREACH", "HIGH", `${symbol} position forced above max position.`);
  }

  if (type === "LATENCY_SPIKE") {
    store.state.latencyMs = 460;
    store.state.mainCause = "Latency crossed safe trading threshold";
    addEvent("LATENCY_SPIKE", "HIGH", "Trading workflow latency spiked above 250ms.");
  }

  if (type === "ORDER_FLOOD") {
    store.state.orderRate = 950;
    store.state.mainCause = "Order rate exceeded safe throughput";
    addEvent("ORDER_FLOOD", "HIGH", "Order traffic surged above 500 orders per minute.");
  }

  if (type === "NEGATIVE_BALANCE") {
    store.accounts.acct_001.balance = -50000;
    store.state.balance = -50000;
    store.state.mainCause = "Balance dropped below zero";
    addEvent("NEGATIVE_BALANCE", "CRITICAL", "Account balance forced below zero.");
  }

  evaluateSystem();

  res.json({
    state: store.state,
    market: store.market,
    accounts: store.accounts,
    orders: store.orders,
    trades: store.trades,
    events: store.events,
    incidents: store.incidents
  });
});

app.patch("/api/incidents/:id/resolve", (req, res) => {
  const incident = store.incidents.find((item) => item.id === req.params.id);

  if (!incident) {
    return res.status(404).json({ error: "Incident not found" });
  }

  incident.status = "RESOLVED";
  addEvent("SYSTEM_RESOLVED", "LOW", `${incident.title} marked resolved by engineer.`);

  res.json(incident);
});

app.post("/api/resolve", (req, res) => {
  resetStore();
  evaluateSystem();

  res.json({
    state: store.state,
    market: store.market,
    accounts: store.accounts,
    orders: store.orders,
    trades: store.trades,
    events: store.events,
    incidents: store.incidents
  });
});

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("MongoDB Connected");
  })
  .catch((err) => {
    console.error("MongoDB Error:", err);
  });

app.listen(PORT, () => {
  console.log(`QuantTriage backend running on http://localhost:${PORT}`);
});