import { useState, type SVGProps } from "react";
import { Trophy, ChevronDown, Flame, Award } from "lucide-react";
import type { LeaderBoardTableData } from "../lib/interface";
import type { JSX } from "react/jsx-runtime";

const getBadgeIcon = (position: number) => {
  if (position === 0) return <Trophy size={14} className="text-black" />;
  if (position === 1) return <Trophy size={14} className="text-black" />;
  if (position === 2) return <Trophy size={14} className="text-black" />;
  return null;
};

interface LeaderBoardTableDataProps {
  leaderboardData: LeaderBoardTableData[];
}

const LeaderBoardTable = ({ leaderboardData }: LeaderBoardTableDataProps) => {
  const [showRewards, setShowRewards] = useState(true);
  const [showAll, setShowAll] = useState(false);

  // Calculate max points for progress bar scaling
  const maxPoints = Math.max(...leaderboardData.map((user) => user.points));

  // Decide how many entries to show
  const displayData = showAll ? leaderboardData : leaderboardData.slice(0, 7);

  return (
    <div className="w-full max-w-4xl mx-auto bg-zinc-900 rounded-xl overflow-hidden shadow-xl border border-zinc-800">
      {/* Header */}
      <div className="bg-black p-3 sm:p-4 border-b border-zinc-800 flex flex-col sm:flex-row gap-3 sm:gap-0 justify-between items-start sm:items-center">
        <div className="flex items-center gap-2">
          <Award className="text-orange-500" size={18} sm-size={20} />
          <h2 className="text-white text-base sm:text-lg font-bold">
            Predictor Leaderboard
          </h2>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setShowRewards(true)}
            className={`flex-1 sm:flex-none px-3 py-2 text-sm rounded-md transition-all duration-200 ${
              showRewards
                ? "bg-orange-500 text-black font-medium shadow-lg transform scale-105"
                : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
            }`}
          >
            Rewards
          </button>
          <button
            onClick={() => setShowRewards(false)}
            className={`flex-1 sm:flex-none px-3 py-2 text-sm rounded-md transition-all duration-200 ${
              !showRewards
                ? "bg-orange-500 text-black font-medium shadow-lg transform scale-105"
                : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
            }`}
          >
            Accuracy
          </button>
        </div>
      </div>

      {/* Table header - Hidden on mobile for cleaner look */}
      <div className="hidden sm:grid grid-cols-12 gap-2 py-3 px-4 text-xs text-zinc-500 font-medium border-b border-zinc-800/50">
        <div className="col-span-1 text-center">RANK</div>
        <div className="col-span-6">USER</div>
        <div className="col-span-2 text-right">POINTS</div>
        <div className="col-span-3 text-right pr-2">
          {showRewards ? "REWARD" : "ACCURACY"}
        </div>
      </div>

      {/* Leaderboard items */}
      <div className="divide-y divide-zinc-800/30">
        {displayData.map((user, index) => {
          // Calculate progress percentage
          const progressPercent = (user.points / maxPoints) * 100;

          // Determine rank highlight colors
          let rankBgColor = "";
          let rankTextColor = "text-zinc-400";

          if (index === 0) {
            rankBgColor = "bg-gradient-to-r from-yellow-500 to-orange-500";
            rankTextColor = "text-black font-bold";
          } else if (index === 1) {
            rankBgColor = "bg-gradient-to-r from-zinc-300 to-zinc-400";
            rankTextColor = "text-black font-bold";
          } else if (index === 2) {
            rankBgColor = "bg-gradient-to-r from-amber-700 to-amber-600";
            rankTextColor = "text-black font-bold";
          }

          return (
            <div key={user.id} className="relative group">
              {/* Mobile Layout */}
              <div className="block sm:hidden">
                <div className="relative p-4 group-hover:bg-zinc-900/70 transition-colors">
                  <div className="flex items-start gap-3">
                    {/* Rank */}
                    <div className="flex-shrink-0">
                      {index < 3 ? (
                        <div
                          className={`rounded-full w-8 h-8 flex items-center justify-center ${rankBgColor} ${rankTextColor} shadow-lg`}
                        >
                          {getBadgeIcon(index) || index + 1}
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center">
                          <span className="text-zinc-400 font-medium text-sm">
                            {index + 1}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* User Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-zinc-800 group-hover:border-orange-500/50 transition-colors flex-shrink-0">
                          <img
                            src={user.avatar}
                            alt={user.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-white truncate text-sm">
                            {user.name}
                          </div>
                          {user.winStreak > 0 && (
                            <div className="flex text-xs items-center gap-1 text-orange-400 mt-1">
                              <Flame size={10} className="text-orange-500" />
                              <span>{user.winStreak} streak</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Points and Progress */}
                      <div className="mb-2">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs text-zinc-500">Points</span>
                          <span className="font-bold text-white text-sm">
                            {user.points}
                          </span>
                        </div>
                        <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-orange-500 to-orange-400 transition-all duration-500"
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>
                      </div>

                      {/* Reward/Accuracy */}
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-zinc-500">
                          {showRewards ? "Reward" : "Accuracy"}
                        </span>
                        {showRewards ? (
                          <span className="font-bold text-orange-500 text-sm">
                            {user.reward}
                          </span>
                        ) : (
                          <span className="font-medium text-white text-sm">
                            {user.accuracy}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Desktop Layout */}
              <div className="hidden sm:block">
                <div className="relative grid grid-cols-12 gap-2 py-4 px-4 items-center group-hover:bg-zinc-900/70 transition-colors">
                  <div className="col-span-1 text-center">
                    {index < 3 ? (
                      <div
                        className={`rounded-full w-8 h-8 flex items-center justify-center ${rankBgColor} ${rankTextColor} mx-auto shadow-lg`}
                      >
                        {getBadgeIcon(index) || index + 1}
                      </div>
                    ) : (
                      <span className="text-zinc-500 font-medium">
                        {index + 1}
                      </span>
                    )}
                  </div>

                  <div className="col-span-6 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-zinc-800 group-hover:border-orange-500/50 transition-colors">
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-medium text-white truncate">
                        {user.name}
                      </span>
                      {user.winStreak > 0 && (
                        <span className="flex text-xs items-center gap-1 text-orange-400">
                          <Flame size={12} className="text-orange-500" />
                          <span>{user.winStreak} streak</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="col-span-2 text-right">
                    <div className="font-bold text-white">{user.points}</div>
                    <div className="text-zinc-500 text-xs">points</div>

                    {/* Progress bar */}
                    <div className="mt-1 h-1 bg-zinc-800 rounded-full overflow-hidden w-full">
                      <div
                        className="h-full bg-gradient-to-r from-orange-500 to-orange-400 transition-all duration-500"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>

                  <div className="col-span-3 text-right pr-2">
                    {showRewards ? (
                      <span className="font-bold text-orange-500 text-lg">
                        {user.reward}
                      </span>
                    ) : (
                      <span className="font-medium text-white">
                        {user.accuracy}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* View more / less */}
      <div className="text-center py-4 border-t border-zinc-800 flex justify-center bg-black/40">
        <button
          onClick={() => setShowAll(!showAll)}
          className="text-sm text-zinc-400 hover:text-orange-500 transition-colors flex items-center gap-2 px-4 py-2 rounded-md hover:bg-zinc-800/50 active:scale-95 transform transition-transform"
        >
          <span>{showAll ? "Show Less" : "View All Rankings"}</span>
          {showAll ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  );
};

const ChevronUp = (
  props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>
) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <polyline points="18 15 12 9 6 15"></polyline>
  </svg>
);

export default LeaderBoardTable;
