import TrendingMarket from "../components/TrendingMarket";
import LeaderBoard from "../components/LeaderBoard";
import { tags } from "../lib/data";
import MarketCards from "../components/MarketCards";
import TrendingBar from "../components/TrendingBar";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import type { Market } from "../types/apis";
import { fetchMarkets } from "../apis/market";

// Loader Component
const Loader = () => {
  return (
    <div className="flex justify-center items-center py-20">
      <div className="relative">
        {/* Outer ring */}
        <div className="w-12 h-12 rounded-full border-4 border-gray-700 border-t-orange-500 animate-spin"></div>
        {/* Inner ring */}
        <div className="absolute top-1 left-1 w-10 h-10 rounded-full border-4 border-gray-800 border-b-orange-500 animate-spin-slow"></div>
        {/* Center dot */}
        <div className="absolute top-4 left-4 w-4 h-4 rounded-full bg-orange-500 animate-pulse"></div>
      </div>
    </div>
  );
};

const Explore = () => {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [marketFilterTag, setMarketFilterTag] = useState<string | undefined>(
    undefined
  );
  const [isLoading, setIsLoading] = useState(false);

  // Helper function to check if market is closed
  const isMarketClosed = (market: Market) => {
    return new Date(market.expiry_date).getTime() <= new Date().getTime();
  };

  // Separate live and closed markets
  const liveMarkets = markets.filter((market) => !isMarketClosed(market));
  const closedMarkets = markets.filter((market) => isMarketClosed(market));

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        let filterdTags = undefined;
        if (marketFilterTag !== undefined) {
          filterdTags = [marketFilterTag];
        }
        if (marketFilterTag === "Top") {
          filterdTags = undefined;
        }
        const response = await fetchMarkets({ tags: filterdTags });
        setMarkets(response.data);
      } catch (error) {
        console.error("Error fetching markets:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [marketFilterTag]);

  return (
    <div className="w-full px-4 sm:px-6 md:px-8 py-4 md:py-6">
      {/* Trending Market and Leaderboard Section */}
      <div className="flex flex-col lg:flex-row gap-4 md:gap-6 w-full mb-8">
        <div className="w-full lg:w-1/2">
          <TrendingMarket />
        </div>
        <div className="w-full lg:w-1/2 mt-4 lg:mt-0">
          <LeaderBoard />
        </div>
      </div>

      {/* Markets Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 px-2 sm:px-4">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-serif text-white underline">
          Markets
        </h2>
        <Link
          to="/create-prediction"
          className="bg-orange-500 hover:bg-orange-600 text-black font-semibold px-4 py-2.5 sm:px-5 sm:py-3 lg:px-6 lg:py-3 rounded-full transition-colors duration-200 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50 flex items-center text-sm sm:text-base lg:text-lg whitespace-nowrap"
        >
          <Plus size={16} className="mr-2 sm:w-5 sm:h-5" />
          Create Prediction
        </Link>
      </div>

      {/* Trending Tags Bar */}
      <div className="mb-6">
        <TrendingBar data={tags} onChangeTag={setMarketFilterTag} />
      </div>

      {/* Loading State */}
      {isLoading && <Loader />}

      {/* No Markets Found */}
      {!isLoading && markets.length === 0 && (
        <div className="text-center py-16">
          <p className="text-gray-400 text-lg sm:text-xl lg:text-2xl">
            No markets found for this category.
          </p>
          <p className="text-orange-500 mt-2 text-base sm:text-lg lg:text-xl">
            Try a different filter or create your own prediction!
          </p>
        </div>
      )}

      {/* Markets Content - Show Live Markets First, Then Closed */}
      {!isLoading && markets.length > 0 && (
        <div className="px-2 sm:px-4">
          <MarketCards data={[...liveMarkets, ...closedMarkets]} />
        </div>
      )}
    </div>
  );
};

export default Explore;
