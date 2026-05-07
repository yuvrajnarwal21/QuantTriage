const API_BASE = "http://localhost:5001/api";

export async function getState() {
  const res = await fetch(`${API_BASE}/state`);
  return res.json();
}

export async function getMarket() {
  const res = await fetch(`${API_BASE}/market`);
  return res.json();
}

export async function getOrders() {
  const res = await fetch(`${API_BASE}/orders`);
  return res.json();
}

export async function getTrades() {
  const res = await fetch(`${API_BASE}/trades`);
  return res.json();
}

export async function getEvents() {
  const res = await fetch(`${API_BASE}/events`);
  return res.json();
}

export async function getIncidents() {
  const res = await fetch(`${API_BASE}/incidents`);
  return res.json();
}

export async function injectFailure(type) {
  const res = await fetch(`${API_BASE}/inject/${type}`, {
    method: "POST"
  });
  return res.json();
}

export async function resolveSystem() {
  const res = await fetch(`${API_BASE}/resolve`, {
    method: "POST"
  });
  return res.json();
}

export async function askAI(question) {
  const res = await fetch(`${API_BASE}/ai/ask`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ question })
  });

  return res.json();
}