import type { Market } from "../lib/interface";
export const calculateOdds = (marketData: Market | null): number => {
  if (!marketData) return 0;

  // const probability = isBuy ? marketData.probabilities.yes : marketData.probabilities.no;

  // const odds = probability >= 0.5 
  //   ? Math.round(-100 * probability / (1 - probability))
  //   : Math.round(100 * (1 - probability) / probability);

  // return isBuy ? odds : -odds;
  return 0;
};

export const calculateReturn = (quantity: number, isBuy: boolean): string => {
  // In a real app, this would use more complex logic based on market odds
  return (quantity * (isBuy ? 1.8 : 0.15)).toFixed(2);
};
