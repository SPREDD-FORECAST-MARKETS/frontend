import { Flame, Clock, Star, TrendingUp } from "lucide-react";
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
  const [trendingMarkets, setTrendingMarkets] = useState<MostTradedMarket[]>([]);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const getTrendingMarkets = async (type: TrendingType, limit: number = 10, isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    setError(null);

    try {
      if (type === "MOST_TRADED") {
        const [data, status] = await fetchMostTradedMarkets(limit);
        if (status === 200 && data) {
          setTrendingMarkets(data);
          if (isInitialLoad) setIsInitialLoad(false);
          return;
        } else {
          throw new Error("Failed to fetch trending markets");
        }
      } else {
        setTrendingMarkets([]);
        if (isInitialLoad) setIsInitialLoad(false);
      }
    } catch (err: any) {
      const errorMsg = handleDashboardError(err, "fetchMostTradedMarkets");
      setError(errorMsg);
    } finally {
      if (!isRefresh) setLoading(false);
    }
  };

  const handleTrendingTypeChange = (type: TrendingType) => {
    setTrendingType(type);
    getTrendingMarkets(type, 10, false);
  };

  useEffect(() => {
    getTrendingMarkets(trendingType, 10, false);
    const interval = setInterval(() => {
      getTrendingMarkets(trendingType, 10, true);
    }, 30000);
    return () => clearInterval(interval);
  }, [trendingType]);

  const getTrendingIcon = (type: TrendingType) => {
    switch (type) {
      case "MOST_TRADED":
        return <Flame className="w-4 h-4" />;
      case "RECENT":
        return <Clock className="w-4 h-4" />;
      case "POPULAR":
        return <Star className="w-4 h-4" />;
      default:
        return <Flame className="w-4 h-4" />;
    }
  };

  const getTrendingLabel = (type: TrendingType) => {
    switch (type) {
      case "MOST_TRADED":
        return "Hot";
      case "RECENT":
        return "New";
      case "POPULAR":
        return "Top";
      default:
        return "Hot";
    }
  };

  return (
    <div className="bg-gradient-to-b from-[#111] to-[#0a0a0a] rounded-2xl border border-zinc-800 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden">
      <div className="p-6 pb-4 border-b border-zinc-800">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 shadow-lg">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <Link to="/markets" className="block">
                <h2 className="text-xl font-semibold text-white">Trending Markets</h2>
              </Link>
              <p className="text-sm text-zinc-400">Hottest prediction markets</p>
            </div>
          </div>

          <div className="flex gap-2 p-1 bg-zinc-800 rounded-xl">
            <button
              onClick={() => handleTrendingTypeChange("MOST_TRADED")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${trendingType === "MOST_TRADED"
                ? "bg-orange-500 text-white shadow-md"
                : "text-zinc-400 hover:text-white hover:bg-zinc-700"
                }`}
            >
              {getTrendingIcon("MOST_TRADED")}
              Hot
            </button>
            <button
              onClick={() => handleTrendingTypeChange("RECENT")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${trendingType === "RECENT"
                ? "bg-orange-500 text-white shadow-md"
                : "text-zinc-400 hover:text-white hover:bg-zinc-700"
                }`}
            >
              {getTrendingIcon("RECENT")}
              New
            </button>
            <button
              onClick={() => handleTrendingTypeChange("POPULAR")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${trendingType === "POPULAR"
                ? "bg-orange-500 text-white shadow-md"
                : "text-zinc-400 hover:text-white hover:bg-zinc-700"
                }`}
            >
              {getTrendingIcon("POPULAR")}
              Top
            </button>
          </div>
        </div>
      </div>

      <div className="p-6 pt-4">
        <div className="space-y-2 max-h-80 overflow-y-auto scrollbar-hide">
          {loading && isInitialLoad && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-orange-500 border-t-transparent"></div>
            </div>
          )}

          {error && !loading && (
            <div className="flex items-center justify-center py-12">
              <p className="text-orange-500 text-sm">{error}</p>
            </div>
          )}

          {!loading && !error && trendingMarkets.length === 0 && !isInitialLoad && (
            <div className="flex items-center justify-center py-12">
              <p className="text-zinc-400 text-sm">
                No {getTrendingLabel(trendingType).toLowerCase()} markets found.
              </p>
            </div>
          )}

          {!loading && !error && trendingMarkets.length > 0 && (
            <>
              {trendingMarkets.map((market, index) => (
                <Link to={`/trade/${market.id}`} key={market.id} className="block">
                  <div
                    className="flex items-center gap-4 p-3 rounded-xl transition-all duration-200 hover:bg-zinc-800 group cursor-pointer"
                  >
                    <div className="flex items-center justify-center w-8">
                      <span className="text-sm font-semibold text-zinc-400">#{index + 1}</span>
                    </div>

                    <div className="relative">
                      <div className="w-10 h-10 rounded-xl overflow-hidden ring-2 ring-zinc-700 group-hover:ring-orange-500 transition-all duration-200">
                        <img
                          src={market.image}
                          alt={`${market.id}'s avatar`}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>
                      {index === 0 && (
                        <div className="absolute -top-1 -right-1">
                          <Flame className="w-4 h-4 text-orange-500 drop-shadow-sm" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-white group-hover:text-orange-500 transition-colors truncate text-sm leading-relaxed">
                        {market.question}
                      </p>
                      <p className="text-xs text-zinc-400 truncate mt-1">
                        by {market.creator.username}
                      </p>
                    </div>

                    <div className="text-right">
                      <div className="font-semibold text-white group-hover:text-orange-500 transition-colors">
                        {market.tradeCount.toLocaleString()}
                      </div>
                      <div className="text-xs text-zinc-400">
                        {market.tradeCount === 1 ? "Trade" : "Trades"}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}

              {trendingMarkets.length === 10 && (
                <Link to="/markets" className="block">
                  <div className="text-center p-3 text-orange-500 hover:text-orange-600 transition-colors duration-200 text-sm font-medium border-t border-zinc-800 mt-4">
                    View All Markets →
                  </div>
                </Link>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );

};

export default TrendingMarket;