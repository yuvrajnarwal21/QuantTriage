export default function IncidentTable({ incidents, onResolveIncident }) {
  const active = incidents?.filter((item) => item.status === "ACTIVE") || [];

  return (
    <section className="panel incident-panel slide-up delay-2">
      <div className="section-heading row-between">
        <div>
          <p className="eyebrow">Human-in-the-loop Triage</p>
          <h3>Active incidents</h3>
        </div>
        <span className="count-pill">{active.length}</span>
      </div>

      {active.length === 0 ? (
        <div className="empty-state">No active incidents. All invariants are currently inside safe bounds.</div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Incident</th>
                <th>Broken Rule</th>
                <th>Severity</th>
                <th>Risk</th>
                <th>Top Action</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {active.map((incident) => (
                <tr key={incident.id}>
                  <td>{incident.title}</td>
                  <td><code>{incident.brokenRule}</code></td>
                  <td><span className={`severity-badge small ${incident.severity.toLowerCase()}`}>{incident.severity}</span></td>
                  <td>{incident.riskScore}</td>
                  <td>{incident.recommendedActions?.[0]}</td>
                  <td><button className="tiny-button" onClick={() => onResolveIncident(incident.id)}>Resolve</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
