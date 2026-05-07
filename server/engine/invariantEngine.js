export function checkInvariants(state) {
  const broken = [];

  if (state.position > state.maxPosition) {
    broken.push({
      key: "POSITION_LIMIT_BREACH",
      title: "Position Limit Breach",
      brokenRule: "position <= maxPosition",
      explanation: "The trading account is holding more gross exposure than the configured max position allows."
    });
  }

  if (state.balance < 0) {
    broken.push({
      key: "NEGATIVE_BALANCE",
      title: "Negative Balance",
      brokenRule: "balance >= 0",
      explanation: "The trading account balance dropped below zero, meaning capital controls failed or exposure became unsafe."
    });
  }

  if (state.latencyMs > 250) {
    broken.push({
      key: "LATENCY_SPIKE",
      title: "Latency Spike",
      brokenRule: "latencyMs <= 250",
      explanation: "Trading latency is above the safe threshold, so orders may execute on stale information."
    });
  }

  if (state.orderRate > 500) {
    broken.push({
      key: "ORDER_FLOOD",
      title: "Order Flood",
      brokenRule: "orderRate <= 500",
      explanation: "The system is processing too many orders per minute, which may indicate automation abuse, replay behavior, or runaway clients."
    });
  }

  if (state.riskScore >= 80) {
    broken.push({
      key: "CRITICAL_RISK",
      title: "Critical Risk Score",
      brokenRule: "riskScore < 80",
      explanation: "The combined system risk is critical and needs immediate containment."
    });
  }

  return broken;
}