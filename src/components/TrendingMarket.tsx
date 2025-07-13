import { Flame} from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  fetchMostTradedMarkets,
  handleDashboardError,
  type MostTradedMarket,
} from "../apis/leaderboard";

type TrendingType = "MOST_TRADED" | "RECENT" | "POPULAR";

const TrendingMarket = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [trendingType, setTrendingType] = useState<TrendingType>("MOST_TRADED");
  const [trendingMarkets, setTrendingMarkets] = useState<MostTradedMarket[]>(
    []
  );
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const getTrendingMarkets = async (
    type: TrendingType,
    limit: number = 10,
    isRefresh = false
  ) => {
    // Only show loading state on initial load or trending type change, not on refresh
    if (!isRefresh) {
      setLoading(true);
    }
    setError(null);

    try {
      // For now, we only have most traded API
      // You can extend this when other APIs are available
      if (type === "MOST_TRADED") {
        const [data, status] = await fetchMostTradedMarkets(limit);
        if (status === 200 && data) {
          setTrendingMarkets(data);
          if (isInitialLoad) {
            setIsInitialLoad(false);
          }
          return;
        } else {
          throw new Error("Failed to fetch trending markets");
        }
      } else {
        // Placeholder for other types - you can implement these APIs later
        setTrendingMarkets([]);
        if (isInitialLoad) {
          setIsInitialLoad(false);
        }
      }
    } catch (err: any) {
      const errorMsg = handleDashboardError(err, "fetchMostTradedMarkets");
      setError(errorMsg);
    } finally {
      if (!isRefresh) {
        setLoading(false);
      }
    }
  };

  const handleTrendingTypeChange = (type: TrendingType) => {
    setTrendingType(type);
    getTrendingMarkets(type, 10, false); // Not a refresh, show loading
  };

  useEffect(() => {
    getTrendingMarkets(trendingType, 10, false); // Initial load
    const interval = setInterval(() => {
      getTrendingMarkets(trendingType, 10, true); // This is a refresh
    }, 30000); // Update every 30 seconds for trending markets
    return () => clearInterval(interval);
  }, [trendingType]);

  const getTrendingLabel = (type: TrendingType) => {
    switch (type) {
      case "MOST_TRADED":
        return "Most Traded";
      case "RECENT":
        return "Recent";
      case "POPULAR":
        return "Popular";
      default:
        return "Trending";
    }
  };

  return (
  <div className="border border-zinc-800 rounded-2xl w-full shadow-xl bg-gradient-to-b from-[#111] to-[#0a0a0a]">
    <div className="p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between mb-6 gap-3">
        <Link to="/markets" className="block">
          <h2 className="text-white font-serif text-2xl md:text-3xl font-bold tracking-tight bg-gradient-to-r from-orange-500 to-orange-700 bg-clip-text text-transparent">
            Trending Markets
          </h2>
        </Link>

        <div className="flex space-x-3">
          <button
            onClick={() => handleTrendingTypeChange("MOST_TRADED")}
            className={`p-2 rounded-full border border-zinc-700 transition-all duration-300 hover:shadow-md hover:scale-110 ${
              trendingType === "MOST_TRADED"
                ? "bg-gradient-to-br from-orange-600 to-orange-700 shadow-orange-500/20"
                : "bg-zinc-800"
            }`}
            title="Most Traded (24h)"
          >
            <Flame
              className={`w-5 h-5 ${
                trendingType === "MOST_TRADED"
                  ? "text-orange-100"
                  : "text-white"
              }`}
            />
          </button>
        </div>
      </div>

      {/* Scrollable Content */}
      <div
        className="overflow-y-auto overflow-x-hidden scrollbar-hide overscroll-contain pr-1"
        style={{
          minHeight: "280px",
          maxHeight: "280px",
        }}
      >
        {loading && isInitialLoad && (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
          </div>
        )}

        {error && !loading && (
          <div className="flex items-center justify-center h-full">
            <p className="text-red-500 font-serif">{error}</p>
          </div>
        )}

        {!loading &&
          !error &&
          trendingMarkets.length === 0 &&
          !isInitialLoad && (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500 font-serif">
                No {getTrendingLabel(trendingType).toLowerCase()} markets found.
              </p>
            </div>
          )}

        {!loading && !error && trendingMarkets.length > 0 && (
          <div className="space-y-2">
            {trendingMarkets.map((market, index) => (
              <Link to={`/trade/${market.id}`} key={market.id} className="block">
                <div className="flex items-center group hover:bg-orange-500/5 hover:shadow-inner rounded-lg transition-all duration-300 cursor-pointer p-2 min-h-[52px]">
                  <div className="text-gray-500 font-serif mr-3 w-6 text-center text-sm sm:text-base font-bold">
                    #{index + 1}
                  </div>

                  <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-full overflow-hidden mr-3 bg-gradient-to-br from-gray-800 to-black p-0.5 flex items-center justify-center group-hover:ring-2 group-hover:ring-orange-500 transition-all duration-300">
                    <img
                      src={market.image}
                      alt={`${market.id}'s avatar`}
                      className="w-full h-full object-cover rounded-full"
                      loading="lazy"
                    />
                  </div>

                  <div className="flex-1 mr-3 min-w-0">
                    <p className="text-white font-serif text-sm sm:text-base group-hover:text-orange-100 transition-colors duration-300 truncate">
                      {market.question}
                    </p>
                    <p className="text-gray-500 text-xs group-hover:text-gray-400 transition-colors duration-300 truncate">
                      by {market.creator.username}
                    </p>
                  </div>

                  <div className="text-right">
                    <div className="text-orange-500 font-serif text-sm sm:text-base font-bold whitespace-nowrap group-hover:text-orange-400 transition-all duration-300">
                      {market.tradeCount.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500 group-hover:text-gray-400 transition-colors duration-300">
                      {market.tradeCount === 1 ? "Trade" : "Trades"}
                    </div>
                  </div>
                </div>
              </Link>
            ))}

            {trendingMarkets.length === 10 && (
              <Link to="/markets" className="block mt-4">
                <div className="text-center p-3 text-orange-500 hover:text-orange-400 transition-colors duration-300 font-serif text-sm border-t border-zinc-800">
                  View All Markets →
                </div>
              </Link>
            )}
          </div>
        )}

        {trendingMarkets.length > 0 && loading && !isInitialLoad && (
          <div className="space-y-2">
            {trendingMarkets.map((market, index) => (
              <Link to={`/trade/${market.id}`} key={market.id} className="block">
                <div className="flex items-center group hover:bg-orange-500/5 hover:shadow-inner rounded-lg transition-all duration-300 cursor-pointer p-2 min-h-[52px]">
                  <div className="text-gray-500 font-serif mr-3 w-6 text-center text-sm sm:text-base font-bold">
                    #{index + 1}
                  </div>

                  <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-full overflow-hidden mr-3 bg-gradient-to-br from-gray-800 to-black p-0.5 flex items-center justify-center group-hover:ring-2 group-hover:ring-orange-500 transition-all duration-300">
                    <img
                      src={market.image}
                      alt={`${market.id}'s avatar`}
                      className="w-full h-full object-cover rounded-full"
                      loading="lazy"
                    />
                  </div>

                  <div className="flex-1 mr-3 min-w-0">
                    <p className="text-white font-serif text-sm sm:text-base group-hover:text-orange-100 transition-colors duration-300 truncate">
                      {market.question}
                    </p>
                    <p className="text-gray-500 text-xs group-hover:text-gray-400 transition-colors duration-300 truncate">
                      by {market.creator.username}
                    </p>
                  </div>

                  <div className="text-right">
                    <div className="text-orange-500 font-serif text-sm sm:text-base font-bold whitespace-nowrap group-hover:text-orange-400 transition-all duration-300">
                      {market.tradeCount.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500 group-hover:text-gray-400 transition-colors duration-300">
                      {market.tradeCount === 1 ? "Trade" : "Trades"}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  </div>
);

};

export default TrendingMarket;
