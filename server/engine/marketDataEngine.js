import { MARKET_SYMBOLS, store, addEvent } from "../data/store.js";

const YAHOO_URL = "https://query1.finance.yahoo.com/v7/finance/quote?symbols=";

export async function updateLiveMarketData() {
  try {
    const symbols = MARKET_SYMBOLS.join(",");
    const response = await fetch(`${YAHOO_URL}${symbols}`);

    if (!response.ok) {
      throw new Error("Market data request failed");
    }

    const data = await response.json();
    const quotes = data.quoteResponse.result;

    for (const quote of quotes) {
      if (!quote.symbol || !quote.regularMarketPrice) continue;

      const oldPrice = store.market[quote.symbol]?.price || quote.regularMarketPrice;
      const newPrice = Number(quote.regularMarketPrice.toFixed(2));
      const changePercent = quote.regularMarketChangePercent || 0;

      store.market[quote.symbol] = {
        ...store.market[quote.symbol],
        symbol: quote.symbol,
        price: newPrice,
        previousPrice: oldPrice,
        changePercent: Number(changePercent.toFixed(2)),
        volume: quote.regularMarketVolume || 0,
        marketState: quote.marketState || "UNKNOWN",
        source: "Yahoo Finance live quote",
        lastMarketUpdate: new Date().toISOString()
      };
    }

    addEvent(
      "MARKET_DATA_UPDATE",
      "LOW",
      `Live Wall Street market data refreshed for ${quotes.length} symbols.`
    );
  } catch (error) {
    addEvent(
      "MARKET_DATA_DELAY",
      "MEDIUM",
      "Live market data feed delayed. Falling back to simulated price movement.",
      { error: error.message }
    );
  }
}