
import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import type { TradeState, TimeframeOption } from '../lib/interface';
import { generateChartData } from '../utils/calculations';
import ChartCard from '../components/ChartCard';
import MarketInfoCard from '../components/MarketInfoCard';
import TradingPanel from '../components/TradingPanel';

const initialState: TradeState = {
  activeTimeframe: '1D',
  quantity: 10,
  isBuy: true,
  currentPrice: 0,
  priceChange: 0,
  status: 'idle',
  error: null,
  marketData: null,
  chartData: null
};

const Trade = () => {
  const { marketId } = useParams<{ marketId: string }>();
  const location = useLocation();
  
  // Extract marketData and initialBuy (for Yes/No buttons) from location state
  const passedState = location.state as { 
    marketData: TradeState['marketData'], 
    initialBuy?: boolean 
  } | null;
  
  // Initialize state with passed marketData if available
  const [state, setState] = useState<TradeState>({
    ...initialState,
    isBuy: passedState?.initialBuy ?? true,
    marketData: passedState?.marketData || null,
  });
  
  const { 
    activeTimeframe, 
    quantity, 
    isBuy, 
    currentPrice, 
    priceChange, 
    status, 
    marketData, 
    chartData 
  } = state;

  const updateState = useCallback((updates: Partial<TradeState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);
  


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
  
  // Handle timeframe change
  const handleTimeframeChange = (timeframe: TimeframeOption) => {
    updateState({ activeTimeframe: timeframe });
  };
  
  // Handle chart refresh
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
  
  const handleBuySellToggle = (isBuy: boolean) => {
    updateState({ isBuy });
  };
  
  const handleQuantityChange = (quantity: number) => {
    updateState({ quantity });
  };
  
  const handleSubmitForecast = () => {
    if (!marketData || quantity <= 0) return;
    
    alert(`Forecast placed: ${isBuy ? 'YES - ' + marketData.outcomes.yes : 'NO - ' + marketData.outcomes.no} for $${quantity.toFixed(2)}`);
  };
  
 
  
  // Initialize chart data when market data is ready
  useEffect(() => {
    if (status === 'success' && marketData && !chartData) {
      fetchChartData();
    }
  }, [fetchChartData, status, marketData, chartData]);
  
  // Update chart when timeframe changes
  useEffect(() => {
    if (status === 'success' && chartData) {
      fetchChartData();
    }
  }, [activeTimeframe, fetchChartData, status, chartData]);
  
  // Loading state
  if (status === 'loading' && !chartData) {
    return (
      <div className="bg-[#0d1117] min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!marketData) {
    return (
      <div className="bg-[#0d1117] min-h-screen flex items-center justify-center">
        <div className="text-white">No market data available</div>
      </div>
    );
  }

  return (
    <div className="bg-[#030303] min-h-screen font-sans text-white">
      <div className="max-w-7xl mx-auto p-4">
        <div className="mb-4">
          <Link to="/" className="text-gray-400 hover:text-orange-500 transition-colors duration-200 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6"/>
            </svg>
            Back to Markets
          </Link>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-5">
          <div className="lg:w-8/12 flex flex-col space-y-5">
            {/* Chart Card */}
            <ChartCard 
              marketData={marketData}
              chartData={chartData}
              currentPrice={currentPrice}
              priceChange={priceChange}
              activeTimeframe={activeTimeframe}
              isLoading={status === 'loading'}
              onTimeframeChange={handleTimeframeChange}
              onRefresh={refreshChart}
            />
            
            <MarketInfoCard 
              marketData={marketData}
            />
          </div>

          <div className="lg:w-4/12">
            <TradingPanel 
              marketData={marketData}
              isBuy={isBuy}
              quantity={quantity}
              onBuySellToggle={handleBuySellToggle}
              onQuantityChange={handleQuantityChange}
              onSubmit={handleSubmitForecast}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Trade;