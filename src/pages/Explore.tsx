import TrendingMarket from "../components/TrendingMarket";
import LeaderBoard from "../components/LeaderBoard";
import { tags } from "../lib/data";
import MarketCards from "../components/MarketCards";
import TrendingBar from "../components/TrendingBar";
import { Link } from "react-router-dom";
import { Plus, TrendingUp, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import type { Market } from "../lib/interface";
import { fetchMarkets } from "../apis/market";

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

  const isMarketClosed = (market: Market) => {
    const expiryDate = market.expiry_date;
    const currentDate = new Date();
    return new Date(expiryDate).getTime() <= currentDate.getTime();
  };

  // Separate live and closed markets
  const liveMarkets = markets.filter((market) => !isMarketClosed(market));
  const closedMarkets = markets.filter((market) => isMarketClosed(market));

  return (
    <div className="w-full px-4 sm:px-6 md:px-8 py-4 md:py-6 ">
      {/* Trending Market and Leaderboard Section */}
      <div className="flex flex-col lg:flex-row gap-4 md:gap-6 w-full mb-12">
        <div className="w-full lg:w-1/2">
          <TrendingMarket />
        </div>
        <div className="w-full lg:w-1/2 mt-4 lg:mt-0">
          <LeaderBoard />
        </div>
      </div>

      {/* Modern Markets Header Section */}
      <div className="relative mb-12">
        {/* Background glow effects */}
        <div className="absolute inset-0 flex items-center justify-center opacity-20">
          <div className="w-80 h-80 bg-gradient-to-r from-orange-500/20 to-orange-600/20 rounded-full blur-3xl animate-pulse"></div>
        </div>
        <div className="absolute inset-0 flex items-center justify-center opacity-10">
          <div className="w-64 h-64 bg-gradient-to-r from-orange-400/30 to-orange-500/30 rounded-full blur-2xl animate-pulse delay-75"></div>
        </div>

        {/* Header bar: Markets + Arrows + Button */}
        <div className="relative z-10 flex flex-col items-center text-center space-y-4 py-10">
          <div className="flex flex-col sm:flex-row w-full items-center justify-between px-4 sm:px-8">
            {/* Left: Markets heading */}
            <div className="flex items-center mb-4 sm:mb-0">
              <h1 className="text-4xl sm:text-5xl lg:text-5xl font-black bg-gradient-to-r from-white via-orange-200 to-orange-500 bg-clip-text text-transparent tracking-tight">
                Markets
              </h1>
              {/* Arrows right of Markets */}
              <div className="flex flex-col ml-3">
                <svg className="w-4 h-4 text-orange-500 animate-bounce delay-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M19 9l-7 7-7-7" />
                </svg>
                <svg className="w-4 h-4 text-orange-500 animate-bounce delay-200" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M19 9l-7 7-7-7" />
                </svg>
                <svg className="w-4 h-4 text-orange-500 animate-bounce delay-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Right: Create Prediction button */}
            <Link
              to="/create-prediction"
              className="group relative inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-black font-bold text-base rounded-full shadow-xl hover:shadow-orange-500/25 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 active:scale-95"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-orange-500 rounded-full blur-md opacity-0 group-hover:opacity-60 transition-opacity duration-300"></div>
              <div className="relative flex items-center space-x-2">
                <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
                <span>Create Prediction</span>
                <Zap className="w-4 h-4 group-hover:animate-pulse" />
              </div>
            </Link>
          </div>

          {/* Subheading centered */}
          <p className="text-zinc-400 text-base sm:text-lg font-medium mt-2">
            Discover the future of prediction markets
          </p>

          {/* Underline centered */}
          <div className="relative w-24 h-1 bg-gradient-to-r from-transparent via-orange-500 to-transparent rounded-full mt-2">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Trending Tags Bar */}
      <div className="mb-8">
        <TrendingBar data={tags} onChangeTag={setMarketFilterTag} />
      </div>

      {/* Loading State */}
      {isLoading && <Loader />}

      {/* No Markets Found */}
      {!isLoading && markets.length === 0 && (
        <div className="text-center py-16">
          <div className="relative">
            <div className="absolute inset-0 flex items-center justify-center opacity-10">
              <div className="w-64 h-64 bg-gradient-to-r from-orange-500/20 to-orange-600/20 rounded-full blur-3xl"></div>
            </div>
            <div className="relative z-10 space-y-4">
              <div className="w-16 h-16 mx-auto bg-gradient-to-r from-zinc-700 to-zinc-800 rounded-full flex items-center justify-center">
                <TrendingUp className="w-8 h-8 text-zinc-400" />
              </div>
              <p className="text-zinc-400 text-xl sm:text-2xl font-medium">
                No markets found for this category
              </p>
              <p className="text-orange-500 text-lg sm:text-xl">
                Try a different filter or create your own prediction!
              </p>
            </div>
          </div>
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