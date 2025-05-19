import { useState, useEffect, useRef, useCallback } from 'react';
import { RefreshCw, Settings, Info, ArrowUp, ArrowDown, AlertCircle } from 'lucide-react';
import { useParams, useNavigate, Link } from 'react-router-dom';

// Define proper TypeScript interfaces for the market data
interface MarketData {
  id: string;
  name: string;
  type: string;
  outcomes: {
    yes: string;
    no: string;
  };
  category: string;
  endDate: string;
  creator: string;
  volume: string;
  probabilities: {
    yes: number;
    no: number;
  };
  description: string;
  iconUrl?: string;
}

interface ChartDataPoint {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

// Define the component state with proper typing
interface TradeState {
  activeTimeframe: '1H' | '6H' | '1D' | '1W' | '1M' | '6M';
  quantity: number;
  isBuy: boolean;
  currentPrice: number;
  priceChange: number;
  status: 'idle' | 'loading' | 'success' | 'error';
  error: string | null;
  marketData: MarketData | null;
  chartData: ChartDataPoint[] | null;
}

// Initial state
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
  // Get marketId from URL params
  const { marketId } = useParams<{ marketId: string }>();
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [state, setState] = useState<TradeState>(initialState);
  
  const { 
    activeTimeframe, 
    quantity, 
    isBuy, 
    currentPrice, 
    priceChange, 
    status, 
    error, 
    marketData, 
    chartData 
  } = state;


  const updateState = useCallback((updates: Partial<TradeState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);
  
  // Fetch market data
  const fetchMarketData = useCallback(async () => {
    try {
      updateState({ status: 'loading', error: null });
      // const response = await fetch(`/api/markets/${marketId}`);
      // const data = await response.json();
      
      // delay and return mock data for now
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const mockData: MarketData = {
        id: marketId || '123',
        name: marketId ? `Market ${marketId}` : 'AI Breakthrough Prediction',
        type: 'Tech Forecast',
        outcomes: { yes: 'GPT-5 Release in 2025', no: 'No GPT-5 in 2025' },
        category: 'Technology',
        endDate: 'Dec 31, 2025',
        creator: 'ForecastWizard',
        volume: '$845K',
        probabilities: { yes: 0.54, no: 0.46 },
        description: 'This forecast resolves to YES if OpenAI officially releases GPT-5 during the 2025 calendar year. Resolution will be based on official announcements and verified releases.'
      };
      
      updateState({ 
        marketData: mockData, 
        status: 'success',
        currentPrice: mockData.probabilities.yes,
        priceChange: (Math.random() * 4 - 2)
      });
      

      fetchChartData();
      
    } catch (err) {
      console.error("Error fetching market data:", err);
      updateState({ 
        status: 'error', 
        error: err instanceof Error ? err.message : 'Failed to load market data' 
      });
    }
  }, [marketId, updateState]);


  const fetchChartData = useCallback(async () => {
    try {
      //  separate api call for final
      // mock data for now
      const data = generateChartData();
      
      updateState({ 
        chartData: data,
        currentPrice: data[data.length - 1].close
      });
      
      drawChart(data);
      
    } catch (err) {
      console.error("Error fetching chart data:", err);
      updateState({ 
        error: err instanceof Error ? err.message : 'Failed to load chart data' 
      });
    }
  }, [activeTimeframe, updateState]);
  
  useEffect(() => {
    fetchMarketData();
  }, [marketId, fetchMarketData]);
  
  useEffect(() => {
    if (!chartData) return;
    
    const handleResize = () => drawChart(chartData);
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, [chartData]);
  
  // Draw chart when timeframe changes
  useEffect(() => {
    if (state.status === 'success' && chartData) {
      drawChart(chartData);
    }
  }, [activeTimeframe, chartData]);
  
  const drawChart = (data: ChartDataPoint[]) => {
    try {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      const parent = canvas.parentElement;
      if (!parent) return;
      
      canvas.width = parent.clientWidth || 800;
      canvas.height = parent.clientHeight || 360;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#0d1117';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw grid lines
      const drawGrid = () => {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.lineWidth = 1;
        
        // Horizontal lines
        for (let i = 1; i < 5; i++) {
          const y = (canvas.height / 5) * i;
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(canvas.width, y);
          ctx.stroke();
        }
        
        // Vertical lines
        for (let i = 1; i < 6; i++) {
          const x = (canvas.width / 6) * i;
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, canvas.height);
          ctx.stroke();
        }
      };
      
      drawGrid();
      
      // Draw candlestick chart
      drawCandlestickChart(ctx, data, canvas.width, canvas.height);
      
    } catch (error) {
      console.error("Error drawing chart:", error);
    }
  };
  
  // Draw candlestick chart
  const drawCandlestickChart = (
    ctx: CanvasRenderingContext2D, 
    data: ChartDataPoint[], 
    width: number, 
    height: number
  ) => {
    if (!data || data.length === 0) return;
    
    // Find min/max for scaling
    let minPrice = Math.min(...data.map(d => d.low));
    let maxPrice = Math.max(...data.map(d => d.high));
    const padding = (maxPrice - minPrice) * 0.1;
    minPrice = Math.max(0, minPrice - padding);
    maxPrice = Math.min(1, maxPrice + padding);
    
    // Scale Y values
    const scaleY = (value: number) => height - ((value - minPrice) / (maxPrice - minPrice || 1)) * height;
    
    // Candle dimensions
    const candleWidth = Math.min(16, width / Math.max(1, data.length) * 0.8);
    const candleSpacing = width / Math.max(1, data.length);
    
    // Draw line connecting closes
    ctx.beginPath();
    ctx.moveTo(candleSpacing/2, scaleY(data[0].close));
    data.forEach((candle, i) => {
      if (i > 0) ctx.lineTo((i * candleSpacing) + (candleSpacing/2), scaleY(candle.close));
    });
    ctx.strokeStyle = 'rgba(75, 85, 99, 0.5)';
    ctx.lineWidth = 1;
    ctx.stroke();
    
    // Draw candles
    data.forEach((candle, i) => {
      const x = (i * candleSpacing) + (candleSpacing/2) - (candleWidth/2);
      const isUp = candle.close >= candle.open;
      const color = isUp ? '#4CAF50' : '#EF5350';
      const fillColor = isUp ? 'rgba(76, 175, 80, 0.3)' : 'rgba(239, 83, 80, 0.3)';
      
      // Draw wick
      ctx.beginPath();
      ctx.moveTo(x + (candleWidth/2), scaleY(candle.high));
      ctx.lineTo(x + (candleWidth/2), scaleY(candle.low));
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.stroke();
      
      // Draw body
      const openY = scaleY(candle.open);
      const closeY = scaleY(candle.close);
      const bodyHeight = Math.max(1, Math.abs(closeY - openY));
      const bodyY = Math.min(openY, closeY);
      
      ctx.fillStyle = fillColor;
      ctx.strokeStyle = color;
      ctx.fillRect(x, bodyY, candleWidth, bodyHeight);
      ctx.strokeRect(x, bodyY, candleWidth, bodyHeight);
    });
    
    // Draw price labels
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.font = '12px Arial';
    ctx.textAlign = 'right';
    for (let i = 0; i <= 5; i++) {
      const price = minPrice + ((maxPrice - minPrice) * (i / 5));
      ctx.fillText(`${Math.round(price * 100)}%`, width - 10, scaleY(price) + 4);
    }
    
    // Draw time labels
    ctx.textAlign = 'center';
    const steps = Math.min(6, data.length);
    for (let i = 0; i < steps; i++) {
      const dataIndex = Math.floor((i / (steps - 1)) * (data.length - 1));
      const x = (dataIndex / (data.length - 1)) * width;
      const date = new Date(data[dataIndex].time);
      const timeLabel = activeTimeframe === '1H' || activeTimeframe === '6H' 
        ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : date.toLocaleDateString([], { month: 'short', day: 'numeric' });
      ctx.fillText(timeLabel, x, height - 10);
    }
  };
  
  // Generate mock chart data for now - will be replaced by API call later
  const generateChartData = (): ChartDataPoint[] => {
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
    const volatility = { 
      '1H': 0.01, '6H': 0.015, '1D': 0.02, '1W': 0.025, '1M': 0.03, '6M': 0.04 
    }[activeTimeframe] || 0.01;
    
    // Create trend simulation
    let trendPhase = 0, trendDuration = Math.floor(Math.random() * 20) + 10;
    let trend = Math.random() > 0.5 ? 1 : -1;
    
    // Make the seed consistent based on the marketId so the same market 
    // will have similar (but not identical) charts each time
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
  
  // Handle chart refresh button click
  const refreshChart = () => {
    updateState({ status: 'loading' });
    setTimeout(() => {
      const data = generateChartData();
      updateState({ 
        chartData: data,
        status: 'success',
        currentPrice: data[data.length - 1].close,
        priceChange: (Math.random() * 4 - 2)
      });
      drawChart(data);
    }, 500);
  };

  // Handle quantity input change
  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    updateState({ 
      quantity: !isNaN(value) && value >= 0 ? value : 0 
    });
  };

  // Calculate potential return
  const calculateReturn = () => {
    // In a real app, this would use more complex logic based on market odds
    return (quantity * (isBuy ? 1.8 : 0.15)).toFixed(2);
  };
  
  // Calculate odds display
  const calculateOdds = () => {
    if (!marketData) return 0;
    
    const probability = isBuy ? marketData.probabilities.yes : marketData.probabilities.no;
    
    let odds = probability >= 0.5 
      ? Math.round(-100 * probability / (1 - probability))
      : Math.round(100 * (1 - probability) / probability);
      
    return isBuy ? odds : -odds;
  };
  
  // Handle forecast submission
  const handleSubmitForecast = () => {
    if (!marketData || quantity <= 0) return;
    
    // Ie an API call to submit the forecast
    // For now, we just show an alert
    alert(`Forecast placed: ${isBuy ? 'YES - ' + marketData.outcomes.yes : 'NO - ' + marketData.outcomes.no} for $${quantity.toFixed(2)}`);
    
    // After submission, ywe typically
    // Show a loading state, make api call, show sucess,error, update ui
  };
  
  // Show loading state while fetching data
  if (status === 'loading' && !marketData) {
    return (
      <div className="bg-[#0d1117] min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }
  
  // Show error state if something went wrong
  if (status === 'error' && error) {
    return (
      <div className="bg-[#0d1117] min-h-screen flex items-center justify-center">
        <div className="bg-[#171c21] p-8 rounded-lg max-w-md text-center">
          <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
          <h2 className="text-xl text-white mb-2">Something went wrong</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <button 
            onClick={() => fetchMarketData()} 
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-md transition-colors"
          >
            Try Again
          </button>
          <Link 
            to="/" 
            className="block mt-4 text-orange-500 hover:text-orange-400 transition-colors"
          >
            Return to Markets
          </Link>
        </div>
      </div>
    );
  }

  // If we have no market data (shouldn't happen with proper loading state)
  if (!marketData) {
    return (
      <div className="bg-[#0d1117] min-h-screen flex items-center justify-center">
        <div className="text-white">No market data available</div>
      </div>
    );
  }

  // Main render with market data
  const { outcomes, category, endDate, creator, volume, description } = marketData;

  return (
    <div className="bg-[#030303] min-h-screen font-sans text-white">
      <div className="max-w-7xl mx-auto p-4">
        {/* Back Button */}
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
            <div className="border border-[#222] rounded-lg overflow-hidden bg-[#0d1117] shadow-lg">
              {/* Header */}
              <div className="px-5 py-4 border-b border-[#222] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full overflow-hidden bg-orange-500 flex items-center justify-center">
                    <span className="text-black font-bold">{category.substring(0, 1)}</span>
                  </div>
                  <div>
                    <div className="flex items-center">
                      <h1 className="text-xl font-bold text-white">{marketData.name}</h1>
                      <span className="ml-2 px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded">YES</span>
                    </div>
                    <div className="text-[#888] text-sm flex items-center">
                      <span>Volume: {volume}</span>
                      <span className="mx-2">•</span>
                      <span>Ending: {endDate}</span>
                    </div>
                  </div>
                </div>
                
                {/* Timeframe selector */}
                <div className="flex items-center gap-1 w-full sm:w-auto">
                  <div className="flex bg-[#171c21] rounded-md p-1 flex-1 sm:flex-auto">
                    {['1H', '6H', '1D', '1W', '1M', '6M'].map(tf => (
                      <button
                        key={tf}
                        className={`px-3 py-1.5 text-sm rounded transition-all flex-1 ${
                          activeTimeframe === tf ? 'bg-[#2c3136] text-white' : 'text-[#888] hover:text-[#bbb] hover:bg-[#1f2429]'
                        }`}
                        onClick={() => {
                          updateState({ activeTimeframe: tf as TradeState['activeTimeframe'] });
                          // Chart will be redrawn by the useEffect
                        }}
                      >
                        {tf}
                      </button>
                    ))}
                  </div>
                  <button 
                    onClick={refreshChart} 
                    disabled={status === 'loading'}
                    className="p-2 text-[#888] hover:text-white rounded-md hover:bg-[#1f2429] transition-colors"
                  >
                    <RefreshCw size={16} className={status === 'loading' ? "animate-spin" : ""} />
                  </button>
                  <button className="p-2 text-[#888] hover:text-white rounded-md hover:bg-[#1f2429] transition-colors">
                    <Settings size={16} />
                  </button>
                </div>
              </div>
              
              {/* Price info */}
              <div className="px-5 pt-4 flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-2xl font-bold text-white">{Math.round(currentPrice * 100)}%</span>
                  <span className={`ml-2 flex items-center ${parseFloat(priceChange.toString()) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {parseFloat(priceChange.toString()) >= 0 ? <ArrowUp size={16} className="mr-1" /> : <ArrowDown size={16} className="mr-1" />}
                    {Math.abs(parseFloat(priceChange.toFixed(1)))}%
                  </span>
                  <span className="ml-3 text-[#888] text-sm px-2 py-1 bg-[#171c21] rounded-md">
                    Odds: {calculateOdds()}
                  </span>
                </div>
                <div className="text-[#888] text-sm">
                  24h High: 58% • Low: 49%
                </div>
              </div>
              
              {/* Chart */}
              <div className="h-[360px] relative px-2 pb-4 pt-2">
                {status === 'loading' && (
                  <div className="absolute inset-0 bg-[#0d1117]/80 flex items-center justify-center z-10">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
                  </div>
                )}
                <canvas ref={canvasRef} className="w-full h-full" />
              </div>
            </div>
            
            {/* Market description */}
            <div className="border border-[#222] rounded-lg overflow-hidden bg-[#0d1117] p-5 shadow-lg">
              <div className="flex items-start justify-between mb-5 flex-col sm:flex-row gap-4">
                <div className="flex items-center gap-4">
                  <div className="min-w-[56px] h-14 w-14 rounded-lg bg-orange-500 flex items-center justify-center">
                    <span className="text-2xl font-bold text-black">{category.substring(0, 1)}</span>
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-white">{marketData.name}</h2>
                    <div className="text-[#888] flex items-center text-sm mt-1 flex-wrap">
                      <span>Created by {creator}</span>
                      <span className="mx-2">•</span>
                      <span>Ending: {endDate}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-[#171c21] px-3 py-2 rounded-md">
                  <span className="text-[#888] text-sm">Probability:</span>
                  <span className="text-white font-bold">{Math.round(marketData.probabilities.yes * 100)}%</span>
                </div>
              </div>
              <div className="text-[#ccc] space-y-3">
                <p className="leading-relaxed">{description}</p>
                <div className="flex items-center mt-4 text-sm text-[#888]">
                  <Info size={16} className="mr-2 text-orange-500" />
                  <span>This is a prediction market. Learn more about forecasting on our platform.</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Trading panel */}
          <div className="lg:w-4/12">
            <div className="bg-[#0d1117] rounded-lg border border-[#222] overflow-hidden h-full shadow-lg">
              {/* Buy/Sell tabs */}
              <div className="grid grid-cols-2">
                <button 
                  className={`py-4 text-center font-medium text-lg transition-all ${
                    isBuy ? 'bg-green-600 text-white' : 'bg-[#0d1117] text-white hover:bg-[#171c21]'
                  }`}
                  onClick={() => updateState({ isBuy: true })}
                >
                  {outcomes.yes}
                </button>
                <button 
                  className={`py-4 text-center font-medium text-lg transition-all ${
                    !isBuy ? 'bg-red-600 text-white' : 'bg-[#0d1117] text-white hover:bg-[#171c21]'
                  }`}
                  onClick={() => updateState({ isBuy: false })}
                >
                  {outcomes.no}
                </button>
              </div>

              {/* Outcome section */}
              <div className="p-5 border-b border-[#222]">
                <h3 className="text-lg font-medium mb-4 text-white">Outcome</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div 
                    className={`p-4 rounded transition-all cursor-pointer ${
                      isBuy ? 'bg-[#132416] border border-green-900' : 'bg-[#171c21] hover:bg-[#1f2429]'
                    }`}
                    onClick={() => updateState({ isBuy: true })}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-green-500 font-bold flex items-center">
                        <span className="h-6 w-6 rounded-full bg-green-600 text-white flex items-center justify-center text-xs mr-2">Y</span>
                        YES
                      </span>
                      <span className="text-[#ccc] font-medium">${marketData.probabilities.yes.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#888]">{outcomes.yes}</span>
                      <span className="text-[#888]">{Math.round(marketData.probabilities.yes * 100)}%</span>
                    </div>
                  </div>
                  <div 
                    className={`p-4 rounded transition-all cursor-pointer ${
                      !isBuy ? 'bg-[#241313] border border-red-900' : 'bg-[#171c21] hover:bg-[#1f2429]'
                    }`}
                    onClick={() => updateState({ isBuy: false })}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-red-500 font-bold flex items-center">
                        <span className="h-6 w-6 rounded-full bg-red-600 text-white flex items-center justify-center text-xs mr-2">N</span>
                        NO
                      </span>
                      <span className="text-[#ccc] font-medium">${marketData.probabilities.no.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#888]">{outcomes.no}</span>
                      <span className="text-[#888]">{Math.round(marketData.probabilities.no * 100)}%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Amount input */}
              <div className="p-5 border-b border-[#222]">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-medium text-white">Forecast Amount (USDT)</h3>
                  <div className="text-sm text-[#888]">Balance: $1,000</div>
                </div>
                <div className="relative">
                  <input 
                    type="number" 
                    value={quantity} 
                    onChange={handleQuantityChange}
                    className="w-full bg-[#171c21] border border-[#333] rounded px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500"
                    min="0" 
                    step="0.01" 
                  />
                  <button 
                    onClick={() => updateState({ quantity: 1000 })}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-[#888] bg-[#232830] px-2 py-1 rounded hover:bg-[#2c3136]"
                  >
                    MAX
                  </button>
                </div>
                
                <div className="grid grid-cols-3 gap-3 mt-3">
                  <button 
                    onClick={() => updateState({ quantity: 0 })}
                    className="bg-[#171c21] text-[#ccc] py-2 rounded text-sm hover:bg-[#1f2429] transition-colors"
                  >
                    Reset
                  </button>
                  <button 
                    onClick={() => updateState({ quantity: 10 })}
                    className="bg-[#171c21] text-[#ccc] py-2 rounded text-sm hover:bg-[#1f2429] transition-colors"
                  >
                    $10
                  </button>
                  <button 
                    onClick={() => updateState({ quantity: 50 })}
                    className="bg-[#171c21] text-[#ccc] py-2 rounded text-sm hover:bg-[#1f2429] transition-colors"
                  >
                    $50
                  </button>
                </div>
              </div>

              {/* Potential returns */}
              <div className="p-5 border-b border-[#222]">
                <div className="flex justify-between items-center">
                  <span className="text-[#888]">Potential forecast points:</span>
                  <span className="text-white font-medium">{calculateReturn()} FP</span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-[#888]">Odds:</span>
                  <span className="text-white font-medium">{calculateOdds()}</span>
                </div>
              </div>

              {/* Submit button */}
              <div className="p-5">
                <button 
                  className={`w-full ${
                    isBuy ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                  } text-white font-bold py-3 px-4 rounded text-lg transition-all ${
                    quantity <= 0 ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  onClick={handleSubmitForecast}
                  disabled={quantity <= 0}
                >
                  Place Forecast
                </button>
                
                <div className="mt-5 space-y-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-[#888]">Platform Fee</span>
                    <span className="text-white">$0.00</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#ccc]">Total Cost</span>
                    <span className="text-white font-medium">$ {quantity.toFixed(2)}</span>
                  </div>
                  <div className="p-3 rounded bg-[#171c21]">
                    <div className="flex flex-col">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[#ccc]">Forecast on:</span>
                        <span className={`${isBuy ? 'text-green-500' : 'text-red-500'} font-bold`}>
                          {isBuy ? 'YES' : 'NO'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[#ccc]">If correct:</span>
                        <span className="text-green-500 font-bold">+{calculateReturn()} FP</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Trade;