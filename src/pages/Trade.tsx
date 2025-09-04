import { useState, useEffect, useCallback } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import type { TradeState, Market } from "../lib/interface";
import ChartCard from "../components/ChartCard";
import TradingPanel from "../components/TradingPanel";
import { fetchMarket } from "../apis/market";
import MarketHeaderDemo from "../components/MarketHeader";
import LatestOrders from "../components/LatestOrders";
import { Clock, AlertCircle, TrendingUp, Share } from "lucide-react";

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
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [marketData, setMarketData] = useState<Market | null>(null);
  const [isMarketExpired, setIsMarketExpired] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const passedState = location.state as {
    initialBuy?: boolean;
  } | null;

  const [state, setState] = useState<TradeState>({
    ...initialState,
    isBuy: passedState?.initialBuy ?? true,
  });

  const { quantity, isBuy, status, chartData } = state;

  const updateState = useCallback((updates: Partial<TradeState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  }, []);

  const [isYes, setIsYes] = useState(true);
  const [isBuyState,] = useState(isBuy);

  // Check if market is expired or closed
  const checkMarketStatus = (market: Market): boolean => {
    if (!market) return false;
    
    const now = new Date();
    const expiryDate = new Date(market.expiry_date);
 
    return (
      now >= expiryDate || 
      market.status === 'CLOSED' || 
      market.status === 'EXPIRED' ||
      market.isResolved === true
    );
  };

  const fetchMarketData = async () => {
    setLoading(true);
    setError(null);
    try {
      if (!marketId) {
        throw new Error('No market ID provided');
      }
      
      const data = await fetchMarket(marketId);
      setMarketData(data);
      
      // Check if market is expired/closed
      const expired = checkMarketStatus(data);
      setIsMarketExpired(expired);
      
    } catch (error: any) {
      console.error('Error fetching market data:', error);
      setError(error.message || 'Failed to load market data');
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = (quantity: number) => {
    updateState({ quantity });
  };

  const handleSubmitForecast = () => {
    if (!marketData || quantity <= 0) return;
    // Submit logic here
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleViewMarketDetails = () => {
    navigate(`/market/${marketId}`);
  };

  const handleShareOnX = () => {
    if (!marketData) return;
    const marketTitle = marketData.question || 'Untitled Market';
    const marketUrl = `https://spredd.markets/trade/${marketData.id}`;
    const tweetText = `${marketTitle}\n\n${marketUrl}\n\n@spreddai`;
    const twitterUrl = `https://x.com/intent/post?text=${encodeURIComponent(tweetText)}`;
    window.open(twitterUrl, '_blank');
  };

  useEffect(() => {
    fetchMarketData();
  }, []);
  
  // Loading state
  if (status === "loading" && !chartData) {
    return (
      <div className="bg-black min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-black min-h-screen flex items-center justify-center text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p>Loading market data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-black min-h-screen flex items-center justify-center text-white px-4">
        <div className="max-w-md w-full bg-zinc-900/50 rounded-xl border border-zinc-800 p-8 text-center">
          <div className="mb-6">
            <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">Error Loading Market</h2>
            <p className="text-gray-400 text-sm">{error}</p>
          </div>
          
          <div className="space-y-3">
            <button
              onClick={fetchMarketData}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={handleGoBack}
              className="w-full px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
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

  // Market expired/closed state
  if (isMarketExpired) {
    const isResolved = marketData.isResolved || marketData.status === 'CLOSED';
    const expiryDate = new Date(marketData.expiry_date);
    const now = new Date();
    const timeAgo = Math.floor((now.getTime() - expiryDate.getTime()) / (1000 * 60 * 60 * 24));

    return (
      <div className="bg-black min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-zinc-900/50 rounded-xl border border-zinc-800 p-8 text-center">
          <div className="mb-6">
            {isResolved ? (
              <div className="w-16 h-16 mx-auto bg-blue-500/20 rounded-full flex items-center justify-center mb-4">
                <TrendingUp className="w-8 h-8 text-blue-400" />
              </div>
            ) : (
              <div className="w-16 h-16 mx-auto bg-red-500/20 rounded-full flex items-center justify-center mb-4">
                <Clock className="w-8 h-8 text-red-400" />
              </div>
            )}
            
            <h2 className="text-xl font-bold text-white mb-2">
              {isResolved ? 'Market Resolved' : 'Market Expired'}
            </h2>
            
            <p className="text-gray-400 text-sm mb-4">
              {isResolved 
                ? 'This market has been resolved and trading is no longer available.'
                : `This market expired ${timeAgo > 0 ? `${timeAgo} day${timeAgo > 1 ? 's' : ''} ago` : 'recently'}.`
              }
            </p>

            <div className="bg-zinc-800/50 rounded-lg p-4 mb-6">
              <h3 className="text-white font-medium mb-2 truncate">
                {marketData.question}
              </h3>
              <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
                <Clock className="w-4 h-4" />
                <span>
                  Expired: {expiryDate.toLocaleDateString()}
                </span>
              </div>
              {marketData.status && (
                <div className="mt-2">
                  <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                    marketData.status === 'CLOSED' 
                      ? 'bg-blue-500/20 text-blue-400' 
                      : 'bg-red-500/20 text-red-400'
                  }`}>
                    {marketData.status}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleViewMarketDetails}
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105"
            >
              View Market Details
            </button>
            
            <button
              onClick={handleGoBack}
              className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-300 border border-zinc-700 hover:border-zinc-600"
            >
              Go Back
            </button>
          </div>

          {isResolved && (
            <div className="mt-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
              <div className="flex items-center justify-center gap-2 text-green-400 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>Check your profile to claim any winnings</span>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Normal trading interface for active markets
  return (
    <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10 bg-gradient-to-br from-white/5 via-transparent to-black/20">
      <div className="max-w-8xl mx-auto p-6 sm:p-8">
        {/* Layout - Optimized for laptop screen symmetry */}
        <div className="flex flex-col lg:flex-row gap-6 max-w-7xl mx-auto ">
          <div className="flex flex-col lg:w-[60%] lg:h-full gap-y-4">
            <MarketHeaderDemo marketData={marketData} />
            <div className="">
              <ChartCard
                marketData={marketData}
                marketId={marketId!}
              />
            </div>
          </div>
          
          {/* Right side - Trading panel and market info stacked to match chart height */}
          <div className="lg:w-[40%] lg:h-1/2 flex flex-col gap-4">
            {/* Share on X Button */}
            <button
              onClick={handleShareOnX}
              className="flex items-center justify-center gap-2 bg-gradient-to-br from-zinc-900/95 to-zinc-950/95 backdrop-blur-sm border border-slate-600/40 hover:border-zinc-700/60 rounded-xl px-4 py-3 transition-all duration-300 hover:scale-[1.02] shadow-xl hover:shadow-2xl relative"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/[0.02] via-transparent to-purple-500/[0.02] rounded-xl"></div>
              <div className="relative z-10 flex items-center gap-2">
                <Share size={18} className="text-white" />
                <span className="text-white text-sm font-semibold">Share on X</span>
              </div>
            </button>
            
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
            
            {/* Latest Orders Component */}
            <div className="">
              <LatestOrders marketId={marketId!} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Trade;