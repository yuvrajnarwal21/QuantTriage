import { store } from "../data/store.js";

export function startSimulator() {
  setInterval(() => {
    const state = store.state;

    if (state.mode === "NORMAL") {
      state.latencyMs = Math.floor(35 + Math.random() * 35);
      state.orderRate = Math.floor(90 + Math.random() * 80);
      state.position = Math.floor(Math.random() * 220);
      state.riskScore = Math.floor(8 + Math.random() * 12);
      state.severity = "LOW";
      state.mainCause = "System operating normally";
    }

    state.lastUpdated = Date.now();

    store.events.unshift({
      id: `evt_${Date.now()}`,
      type: "ORDER_PLACED",
      severity: "LOW",
      message: "Normal simulated order activity processed.",
      timestamp: new Date().toISOString()
    });

    store.events = store.events.slice(0, 20);
  }, 4000);
}