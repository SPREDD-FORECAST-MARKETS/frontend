import TrendingMarket from "../components/TrendingMarket";
import LeaderBoard from "../components/LeaderBoard";
import { trendingMarkets, leaderBoard,marketCards } from "../lib/data";
import MarketCards from "../components/MarketCards";

const Explore = () => {
  return (
    <div className="p-2">
        <div className="flex flex-col justify-evenly  md:flex-row gap-6 w-full p-9">
          <TrendingMarket data={trendingMarkets} />
          <LeaderBoard data={leaderBoard} />
      </div>
      <MarketCards data={marketCards} />
    </div>
  );
};

export default Explore;
