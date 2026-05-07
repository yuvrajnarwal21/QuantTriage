export default function ExplanationPanel({ state, incidents, brokenInvariants }) {
  const active = incidents?.find((item) => item.status === "ACTIVE");
  const broken = brokenInvariants || [];

  return (
    <section className="panel explanation-panel slide-up delay-4">
      <div className="section-heading">
        <p className="eyebrow">Explainable Decision Support</p>
        <h3>What happened?</h3>
      </div>

      {active ? (
        <>
          <p className="explain-lead">{active.explanation}</p>
          <div className="why-card">
            <span>Why it matters</span>
            <p>
              This is not just an alert. The system broke a correctness invariant, which means engineers need to contain risk before more simulated trades amplify exposure.
            </p>
          </div>
          <div className="actions-list">
            <span>Ranked response actions</span>
            {active.recommendedActions.map((action, index) => (
              <div className="action-row" key={action}>
                <b>{index + 1}</b>
                <p>{action}</p>
              </div>
            ))}
          </div>
        </>
      ) : (
        <>
          <p className="explain-lead">The system is operating normally. QuantTriage is watching position, balance, latency, order rate, and aggregate risk.</p>
          <div className="why-card">
            <span>Current reasoning</span>
            <p>{state?.mainCause || "Waiting for live state."}</p>
          </div>
        </>
      )}

      <div className="invariant-list">
        <span>Broken invariants</span>
        {broken.length === 0 ? <p className="green-text">None right now.</p> : broken.map((item) => <code key={item.type}>{item.rule}</code>)}
      </div>
    </section>
  );
}
