export default function RiskPanel({ state }) {
  return (
    <section className="riskPanel">
      <div className="riskHero">
        <p className="eyebrow">Unified Risk Score</p>

        <strong className="riskNumber">{state.riskScore}</strong>

        <span className={`severity ${state.severity.toLowerCase()}`}>
          {state.severity}
        </span>

        <p>{state.mainCause}</p>
      </div>

      <div className="metricGrid">
        <Metric label="Balance" value={`$${state.balance.toLocaleString()}`} />
        <Metric label="Position" value={state.position} />
        <Metric label="Max Position" value={state.maxPosition} />
        <Metric
          label="Exposure"
          value={`$${state.financialExposure.toLocaleString()}`}
        />
        <Metric label="Latency" value={`${state.latencyMs}ms`} />
        <Metric label="Order Rate" value={`${state.orderRate}/min`} />
      </div>
    </section>
  );
}

function Metric({ label, value }) {
  return (
    <div className="metricCard">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}