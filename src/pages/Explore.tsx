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

      {/* Enhanced Markets Header Section with Side Energy Waves */}
      {/* up and down margin below line */}
      <div className="relative mb-16 py-10">
        {/* Left Side Energy Waves */}
        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-48 h-48 pointer-events-none">
          <div className="relative w-full h-full">
            {/* Geometric pattern */}
            <div className="absolute inset-0">
              <div className="w-29 h-1 bg-gradient-to-r from-transparent to-orange-500/50 animate-pulse-wave origin-left"></div>
              <div className="w-32 h-1 bg-gradient-to-r from-transparent to-orange-500/40 animate-pulse-wave origin-left mt-8" style={{ animationDelay: '0.5s' }}></div>
              <div className="w-20 h-1 bg-gradient-to-r from-transparent to-orange-500/60 animate-pulse-wave origin-left mt-16" style={{ animationDelay: '1s' }}></div>
              <div className="w-28 h-0.5 bg-gradient-to-r from-transparent to-orange-500/30 animate-pulse-wave origin-left mt-20" style={{ animationDelay: '1.5s' }}></div>
            </div>

            {/* Floating geometric shapes */}
            <div className="absolute top-4 left-16 w-4 h-4 border-2 border-orange-500/50 rotate-45 animate-float"></div>
            <div className="absolute bottom-8 left-20 w-3 h-3 bg-orange-500/60 rounded-full animate-pulse"></div>
            <div className="absolute top-16 left-8 w-6 h-1 bg-orange-500/40 animate-fade-in-out"></div>
            <div className="absolute top-24 left-12 w-2 h-2 border border-orange-500/40 animate-float-delayed"></div>
            <div className="absolute bottom-16 left-6 w-8 h-0.5 bg-gradient-to-r from-orange-500/20 to-transparent animate-pulse-wave" style={{ animationDelay: '2s' }}></div>
          </div>
        </div>

        {/* Right Side Energy Waves */}
        <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-48 h-48 pointer-events-none">
          <div className="relative w-full h-full">
            {/* Geometric pattern - mirrored */}
            <div className="absolute inset-0 scale-x-[-1]">
              <div className="w-29 h-1 bg-gradient-to-r from-transparent to-orange-500/50 animate-pulse-wave origin-left"></div>
              <div className="w-32 h-1 bg-gradient-to-r from-transparent to-orange-500/40 animate-pulse-wave origin-left mt-8" style={{ animationDelay: '0.5s' }}></div>
              <div className="w-20 h-1 bg-gradient-to-r from-transparent to-orange-500/60 animate-pulse-wave origin-left mt-16" style={{ animationDelay: '1s' }}></div>
              <div className="w-28 h-0.5 bg-gradient-to-r from-transparent to-orange-500/30 animate-pulse-wave origin-left mt-20" style={{ animationDelay: '1.5s' }}></div>
            </div>

            {/* Floating geometric shapes - mirrored */}
            <div className="absolute top-4 right-16 w-4 h-4 border-2 border-orange-500/50 rotate-45 animate-float-delayed"></div>
            <div className="absolute bottom-8 right-20 w-3 h-3 bg-orange-500/60 rounded-full animate-pulse"></div>
            <div className="absolute top-16 right-8 w-6 h-1 bg-orange-500/40 animate-fade-in-out"></div>
            <div className="absolute top-24 right-12 w-2 h-2 border border-orange-500/40 animate-float"></div>
            <div className="absolute bottom-16 right-6 w-8 h-0.5 bg-gradient-to-l from-orange-500/20 to-transparent animate-pulse-wave" style={{ animationDelay: '2s' }}></div>
          </div>
        </div>

        {/* Floating particles background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/4 w-2 h-2 bg-orange-500/30 rounded-full animate-ping delay-0"></div>
          <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-orange-500/40 rounded-full animate-ping delay-300"></div>
          <div className="absolute bottom-1/3 left-1/2 w-1.5 h-1.5 bg-orange-500/20 rounded-full animate-ping delay-700"></div>
          <div className="absolute top-2/3 right-1/4 w-1 h-1 bg-orange-500/50 rounded-full animate-ping delay-1000"></div>
          <div className="absolute top-1/4 left-3/4 w-1.5 h-1.5 bg-orange-500/25 rounded-full animate-ping delay-1500"></div>
        </div>

        {/* Main energy bar */}
        <div className="relative flex items-center justify-center mb-8">
          {/* Left flowing line */}
          <div className="flex-1 h-0.5 bg-gradient-to-r from-transparent via-zinc-700 to-orange-500/50 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-orange-500 opacity-60 animate-pulse"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-transparent w-20 h-full animate-slide-right"></div>
          </div>

          {/* Center energy orb */}
          <div className="relative mx-8">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 flex items-center justify-center relative">
              {/* Pulsing rings */}
              <div className="absolute inset-0 rounded-full border-2 border-orange-500/30 animate-ping"></div>
              <div className="absolute inset-0 rounded-full border border-orange-500/20 animate-pulse delay-300"></div>

              {/* Center icon */}
              <Zap className="w-8 h-8 text-black animate-pulse" />

              {/* Glow effect */}
              <div className="absolute inset-0 rounded-full bg-orange-500/20 blur-xl animate-pulse"></div>
            </div>
          </div>

          {/* Right flowing line */}
          <div className="flex-1 h-0.5 bg-gradient-to-l from-transparent via-zinc-700 to-orange-500/50 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-l from-transparent to-orange-500 opacity-60 animate-pulse"></div>
            <div className="absolute inset-0 bg-gradient-to-l from-orange-500 to-transparent w-20 h-full animate-slide-left"></div>
          </div>
        </div>

        {/* Markets heading with enhanced styling */}
        <div className="text-center space-y-6">
          <div className="relative inline-block">
            {/* Background glow for heading */}
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-orange-600/10 blur-3xl rounded-full"></div>

            <h1 className="relative text-4xl sm:text-5xl lg:text-6xl font-black bg-gradient-to-r from-white via-orange-200 to-orange-500 bg-clip-text text-transparent tracking-tight">
              Markets
            </h1>

            {/* Animated underline */}
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-transparent via-orange-500 to-transparent rounded-full">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full animate-pulse"></div>
              <div className="absolute inset-0 bg-white/20 rounded-full w-8 animate-slide-right"></div>
            </div>
          </div>

          <p className="text-zinc-400 text-base sm:text-lg font-medium max-w-2xl mx-auto">
            Discover the future of prediction markets
          </p>

          {/* Create Prediction button with enhanced positioning */}
          <div className="pt-4">
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
        </div>

        {/* Bottom energy wave */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange-500/30 to-transparent">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-transparent w-32 h-full animate-slide-right opacity-60"></div>
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