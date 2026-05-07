export function getActions(type) {
  const actions = {
    POSITION_LIMIT_BREACH: [
      "Freeze new orders",
      "Reduce position exposure",
      "Notify trading engineer",
      "Monitor risk score for 60 seconds"
    ],
    LATENCY_SPIKE: [
      "Route traffic away from slow service",
      "Check database/API latency",
      "Monitor p95 and p99 latency",
      "Review recent deploys"
    ],
    ORDER_FLOOD: [
      "Enable rate limiting",
      "Throttle suspicious clients",
      "Inspect traffic source",
      "Check for automation or replay behavior"
    ],
    NEGATIVE_BALANCE: [
      "Halt affected account",
      "Block new trades",
      "Review transaction history",
      "Escalate to risk owner"
    ],
    PRICE_SPIKE: [
      "Pause trading for affected symbol",
      "Validate price feed",
      "Compare against backup market data source",
      "Review external market conditions"
    ],
    CRITICAL_RISK: [
      "Move system into containment mode",
      "Freeze new trading activity",
      "Escalate to risk owner",
      "Review all active incidents"
    ]
  };

  return actions[type] || [
    "Investigate system state",
    "Review recent orders and trades",
    "Check invariant violations",
    "Escalate if risk continues rising"
  ];
}