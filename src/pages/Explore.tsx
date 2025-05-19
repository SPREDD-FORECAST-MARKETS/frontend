import { Link } from "react-router-dom";
import TrendingMarket from "../components/TrendingMarket";
import LeaderBoard from "../components/LeaderBoard";
import { trendingMarkets, leaderBoard, marketCards } from "../lib/data";
import MarketCards from "../components/MarketCards";
import { Plus } from "lucide-react";

const Explore = () => {
  return (
    <div className="p-2">
      <div className="flex flex-col justify-evenly md:flex-row gap-6 w-full p-9">
        <TrendingMarket data={trendingMarkets} />
        <LeaderBoard data={leaderBoard} />
      </div>
      
      <div className="flex justify-between items-center mx-[2rem] mb-2">
        <h2 className="text-2xl font-bold text-white">Markets</h2>
        <Link
          to="/create-prediction"
          className="bg-orange-500 hover:bg-orange-600 text-black font-semibold px-4 py-2 rounded-full transition-colors duration-200 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50 flex items-center"
        >
          <Plus size={18} className="mr-1" />
          Create Prediction
        </Link>
      </div>
      
      <MarketCards data={marketCards} />
    </div>
  );
};

export default Explore;