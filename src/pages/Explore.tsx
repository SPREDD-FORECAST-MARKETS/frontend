import { useEffect, useState, useMemo } from "react";
import { TrendingUp } from "lucide-react";
import type { Market } from "../lib/interface";
import { fetchMarkets } from "../apis/market";
import { useMultipleMarketOdds } from "../hooks/useMarketDetails";
import { tags } from "../lib/data";
import TrendingMarket from "../components/TrendingMarket";
import MarketCards from "../components/MarketCards";
import TrendingBar from "../components/TrendingBar";

// Interfaces
interface EnhancedMarket extends Market {
  oddsData?: {
    probabilityA: number;
    probabilityB: number;
    totalVolume: number;
    oddsA: number;
    oddsB: number;
    error?: boolean;
  };
}

// Loader Component
const Loader = () => {
  return (
    <div className="flex justify-center items-center py-16">
      <div className="relative">
        {/* Outer ring */}
        <div className="w-12 h-12 rounded-full border-4 border-slate-700 border-t-orange-500 animate-spin"></div>
        {/* Inner ring */}
        <div className="absolute top-1 left-1 w-10 h-10 rounded-full border-4 border-slate-800 border-b-orange-500 animate-[spin_2s_linear_infinite]"></div>
        {/* Center dot */}
        <div className="absolute top-4 left-4 w-4 h-4 rounded-full bg-orange-500 animate-pulse shadow-md shadow-orange-500/30"></div>
      </div>
    </div>
  );
};

// Main Explore Component
const Explore = () => {
  // State Management
  const [markets, setMarkets] = useState<Market[]>([]);
  const [marketFilterTag, setMarketFilterTag] = useState<string | undefined>(
    undefined
  );
  const [isLoading, setIsLoading] = useState(false);

  // Memoized Market IDs
  const marketIds = useMemo(
    () => markets.map((market) => market.id.toString()),
    [markets]
  );

  // Fetch Market Odds
  const { data: allMarketOdds, isLoading: oddsLoading } =
    useMultipleMarketOdds(marketIds);

  // Fetch Markets Effect
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        let filteredTags = undefined;
        if (marketFilterTag !== undefined && marketFilterTag !== "Top") {
          filteredTags = [marketFilterTag];
        }
        const response = await fetchMarkets({ tags: filteredTags });
        console.log("Fetched markets:", response.data);
        setMarkets(response.data);
      } catch (error) {
        console.error("Error fetching markets:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [marketFilterTag]);

  // Market Status Check
  const isMarketClosed = (market: Market) => {
    const expiryDate = market.expiry_date;
    const currentDate = new Date();
    return new Date(expiryDate).getTime() <= currentDate.getTime();
  };

  // Enhanced Markets with Odds
  const enhancedMarkets: EnhancedMarket[] = useMemo(() => {
    return markets.map((market) => {
      const marketOddsData = allMarketOdds?.find(
        (odds) => odds.marketId === market.id.toString()
      );
      return {
        ...market,
        oddsData: marketOddsData || {
          probabilityA: 50,
          probabilityB: 50,
          totalVolume: 0,
          oddsA: 0,
          oddsB: 0,
          error: true,
        },
      };
    });
  }, [markets, allMarketOdds]);

  // Market Separation
  const liveMarkets = enhancedMarkets.filter(
    (market) => !isMarketClosed(market)
  );
  const closedMarkets = enhancedMarkets.filter((market) =>
    isMarketClosed(market)
  );

  // Render
  return (
    <div className="w-full bg-gradient-to-br from-white/5 via-transparent to-black/20 text-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
        {/* Trending Markets Section */}
        <section
          role="region"
          aria-label="Trending Markets"
          className="mb-8 animate-fade-in"
        >
          <h2 className="text-2xl sm:text-3xl font-semibold  text-orange-400 mb-4 ">
            HOT MARKETS
          </h2>
          <TrendingMarket />

        </section>



        {/* Market Listings Section */}
        <section
          role="region"
          aria-label="Market Listings"
          className="animate-fade-in"
        >
          <h2 className="text-2xl sm:text-3xl font-semibold text-orange-400 mb-4 ">
            MARKET LISTINGS
          </h2>

          {/* Market Filters Section */}
          <TrendingBar data={tags} onChangeTag={setMarketFilterTag} />
          {/* Loading State */}
          {(isLoading || oddsLoading) && <Loader />}

          {/* No Markets Found */}
          {!isLoading && !oddsLoading && markets.length === 0 && (
            <div className="py-16 text-center bg-slate-900/50 rounded-xl border border-slate-700/50 shadow-lg shadow-orange-500/10">
              <div className="relative">
                <div className="absolute inset-0 flex items-center justify-center opacity-10">
                  <div className="w-64 h-64 bg-gradient-to-r from-orange-500/20 to-orange-600/20 rounded-full blur-3xl"></div>
                </div>
                <div className="relative z-10 space-y-4">
                  <div className="w-16 h-16 mx-auto bg-slate-800 rounded-full flex items-center justify-center shadow-md">
                    <TrendingUp className="w-8 h-8 text-orange-400" />
                  </div>
                  <p className="text-white text-lg sm:text-xl font-medium">
                    No markets found for this category
                  </p>
                  <p className="text-orange-400 text-base sm:text-lg">
                    Try a different filter or create your own prediction!
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Market Cards */}
          {!isLoading && !oddsLoading && markets.length > 0 && (
            <div className="px-2 sm:px-4">
              <MarketCards data={[...liveMarkets, ...closedMarkets]} />
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Explore;
