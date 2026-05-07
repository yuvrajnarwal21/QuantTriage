export default function StatusHeader({ state }) {
  return (
    <header className="statusHeader">
      <div>
        <p className="eyebrow">Systems Risk Engineering</p>

        <h1>QuantTriage</h1>

        <p className="subtitle">
          Internal risk observability and decision support for simulated trading
          infrastructure.
        </p>
      </div>

      <div className="headerRight">
        <div className={`modePill glow ${state.mode.toLowerCase()}`}>
          {state.mode}
        </div>

        <small>
          Last updated: {new Date(state.lastUpdated).toLocaleTimeString()}
        </small>
      </div>
    </header>
  );
}