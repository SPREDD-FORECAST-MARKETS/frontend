import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import type { TradeState, TimeframeOption, Market } from '../lib/interface';
import { generateChartData } from '../utils/calculations';
import ChartCard from '../components/ChartCard';
import MarketInfoCard from '../components/MarketInfoCard';
import TradingPanel from '../components/TradingPanel';
import { fetchMarket } from '../apis/market';

const initialState: TradeState = {
  activeTimeframe: '1D',
  quantity: 10,
  isBuy: true,
  currentPrice: 0,
  priceChange: 0,
  status: 'idle',
  error: null,
  chartData: null
};

const Trade = () => {
  const { marketId } = useParams<{ marketId: string }>();
  const location = useLocation();

  const [marketData, setMarketData] = useState<Market | null>(null);

  const passedState = location.state as {
    initialBuy?: boolean
  } | null;

  const [state, setState] = useState<TradeState>({
    ...initialState,
    isBuy: passedState?.initialBuy ?? true,
  });

  const {
    activeTimeframe,
    quantity,
    isBuy,
    currentPrice,
    priceChange,
    status,
    chartData
  } = state;

  const updateState = useCallback((updates: Partial<TradeState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const [isYes, setIsYes] = useState(true);
  const [isBuyState, setIsBuy] = useState(isBuy);

  const fetchMarketData = async () => {
    const data = await fetchMarket(marketId!);
    setMarketData(data);
  };

  const fetchChartData = useCallback(() => {
    try {
      const data = generateChartData(activeTimeframe, marketId);

      updateState({
        chartData: data,
        currentPrice: data[data.length - 1].close,
        status: 'success'
      });

    } catch (err) {
      console.error("Error generating chart data:", err);
      updateState({
        error: err instanceof Error ? err.message : 'Failed to load chart data'
      });
    }
  }, [activeTimeframe, marketId, updateState]);

  const handleTimeframeChange = (timeframe: TimeframeOption) => {
    updateState({ activeTimeframe: timeframe });
  };

  const refreshChart = () => {
    updateState({ status: 'loading' });
    setTimeout(() => {
      const data = generateChartData(activeTimeframe, marketId);
      updateState({
        chartData: data,
        status: 'success',
        currentPrice: data[data.length - 1].close,
        priceChange: (Math.random() * 4 - 2)
      });
    }, 500);
  };

  const handleQuantityChange = (quantity: number) => {
    updateState({ quantity });
  };

  const handleSubmitForecast = () => {
    if (!marketData || quantity <= 0) return;
    // Submit logic here
  };

  useEffect(() => {
    if (status === 'success' && marketData && !chartData) {
      fetchChartData();
    }
  }, [fetchChartData, status, marketData, chartData]);

  useEffect(() => {
    if (status === 'success' && chartData) {
      fetchChartData();
    }
  }, [activeTimeframe, fetchChartData, status, chartData]);

  useEffect(() => {
    fetchMarketData();
  }, []);

  if (status === 'loading' && !chartData) {
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
    <div className="bg-black min-h-screen text-white">
      <div className="max-w-8xl mx-auto p-6 sm:p-8">
        {/* Back link */}
        <div className="mb-6">
          <Link
            to="/"
            className="text-gray-400 hover:text-orange-500 flex items-center gap-2 group"
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
        <div className="flex flex-col lg:flex-row gap-6 ">
          {/* Left side - Chart takes full height */}
          <div className="lg:w-4/5 lg:h-full">
            <ChartCard
              marketData={marketData}
              chartData={chartData}
              currentPrice={currentPrice}
              priceChange={priceChange}
              activeTimeframe={activeTimeframe}
              isLoading={status === 'loading'}
              onTimeframeChange={handleTimeframeChange}
              onRefresh={refreshChart}
              marketId={marketId!}
            />
          </div>

          {/* Right side - Trading panel and market info stacked to match chart height */}
          <div className="lg:w-1/5 lg:h-full flex flex-col gap-4">
            <div className="lg:flex-1">
              <TradingPanel
                marketData={marketData}
                isBuy={isBuyState}
                isYes={isYes}
                quantity={quantity}
                onBuySellToggle={setIsBuy}
                onYesNoToggle={setIsYes}
                onQuantityChange={handleQuantityChange}
                onSubmit={handleSubmitForecast}
              />
            </div>
            
            <div className="lg:flex-1">
              <MarketInfoCard marketData={marketData} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Trade;
