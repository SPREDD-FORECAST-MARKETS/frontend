import type { ChartDataPoint, MarketData, TimeframeOption } from "../lib/interface";

export const calculateOdds = (isBuy: boolean, marketData: MarketData | null): number => {
    if (!marketData) return 0;
    
    const probability = isBuy ? marketData.probabilities.yes : marketData.probabilities.no;
    
    const odds = probability >= 0.5 
      ? Math.round(-100 * probability / (1 - probability))
      : Math.round(100 * (1 - probability) / probability);
      
    return isBuy ? odds : -odds;
  };
  
  export const calculateReturn = (quantity: number, isBuy: boolean): string => {
    // In a real app, this would use more complex logic based on market odds
    return (quantity * (isBuy ? 1.8 : 0.15)).toFixed(2);
  };
  
  export const generateChartData = (activeTimeframe: TimeframeOption, marketId?: string): ChartDataPoint[] => {
      const getTimeIncrement = (tf: string) => {
        const map: Record<string, number> = { 
          '1H': 2, '6H': 10, '1D': 30, '1W': 120, '1M': 480, '6M': 1440 
        };
        return (map[tf] || 2) * 60 * 1000;
      };
      
      const data: ChartDataPoint[] = [];
      const now = new Date();
      let baseValue = 0.5;
      let lastClose = baseValue;
      const timeIncrement = getTimeIncrement(activeTimeframe);
      const pointCount = 75;
      const volatilityMap: Record<'1H' | '6H' | '1D' | '1W' | '1M' | '6M', number> = { 
        '1H': 0.01, '6H': 0.015, '1D': 0.02, '1W': 0.025, '1M': 0.03, '6M': 0.04 
      };
      const volatility = volatilityMap[activeTimeframe as keyof typeof volatilityMap] || 0.01;
    
    // Create trend simulation
    let trendPhase = 0, trendDuration = Math.floor(Math.random() * 20) + 10;
    let trend = Math.random() > 0.5 ? 1 : -1;
    
    // Make the seed consistent based on the marketId
    const marketSeed = marketId ? parseInt(marketId) % 100 : 0;
    const seedFactor = (marketSeed / 100) * 0.4 + 0.8; // Between 0.8 and 1.2
    
    for (let i = 0; i < pointCount; i++) {
      // Change trend periodically
      if (trendPhase >= trendDuration) {
        trendPhase = 0;
        trendDuration = Math.floor(Math.random() * 20) + 10;
        const newTrend = Math.random() > 0.5 ? 1 : -1;
        trend = newTrend !== trend ? 0 : newTrend * (0.5 + Math.random() * 0.5);
      }
      
      // Calculate price changes
      const trendBias = trend * (volatility / 2) * seedFactor;
      const randomComponent = (Math.random() - 0.5) * volatility;
      baseValue = Math.max(0.1, Math.min(0.9, baseValue * (1 + trendBias + randomComponent)));
      
      // Calculate OHLC values
      const open = lastClose;
      const close = baseValue;
      const high = Math.max(open, close) * (1 + Math.random() * volatility * 0.5);
      const low = Math.min(open, close) * (1 - Math.random() * volatility * 0.5);
      const time = new Date(now.getTime() - ((pointCount - i) * timeIncrement));
      
      data.push({
        time: time.getTime(),
        open: parseFloat(open.toFixed(4)),
        high: parseFloat(Math.min(0.99, high).toFixed(4)),
        low: parseFloat(Math.max(0.01, low).toFixed(4)),
        close: parseFloat(close.toFixed(4))
      });
      
      lastClose = close;
      trendPhase++;
    }
    
    return data;
  };