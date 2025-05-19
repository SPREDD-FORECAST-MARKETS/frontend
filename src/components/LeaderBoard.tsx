import { Users, DollarSign, BarChart2 } from "lucide-react";
import type { LeaderBoardData } from "../lib/interface";

interface LeaderBoardProps {
  data: LeaderBoardData[];
}
const LeaderBoard = ({ data }: LeaderBoardProps) => {
  return (
    <div className="border border-zinc-800 w-1/2 rounded-xl">
      <div className="bg-gradient-to-b from-[#111] to-[#0a0a0a] rounded-xl p-6 shadow-lg flex-1">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-white text-3xl font-serif font-bold">Leaderboards</h2>
          <div className="flex space-x-2">
            <button className="bg-gradient-to-br from-teal-600 to-teal-700 p-2 rounded-full shadow-lg shadow-teal-500/20 transition-all duration-300 hover:shadow-teal-500/40 hover:scale-110 hover:from-teal-500 hover:to-teal-600">
              {" "}
              <Users className="text-teal-500 w-5 h-5" />
            </button>
            <button className="bg-gradient-to-br from-zinc-700 to-zinc-800 p-2 rounded-full hover:shadow-zinc-500/30 hover:scale-110 hover:from-zinc-600 hover:to-zinc-700 group">
              <DollarSign className="text-white w-5 h-5" />
            </button>
            <button className="bg-gradient-to-br from-zinc-700 to-zinc-800 p-2 rounded-full hover:shadow-zinc-500/30 hover:scale-110 hover:from-zinc-600 hover:to-zinc-700 group">
              <BarChart2 className="text-white w-5 h-5" />
            </button>
          </div>
        </div>
        {data.map((item) => (
          <div
            className="flex items-center group hover:bg-teal-500/5  rounded-lg transition-all duration-300 cursor-pointer mb-2"
            key={item.id}
          >
            <div className="text-gray-500 font-serif mr-5 w-4 text-center">
              {item.id}
            </div>
            <div className="h-10 w-10 min-w-10 rounded-full overflow-hidden mr-5 bg-gradient-to-br from-gray-800 to-black p-0.5 group-hover:from-teal-900 group-hover:to-black transition-all duration-300">
              <img
                src={item.avatar}
                alt="User avatar"
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            <div className="flex-1 mr-4">
              <p className="text-white font-serif text-sm md:text-base group-hover:text-teal-100 transition-colors duration-300">
                {item.username}
              </p>
            </div>
            <div className="text-orange-500 font-serif text-sm md:text-base group-hover:text-orange-400 group-hover:scale-105 transition-all duration-300">
              {item.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LeaderBoard;
