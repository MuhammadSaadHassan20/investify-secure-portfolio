const COINGECKO_API = 'https://api.coingecko.com/api/v3';

interface CoinGeckoPrice {
  [key: string]: {
    usd: number;
  };
}

const cryptoIdMap: Record<string, string> = {
  'btc': 'bitcoin',
  'eth': 'ethereum',
  'sol': 'solana',
  'ada': 'cardano',
  'dot': 'polkadot',
  'matic': 'polygon',
  'avax': 'avalanche-2',
  'link': 'chainlink',
  'uni': 'uniswap',
  'atom': 'cosmos',
  'xrp': 'ripple',
  'doge': 'dogecoin',
  'ltc': 'litecoin',
  'bnb': 'binancecoin',
  'usdt': 'tether',
  'usdc': 'usd-coin',
};

export async function fetchCryptoPrices(symbols: string[]): Promise<Record<string, number>> {
  try {
    const coinIds = symbols
      .map(symbol => cryptoIdMap[symbol.toLowerCase()] || symbol.toLowerCase())
      .join(',');

    const response = await fetch(
      `${COINGECKO_API}/simple/price?ids=${coinIds}&vs_currencies=usd`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch crypto prices');
    }

    const data: CoinGeckoPrice = await response.json();

    const prices: Record<string, number> = {};
    symbols.forEach(symbol => {
      const coinId = cryptoIdMap[symbol.toLowerCase()] || symbol.toLowerCase();
      if (data[coinId]?.usd) {
        prices[symbol.toLowerCase()] = data[coinId].usd;
      }
    });

    return prices;
  } catch (error) {
    console.error('Error fetching crypto prices:', error);
    return {};
  }
}
