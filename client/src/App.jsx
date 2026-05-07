import React, { useEffect, useRef, useState } from "react";
import {
  getState,
  getEvents,
  getIncidents,
  injectFailure,
  resolveSystem,
  askAI
} from "./api.js";

function Pill({ children, severity }) {
  return (
    <span className={`pill ${severity?.toLowerCase() || "low"}`}>
      {children}
    </span>
  );
}

function Metric({ label, value, detail }) {
  return (
    <div className="metric-card">
      <span>{label}</span>
      <strong>{value}</strong>
      {detail && <small>{detail}</small>}
    </div>
  );
}

function App() {
  const [state, setState] = useState(null);
  const [events, setEvents] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [loading, setLoading] = useState(false);

  const [aiQuestion, setAiQuestion] = useState("");
  const [aiMessages, setAiMessages] = useState([
    {
      role: "QuantTriage AI Analyst",
      answer:
        "Ask me what is breaking, why the risk score changed, what trades look suspicious, or what an engineer should do next."
    }
  ]);
  const [aiLoading, setAiLoading] = useState(false);
  const aiMessagesEndRef = useRef(null);

  async function refresh() {
    try {
      const [stateData, eventData, incidentData] = await Promise.all([
        getState(),
        getEvents(),
        getIncidents()
      ]);

      setState(stateData);
      setEvents(eventData || []);
      setIncidents(incidentData || []);

      setSelectedIncident((current) => {
        if (current) {
          const stillExists = incidentData.find((item) => item.id === current.id);
          if (stillExists) return stillExists;
        }

        return (
          incidentData.find((item) => item.status === "ACTIVE") ||
          incidentData[0] ||
          null
        );
      });
    } catch (err) {
      console.error(err);
    }
  }

  async function handleInject(type) {
    setLoading(true);
    try {
      await injectFailure(type);
      await refresh();
    } finally {
      setLoading(false);
    }
  }

  async function handleResolve() {
    setLoading(true);
    try {
      await resolveSystem();
      await refresh();
    } finally {
      setLoading(false);
    }
  }

  async function handleAskAI(e) {
    e.preventDefault();
    if (!aiQuestion.trim()) return;

    const question = aiQuestion.trim();
    setAiQuestion("");
    setAiLoading(true);

    setAiMessages((prev) => [...prev, { role: "You", answer: question }]);

    try {
      const response = await askAI(question);

      setAiMessages((prev) => [
        ...prev,
        {
          role: response.role || "QuantTriage AI Analyst",
          answer: response.answer || "I could not generate a response."
        }
      ]);
    } catch (err) {
      console.error(err);

      setAiMessages((prev) => [
        ...prev,
        {
          role: "QuantTriage AI Analyst",
          answer:
            "I could not reach the backend AI analyst. Make sure the backend is running on port 5001."
        }
      ]);
    }

    setAiLoading(false);
  }

  function fillPrompt(prompt) {
    setAiQuestion(prompt);
  }

  useEffect(() => {
    refresh();
    const timer = setInterval(refresh, 3000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    aiMessagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end"
    });
  }, [aiMessages, aiLoading]);

  if (!state) {
    return (
      <main className="app-shell loading-shell">
        <div className="loading-card">
          <div className="loader" />
          <div>
            <strong>Booting QuantTriage</strong>
            <p>Connecting to the trading-risk simulation...</p>
          </div>
        </div>
      </main>
    );
  }

  const activeIncidents = incidents.filter((item) => item.status === "ACTIVE");
  const riskScore = Number(state.riskScore || 0);
  const riskWidth = Math.min(100, Math.max(0, riskScore));

  return (
    <main className="app-shell">
      <section className="command-hero">
        <div className="hero-bg-orb orb-one" />
        <div className="hero-bg-orb orb-two" />

        <nav className="top-nav">
          <div className="brand-mark">
            <span>QT</span>
          </div>

          <div>
            <strong>QuantTriage</strong>
            <small>Trading Infrastructure Risk Console</small>
          </div>

          <div className="nav-spacer" />

          <div className="nav-chip">
            <span className="pulse-dot" />
            Live Simulation
          </div>
        </nav>

        <div className="hero-grid">
          <div className="hero-copy">
            <p className="eyebrow">Quantitative Security · Systems Risk Engineering</p>
            <h1>Real-time risk intelligence for simulated Wall Street systems.</h1>
            <p className="subtitle">
              Detect invariant failures, quantify trading-system exposure, explain
              risk movement, and guide engineers toward the safest next action.
            </p>

            <div className="hero-actions">
              <button onClick={() => handleInject("POSITION_LIMIT_BREACH")} disabled={loading}>
                Stress Test System
              </button>
              <button className="secondary-action" onClick={handleResolve} disabled={loading}>
                Stabilize System
              </button>
            </div>
          </div>

          <div className="status-console">
            <div className="console-topline">
              <span>System Mode</span>
              <Pill severity={state.severity}>{state.severity}</Pill>
            </div>

            <h2>{state.mode}</h2>

            <div className="console-readout">
              <span>Last Updated</span>
              <strong>{new Date(state.lastUpdated).toLocaleTimeString()}</strong>
            </div>

            <div className="console-readout">
              <span>Active Incidents</span>
              <strong>{activeIncidents.length}</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="risk-overview">
        <div className="risk-main">
          <div className="section-header">
            <div>
              <p className="label">Unified Risk Score</p>
              <h2>{riskScore}/100</h2>
            </div>
            <Pill severity={state.severity}>{state.severity}</Pill>
          </div>

          <div className="risk-meter">
            <div style={{ width: `${riskWidth}%` }} />
          </div>

          <h3>{state.mainCause || "System operating inside expected bounds."}</h3>
          <p>
            Score combines position exposure, balance health, latency pressure,
            order-rate pressure, broken invariants, and current system mode.
          </p>
        </div>

        <div className="metric-grid">
          <Metric
            label="Balance"
            value={`$${Number(state.balance || 0).toLocaleString()}`}
            detail="cash safety"
          />
          <Metric
            label="Equity"
            value={`$${Number(state.equity || state.balance || 0).toLocaleString()}`}
            detail="portfolio value"
          />
          <Metric
            label="Position"
            value={`${state.position || 0} / ${state.maxPosition || 0}`}
            detail="limit tracking"
          />
          <Metric
            label="Latency"
            value={`${state.latencyMs || 0}ms`}
            detail="execution health"
          />
          <Metric
            label="Order Rate"
            value={`${state.orderRate || 0}/min`}
            detail="traffic pressure"
          />
          <Metric
            label="Largest Position"
            value={`${state.largestPosition?.symbol || "NONE"} ${state.largestPosition?.qty || 0}`}
            detail="concentration"
          />
        </div>
      </section>

      <section className="control-deck">
        <div>
          <p className="label">Simulation Controls</p>
          <h2>Inject market and infrastructure failures</h2>
          <p>
            Push the system into stress and watch QuantTriage detect, score,
            explain, and triage the risk in real time.
          </p>
        </div>

        <div className="control-grid">
          <button onClick={() => handleInject("PRICE_SPIKE")} disabled={loading}>
            <span>01</span>
            Price Spike
          </button>
          <button onClick={() => handleInject("POSITION_LIMIT_BREACH")} disabled={loading}>
            <span>02</span>
            Position Breach
          </button>
          <button onClick={() => handleInject("LATENCY_SPIKE")} disabled={loading}>
            <span>03</span>
            Latency Spike
          </button>
          <button onClick={() => handleInject("ORDER_FLOOD")} disabled={loading}>
            <span>04</span>
            Order Flood
          </button>
          <button onClick={() => handleInject("NEGATIVE_BALANCE")} disabled={loading}>
            <span>05</span>
            Negative Balance
          </button>
          <button className="resolve-button" onClick={handleResolve} disabled={loading}>
            <span>✓</span>
            Resolve System
          </button>
        </div>
      </section>

      <section className="workspace-grid">
        <div className="panel incident-panel">
          <div className="section-header">
            <div>
              <p className="label">Human-in-the-loop Triage</p>
              <h2>Incident Queue</h2>
            </div>
            <span className="count-badge">{activeIncidents.length} active</span>
          </div>

          <div className="incident-list">
            {incidents.length === 0 && (
              <div className="empty-state">
                No incidents yet. All invariants are inside safe bounds.
              </div>
            )}

            {incidents.map((incident) => (
              <button
                className={`incident-row ${
                  selectedIncident?.id === incident.id ? "selected" : ""
                }`}
                key={incident.id}
                onClick={() => setSelectedIncident(incident)}
              >
                <div className="incident-main">
                  <strong>{incident.title}</strong>
                  <small>{incident.brokenRule}</small>
                </div>

                <Pill severity={incident.severity}>{incident.riskScore}</Pill>

                <div className="incident-action">
                  {incident.recommendedActions?.[0] || "Review incident context"}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="panel explanation-panel">
          <div className="section-header">
            <div>
              <p className="label">Decision Support</p>
              <h2>Risk Explanation</h2>
            </div>
          </div>

          {!selectedIncident ? (
            <div className="empty-state">
              Inject a failure to generate a decision explanation.
            </div>
          ) : (
            <div className="explanation-stack">
              <Pill severity={selectedIncident.severity}>
                {selectedIncident.severity}
              </Pill>

              <h3>{selectedIncident.title}</h3>

              <div className="explain-block">
                <span>What broke</span>
                <p>{selectedIncident.brokenRule} was violated.</p>
              </div>

              <div className="explain-block">
                <span>Why it matters</span>
                <p>{selectedIncident.explanation}</p>
              </div>

              <div className="explain-block">
                <span>Ranked engineer actions</span>
                <ol>
                  {selectedIncident.recommendedActions?.map((action) => (
                    <li key={action}>{action}</li>
                  ))}
                </ol>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="ai-panel">
        <div className="ai-shell">
          <div className="ai-header">
            <div>
              <p className="label">AI Analyst Layer</p>
              <h2>Ask QuantTriage anything</h2>
              <p>
                Ask about risk, trades, vulnerabilities, current incidents,
                architecture, or what action to take next.
              </p>
            </div>

            <div className="ai-status">
              <span className="pulse-dot" />
              Context Aware
            </div>
          </div>

          <div className="ai-messages">
            {aiMessages.map((message, index) => (
              <div
                className={`ai-message ${
                  message.role === "You" ? "user-message" : "analyst-message"
                }`}
                key={`${message.role}-${index}`}
              >
                <strong>{message.role}</strong>
                <p>{message.answer}</p>
              </div>
            ))}

            {aiLoading && (
              <div className="ai-message analyst-message">
                <strong>QuantTriage AI Analyst</strong>
                <p>Analyzing live system context...</p>
              </div>
            )}

            <div ref={aiMessagesEndRef} />
          </div>

          <form className="ai-form" onSubmit={handleAskAI}>
            <input
              value={aiQuestion}
              onChange={(e) => setAiQuestion(e.target.value)}
              placeholder="Ask: What is the biggest risk right now?"
            />
            <button type="submit" disabled={aiLoading}>
              Ask
            </button>
          </form>

          <div className="prompt-row">
            <button type="button" onClick={() => fillPrompt("What is the biggest risk right now?")}>
              Biggest risk
            </button>
            <button type="button" onClick={() => fillPrompt("Are there any vulnerabilities or concerns?")}>
              Vulnerabilities
            </button>
            <button type="button" onClick={() => fillPrompt("Explain the recent trades.")}>
              Recent trades
            </button>
            <button type="button" onClick={() => fillPrompt("What should an engineer do next?")}>
              Next action
            </button>
            <button type="button" onClick={() => fillPrompt("Explain how this backend works.")}>
              Architecture
            </button>
          </div>
        </div>
      </section>

      <section className="panel telemetry-panel">
        <div className="section-header">
          <div>
            <p className="label">Live Telemetry</p>
            <h2>System Event Feed</h2>
          </div>
          <span className="count-badge">streaming</span>
        </div>

        <div className="feed">
          {events.map((event) => (
            <div className="event-row" key={event.id}>
              <div className="event-type">
                <Pill severity={event.severity}>{event.severity}</Pill>
                <strong>{event.type}</strong>
              </div>

              <p>{event.message}</p>

              <small>{new Date(event.timestamp).toLocaleTimeString()}</small>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

export default App;