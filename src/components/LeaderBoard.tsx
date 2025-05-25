import { Users, DollarSign, BarChart2 } from "lucide-react";
import type { LeaderBoardTableData } from "../lib/interface";
import { Link } from "react-router-dom";

interface LeaderBoardProps {
  data: LeaderBoardTableData[];
}

const LeaderBoard = ({ data }: LeaderBoardProps) => {
  return (
    <div className="border border-zinc-800 w-full rounded-xl">
      <Link to="/leaderboard" className="block">
        <div className="bg-gradient-to-b from-[#111] to-[#0a0a0a] rounded-xl p-4 sm:p-6 shadow-lg">
          <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between mb-4 sm:mb-6 gap-3">
            <h2 className="text-white text-2xl sm:text-2xl md:text-3xl font-serif font-bold">
              Leaderboards
            </h2>
            <div className="flex space-x-2">
              <button className="bg-gradient-to-br from-teal-600 to-teal-700 p-1.5 sm:p-2 rounded-full shadow-lg shadow-teal-500/20 transition-all duration-300 hover:shadow-teal-500/40 hover:scale-110 hover:from-teal-500 hover:to-teal-600">
                <Users className="text-teal-500 w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <button className="bg-gradient-to-br from-zinc-700 to-zinc-800 p-1.5 sm:p-2 rounded-full hover:shadow-zinc-500/30 hover:scale-110 hover:from-zinc-600 hover:to-zinc-700 group">
                <DollarSign className="text-white w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <button className="bg-gradient-to-br from-zinc-700 to-zinc-800 p-1.5 sm:p-2 rounded-full hover:shadow-zinc-500/30 hover:scale-110 hover:from-zinc-600 hover:to-zinc-700 group">
                <BarChart2 className="text-white w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>

          <div className="space-y-2">
            {data.map((item) => (
              <div
                className="flex items-center group hover:bg-teal-500/5 rounded-lg transition-all duration-300 cursor-pointer p-1.5"
                key={item.id}
              >
                <div className="text-gray-500 font-serif mr-2 sm:mr-3 md:mr-5 w-4 text-center text-sm sm:text-base">
                  {item.id}
                </div>
                <div className="h-8 w-8 min-w-8 sm:h-10 sm:w-10 sm:min-w-10 rounded-full overflow-hidden mr-2 sm:mr-3 md:mr-5 bg-gradient-to-br from-gray-800 to-black p-0.5 group-hover:from-teal-900 group-hover:to-black transition-all duration-300">
                  <img
                    src={item.avatar}
                    alt={`${item.name}'s avatar`}
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
                <div className="flex-1 mr-2 sm:mr-4">
                  <p className="text-white font-serif text-md sm:text-sm md:text-base group-hover:text-teal-100 transition-colors duration-300 line-clamp-1 sm:line-clamp-none">
                    {item.name}
                  </p>
                </div>
                <div className="text-orange-500 font-serif text-md sm:text-sm md:text-base whitespace-nowrap group-hover:text-orange-400 group-hover:scale-105 transition-all duration-300">
                  {item.reward}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Link>
    </div>
  );
};

export default LeaderBoard;
