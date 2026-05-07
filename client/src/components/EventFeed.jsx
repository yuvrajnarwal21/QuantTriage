export default function EventFeed({ events }) {
  return (
    <section className="panel event-panel slide-up delay-3">
      <div className="section-heading">
        <p className="eyebrow">System Event Stream</p>
        <h3>Recent events</h3>
      </div>

      <div className="event-list">
        {(events || []).slice(0, 12).map((event) => (
          <div className="event-item" key={event.id}>
            <div className="event-topline">
              <span>{new Date(event.timestamp).toLocaleTimeString()}</span>
              <span className={`severity-badge micro ${event.severity.toLowerCase()}`}>{event.severity}</span>
            </div>
            <strong>{event.type}</strong>
            <p>{event.message}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
