import { useState, useEffect, useCallback } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import type { TradeState, Market } from "../lib/interface";
import ChartCard from "../components/ChartCard";
import TradingPanel from "../components/TradingPanel";
import { fetchMarket } from "../apis/market";
import MarketHeaderDemo from "../components/MarketHeader";

const initialState: TradeState = {
  activeTimeframe: "1D",
  quantity: 10,
  isBuy: true,
  currentPrice: 0,
  priceChange: 0,
  status: "idle",
  error: null,
  chartData: null,
};

const Trade = () => {
  const { marketId } = useParams<{ marketId: string }>();
  const location = useLocation();

  const [marketData, setMarketData] = useState<Market | null>(null);

  const passedState = location.state as {
    initialBuy?: boolean;
  } | null;

  const [state, setState] = useState<TradeState>({
    ...initialState,
    isBuy: passedState?.initialBuy ?? true,
  });

  const {
    quantity,
    isBuy,
    status,
    chartData,
  } = state;

  const updateState = useCallback((updates: Partial<TradeState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  }, []);

  const [isYes, setIsYes] = useState(true);
  const [isBuyState,] = useState(isBuy);

  const fetchMarketData = async () => {
    const data = await fetchMarket(marketId!);
    setMarketData(data);
  };

  const handleQuantityChange = (quantity: number) => {
    updateState({ quantity });
  };

  const handleSubmitForecast = () => {
    if (!marketData || quantity <= 0) return;
    // Submit logic here
  };

  useEffect(() => {
    fetchMarketData();
  }, []);

  if (status === "loading" && !chartData) {
    return (
      <div className="bg-black min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!marketData) {
    return (
      <div className="bg-black min-h-screen flex items-center justify-center text-white">
        No market data available
      </div>
    );
  }

  return (
    <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10  bg-gradient-to-br from-white/5 via-transparent to-black/20">
      <div className="max-w-8xl mx-auto p-6 sm:p-8">
        {/* Back link */}
        <div className="mb-6 flex" >
          <Link
            to="/"
            className="text-gray-400 hover:text-orange-500 flex items-center gap-2 group lg:pl-[242px]"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
            <span className="group-hover:underline">Back to Markets</span>
          </Link> 
        </div>

        {/* Layout - Optimized for laptop screen symmetry */}
        <div className="flex flex-col lg:flex-row gap-6 max-w-7xl mx-auto ">
          <div className="flex flex-col lg:w-[60%] lg:h-full gap-y-4">
          <MarketHeaderDemo marketData={marketData} />{" "}
          <div className="">
            <ChartCard
              marketData={marketData}
              marketId={marketId!}
            />
            </div>
          </div>
          {/* Right side - Trading panel and market info stacked to match chart height */}
          <div className="lg:w-[40%] lg:h-1/2 flex flex-col gap-4">
            <div className="lg:flex-1">
              <TradingPanel
                marketData={marketData}
                isBuy={isBuyState}
                isYes={isYes}
                quantity={quantity}
                onYesNoToggle={setIsYes}
                onQuantityChange={handleQuantityChange}
                onSubmit={handleSubmitForecast}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Trade;
