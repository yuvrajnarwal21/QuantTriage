export const MARKET_SYMBOLS = [
  "AAPL", "MSFT", "GOOGL", "AMZN", "META",
  "NVDA", "TSLA", "AMD", "INTC", "NFLX",
  "JPM", "BAC", "GS", "MS", "V",
  "MA", "PYPL", "SQ", "COIN", "HOOD",
  "WMT", "COST", "TGT", "HD", "MCD",
  "SBUX", "NKE", "DIS", "UBER", "ABNB",
  "XOM", "CVX", "BA", "CAT", "GE",
  "UNH", "PFE", "JNJ", "MRNA", "LLY"
];

function buildMarket() {
  const market = {};

  for (const symbol of MARKET_SYMBOLS) {
    market[symbol] = {
      symbol,
      price: Number((50 + Math.random() * 900).toFixed(2)),
      volatility: Number((0.006 + Math.random() * 0.025).toFixed(4)),
      sector: getSector(symbol)
    };
  }

  return market;
}

function buildPositions() {
  const positions = {};

  for (const symbol of MARKET_SYMBOLS) {
    positions[symbol] = 0;
  }

  return positions;
}

function getSector(symbol) {
  const sectors = {
    AAPL: "Technology",
    MSFT: "Technology",
    GOOGL: "Technology",
    AMZN: "Consumer Internet",
    META: "Consumer Internet",
    NVDA: "Semiconductors",
    TSLA: "Automotive",
    AMD: "Semiconductors",
    INTC: "Semiconductors",
    NFLX: "Media",
    JPM: "Banking",
    BAC: "Banking",
    GS: "Banking",
    MS: "Banking",
    V: "Payments",
    MA: "Payments",
    PYPL: "Payments",
    SQ: "Payments",
    COIN: "Crypto Infrastructure",
    HOOD: "Brokerage",
    WMT: "Retail",
    COST: "Retail",
    TGT: "Retail",
    HD: "Retail",
    MCD: "Restaurants",
    SBUX: "Restaurants",
    NKE: "Apparel",
    DIS: "Media",
    UBER: "Mobility",
    ABNB: "Travel",
    XOM: "Energy",
    CVX: "Energy",
    BA: "Industrials",
    CAT: "Industrials",
    GE: "Industrials",
    UNH: "Healthcare",
    PFE: "Healthcare",
    JNJ: "Healthcare",
    MRNA: "Healthcare",
    LLY: "Healthcare"
  };

  return sectors[symbol] || "General";
}

export const store = {
  market: buildMarket(),

  accounts: {
    acct_001: {
      id: "acct_001",
      balance: 1000000,
      equity: 1000000,
      realizedPnL: 0,
      positions: buildPositions()
    }
  },

  orders: [],
  trades: [],

  state: {
    mode: "NORMAL",
    balance: 1000000,
    equity: 1000000,
    position: 0,
    maxPosition: 500,
    latencyMs: 42,
    orderRate: 120,
    riskScore: 12,
    severity: "LOW",
    mainCause: "Live multi-symbol market simulation operating normally",
    lastUpdated: Date.now()
  },

  events: [],
  incidents: []
};

export function addEvent(type, severity, message, metadata = {}) {
  store.events.unshift({
    id: `evt_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    type,
    severity,
    message,
    metadata,
    timestamp: new Date().toISOString()
  });

  store.events = store.events.slice(0, 60);
}

export function resetStore() {
  store.market = buildMarket();

  store.accounts.acct_001.balance = 1000000;
  store.accounts.acct_001.equity = 1000000;
  store.accounts.acct_001.realizedPnL = 0;
  store.accounts.acct_001.positions = buildPositions();

  store.orders = [];
  store.trades = [];

  store.state = {
    mode: "NORMAL",
    balance: 1000000,
    equity: 1000000,
    position: 0,
    maxPosition: 500,
    latencyMs: 42,
    orderRate: 120,
    riskScore: 12,
    severity: "LOW",
    mainCause: "Live multi-symbol market simulation operating normally",
    lastUpdated: Date.now()
  };

  store.incidents = store.incidents.map((incident) => ({
    ...incident,
    status: "RESOLVED"
  }));

  addEvent("SYSTEM_RESOLVED", "LOW", "System reset. Multi-symbol trading simulation returned to normal.");
}