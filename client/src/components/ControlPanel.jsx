const controls = [
  ["PRICE_SPIKE", "Inject Price Spike"],
  ["POSITION_LIMIT_BREACH", "Inject Position Breach"],
  ["LATENCY_SPIKE", "Inject Latency Spike"],
  ["ORDER_FLOOD", "Inject Order Flood"],
  ["NEGATIVE_BALANCE", "Inject Negative Balance"],
  ["DATABASE_DELAY", "Inject Database Delay"]
];

export default function ControlPanel({ onInject, onResolve, loading }) {
  return (
    <section className="panel control-panel slide-up delay-1">
      <div className="section-heading">
        <p className="eyebrow">Simulation Controls</p>
        <h3>Inject failures</h3>
      </div>

      <div className="control-grid">
        {controls.map(([type, label]) => (
          <button key={type} disabled={loading} onClick={() => onInject(type)} className="control-button">
            {label}
          </button>
        ))}
      </div>

      <button disabled={loading} onClick={onResolve} className="resolve-button">
        Resolve System
      </button>
    </section>
  );
}
