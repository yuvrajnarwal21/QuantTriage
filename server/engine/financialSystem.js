import { MARKET_SYMBOLS, store, addEvent } from "../data/store.js";

const sides = ["BUY", "SELL"];

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function weightedRandomSymbol() {
  const highActivity = [
    "AAPL", "MSFT", "NVDA", "TSLA", "AMZN",
    "META", "AMD", "JPM", "V", "GOOGL"
  ];

  if (Math.random() < 0.7) return randomItem(highActivity);
  return randomItem(MARKET_SYMBOLS);
}

function randomQty() {
  return Math.floor(5 + Math.random() * 45);
}

function fallbackPriceMovement() {
  for (const symbol of MARKET_SYMBOLS) {
    const asset = store.market[symbol];

    if (asset.source === "Yahoo Finance live quote") continue;

    const move = (Math.random() - 0.5) * asset.volatility * asset.price;
    asset.price = Math.max(1, Number((asset.price + move).toFixed(2)));
  }
}

function createOrder() {
  const symbol = weightedRandomSymbol();
  const side = randomItem(sides);
  const qty = randomQty();
  const asset = store.market[symbol];

  return {
    id: `ord_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    accountId: "acct_001",
    symbol,
    sector: asset.sector,
    side,
    qty,
    price: asset.price,
    marketChangePercent: asset.changePercent || 0,
    status: "NEW",
    timestamp: new Date().toISOString()
  };
}

function executeOrder(order) {
  const account = store.accounts[order.accountId];
  const notional = order.qty * order.price;

  if (order.side === "BUY") {
    account.positions[order.symbol] += order.qty;
    account.balance -= notional;
  } else {
    account.positions[order.symbol] -= order.qty;
    account.balance += notional;
  }

  order.status = "FILLED";

  const trade = {
    id: `trd_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    orderId: order.id,
    symbol: order.symbol,
    sector: order.sector,
    side: order.side,
    qty: order.qty,
    price: order.price,
    notional: Number(notional.toFixed(2)),
    marketChangePercent: order.marketChangePercent,
    timestamp: new Date().toISOString()
  };

  store.trades.unshift(trade);
  store.trades = store.trades.slice(0, 80);

  addEvent(
    "ORDER_FILLED",
    "LOW",
    `${order.side} ${order.qty} ${order.symbol} filled at $${order.price}`,
    trade
  );
}

function updateDerivedSystemState() {
  const account = store.accounts.acct_001;

  let grossPosition = 0;
  let equity = account.balance;
  let largestPosition = { symbol: "NONE", qty: 0 };
  let biggestMover = { symbol: "NONE", changePercent: 0 };

  for (const symbol of MARKET_SYMBOLS) {
    const qty = account.positions[symbol];
    const asset = store.market[symbol];

    grossPosition += Math.abs(qty);
    equity += qty * asset.price;

    if (Math.abs(qty) > Math.abs(largestPosition.qty)) {
      largestPosition = { symbol, qty };
    }

    if (Math.abs(asset.changePercent || 0) > Math.abs(biggestMover.changePercent)) {
      biggestMover = {
        symbol,
        changePercent: asset.changePercent || 0
      };
    }
  }

  account.equity = Number(equity.toFixed(2));

  store.state.balance = Number(account.balance.toFixed(2));
  store.state.equity = account.equity;
  store.state.position = grossPosition;
  store.state.largestPosition = largestPosition;
  store.state.biggestMover = biggestMover;

  if (store.state.mode === "NORMAL") {
    store.state.latencyMs = Math.floor(35 + Math.random() * 90);
    store.state.orderRate = Math.floor(140 + Math.random() * 220);
  }

  store.state.lastUpdated = Date.now();
}

export function tickFinancialSystem() {
  fallbackPriceMovement();

  const marketStress = Object.values(store.market).some(
    (asset) => Math.abs(asset.changePercent || 0) > 3
  );

  const orderCount = marketStress
    ? Math.floor(7 + Math.random() * 10)
    : Math.floor(2 + Math.random() * 6);

  if (marketStress) {
    store.state.orderRate = Math.floor(420 + Math.random() * 260);
    addEvent(
      "MARKET_STRESS",
      "MEDIUM",
      "Large market movement detected. Trading activity increased."
    );
  }

  for (let i = 0; i < orderCount; i++) {
    const order = createOrder();
    store.orders.unshift(order);
    store.orders = store.orders.slice(0, 80);
    executeOrder(order);
  }

  updateDerivedSystemState();
}