import { ArrowLeft, Filter } from "lucide-react";
import LeaderboardTable from "../components/LeaderBoardTable";
import { Link } from "react-router-dom";

const LeaderBoard = () => {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center py-4 sm:py-8 px-2 sm:px-4">
      <div className="w-full max-w-4xl mb-4 sm:mb-6 px-2 sm:px-0 flex justify-between items-center">
        <button className="text-gray-300 hover:text-orange-500 flex items-center gap-2 transition-colors group">
          <Link to="/" className="flex items-center gap-2">
            <ArrowLeft
              size={18}
              className="group-hover:-translate-x-1 transition-transform duration-200"
            />
            <span>Back</span>
          </Link>
        </button>
        <h1 className="text-xl sm:text-2xl font-bold text-white">
          Leaderboard
        </h1>
        <div className="w-[60px]"></div>
      </div>

      <div className="w-full max-w-4xl rounded-xl overflow-hidden shadow-2xl border border-zinc-800 bg-zinc-900/50 mb-6">
        <LeaderboardTable />
      </div>

      {/* Floating action button - visible on mobile only */}
      <div className="fixed bottom-4 right-4 sm:hidden z-20">
        <button className="w-12 h-12 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 flex items-center justify-center shadow-lg hover:shadow-orange-500/20 transform hover:scale-105 transition-all duration-300">
          <Filter size={20} className="text-white" />
        </button>
      </div>
    </div>
  );
};

export default LeaderBoard;
