export function calculateRisk(state) {
  let score = 10;

  if (state.position > state.maxPosition) score += 40;
  if (state.balance < 0) score += 50;
  if (state.latencyMs > 250) score += 25;
  if (state.orderRate > 500) score += 30;

  if (state.position > state.maxPosition * 0.75) score += 12;
  if (state.latencyMs > 180) score += 10;
  if (state.orderRate > 350) score += 10;
  if (state.mode === "DEGRADED") score += 10;
  if (state.mode === "CONTAINMENT") score += 20;

  score = Math.min(100, Math.round(score));

  let severity = "LOW";
  if (score > 30) severity = "MEDIUM";
  if (score > 60) severity = "HIGH";
  if (score > 80) severity = "CRITICAL";

  return { riskScore: score, severity };
}