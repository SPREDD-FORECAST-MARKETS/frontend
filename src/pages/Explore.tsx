import TrendingMarket from "../components/TrendingMarket";
import LeaderBoard from "../components/LeaderBoard";
import { trendingMarkets, leaderboardData, marketCards, tags } from "../lib/data";
import MarketCards from "../components/MarketCards";
import TrendingBar from "../components/TrendingBar";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";

const Explore = () => {
  return (
    <div className="w-full px-4 sm:px-6 md:px-8 py-4 md:py-6">
      {/* Trending Market and Leaderboard Section */}
      <div className="flex flex-col lg:flex-row gap-4 md:gap-6 w-full mb-8">
        <div className="w-full lg:w-1/2">
          <TrendingMarket data={trendingMarkets} />
        </div>
        <div className="w-full lg:w-1/2 mt-4 lg:mt-0">
          <LeaderBoard data={leaderboardData} />
        </div>
      </div>
      
      {/* Markets Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 sm:mb-6 px-2 sm:px-4">
        <h2 className="text-2xl sm:text-3xl font-bold font-serif text-white underline">Markets</h2>
        <Link
          to="/create-prediction"
          className="bg-orange-500 hover:bg-orange-600 text-black font-semibold px-3 py-2 sm:px-4 sm:py-2 rounded-full transition-colors duration-200 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50 flex items-center text-sm sm:text-base"
        >
          <Plus size={16} className="mr-1" />
          Create Prediction
        </Link>
      </div>

      {/* Trending Tags Bar */}
      <div className="mb-6">
        <TrendingBar data={tags} />
      </div>

      {/* Market Cards Grid */}
      <div className="px-2 sm:px-4">
        <MarketCards data={marketCards} />
      </div>
    </div>
  );
};

export default Explore;