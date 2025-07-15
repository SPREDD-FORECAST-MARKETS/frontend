import { Lightbulb, TrendingUp, Crown, Medal, Award } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  fetchLeaderboard,
  handleDashboardError,
  type LeaderboardEntry,
  type PointType,
} from "../apis/leaderboard";

const LeaderBoard = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [leaderboardPointType, setLeaderboardPointType] = useState<PointType>("CREATOR");
  const [leaderboardUsers, setLeaderboardUsers] = useState<LeaderboardEntry[]>([]);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const getLeaderboard = async (pointType: PointType, limit?: number, isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    setError(null);

    try {
      const [data, status] = await fetchLeaderboard(pointType, limit);
      if (status === 200 && data) {
        setLeaderboardUsers(data);
        if (isInitialLoad) setIsInitialLoad(false);
        return;
      } else {
        throw new Error("Failed to fetch leaderboard");
      }
    } catch (err: any) {
      const errorMsg = handleDashboardError(err, "fetchLeaderboard");
      setError(errorMsg);
      throw err;
    } finally {
      if (!isRefresh) setLoading(false);
    }
  };

  const handlePointTypeChange = (pointType: PointType) => {
    setLeaderboardPointType(pointType);
    getLeaderboard(pointType, 10, false);
  };

  useEffect(() => {
    getLeaderboard(leaderboardPointType, 10, false);
    const interval = setInterval(() => {
      getLeaderboard(leaderboardPointType, 10, true);
    }, 10000);
    return () => clearInterval(interval);
  }, [leaderboardPointType]);

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Crown className="w-5 h-5 text-yellow-500" />;
      case 1:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 2:
        return <Award className="w-5 h-5 text-orange-600" />;
      default:
        return <span className="text-sm font-semibold text-gray-500">#{index + 1}</span>;
    }
  };

  return (
    <div className="bg-gradient-to-b from-[#111] to-[#0a0a0a] rounded-2xl border border-zinc-800 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden">
      <div className="p-6 pb-4 border-b border-zinc-800">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 shadow-lg">
              <Lightbulb className="w-5 h-5 text-white" />
            </div>
            <div>
              <Link to="/leaderboard" className="block">
                <h2 className="text-xl font-semibold text-white">Leaderboards</h2>
              </Link>
              <p className="text-sm text-zinc-400">Top performers this week</p>
            </div>
          </div>

          <div className="flex gap-2 p-1 bg-zinc-800 rounded-xl">
            <button
              onClick={() => handlePointTypeChange("CREATOR")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${leaderboardPointType === "CREATOR"
                ? "bg-orange-500 text-white shadow-md"
                : "text-zinc-400 hover:text-white hover:bg-zinc-700"
                }`}
            >
              <Lightbulb className="w-4 h-4" />
              Creators
            </button>
            <button
              onClick={() => handlePointTypeChange("TRADER")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${leaderboardPointType === "TRADER"
                ? "bg-orange-500 text-white shadow-md"
                : "text-zinc-400 hover:text-white hover:bg-zinc-700"
                }`}
            >
              <TrendingUp className="w-4 h-4" />
              Traders
            </button>
          </div>
        </div>
      </div>

      <div className="p-6 pt-4">
        <div className="space-y-2 max-h-80 overflow-y-auto scrollbar-hide">
          {loading && isInitialLoad && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-orange-500 border-t-transparent"></div>
            </div>
          )}

          {error && (
            <div className="flex items-center justify-center py-12">
              <p className="text-orange-500 text-sm">{error}</p>
            </div>
          )}

          {!loading && !error && leaderboardUsers.length === 0 && !isInitialLoad && (
            <div className="flex items-center justify-center py-12">
              <p className="text-zinc-400 text-sm text-center">
                No {leaderboardPointType.toLowerCase()}s found in leaderboard.
              </p>
            </div>
          )}

          {leaderboardUsers.length > 0 && (
            <>
              {leaderboardUsers.map((item, index) => (
                <div
                  key={item.user.id}
                  className={`flex items-center gap-4 p-3 rounded-xl transition-all duration-200 hover:bg-zinc-800 group cursor-pointer ${index < 3 ? "bg-zinc-800" : ""
                    }`}
                >
                  <div className="flex items-center justify-center w-8">
                    {getRankIcon(index)}
                  </div>

                  <div className="relative">
                    <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-zinc-700 group-hover:ring-orange-500 transition-all duration-200">
                      <img
                        src={
                          item.user.profile_pic ||
                          "https://www.shutterstock.com/image-vector/default-avatar-profile-icon-social-600nw-1906669723.jpg"
                        }
                        alt={`${item.user.username}'s avatar`}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    {index < 3 && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 rounded-full border-2 border-black flex items-center justify-center">
                        <span className="text-[10px] font-bold text-white">{index + 1}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white group-hover:text-orange-500 transition-colors truncate">
                      {item.user.username}
                    </p>
                    <p className="text-xs text-zinc-400 truncate">
                      {item.user.wallet_address.slice(0, 6)}...{item.user.wallet_address.slice(-4)}
                    </p>
                  </div>

                  <div className="text-right">
                    <div className="font-semibold text-white group-hover:text-orange-500 transition-colors">
                      {item.points.toLocaleString()}
                    </div>
                    <div className="text-xs text-zinc-400">
                      {leaderboardPointType === "CREATOR" ? "Creator" : "Trader"} FP
                    </div>
                  </div>
                </div>
              ))}

              {leaderboardUsers.length === 10 && (
                <Link to="/leaderboard" className="block">
                  <div className="text-center p-3 text-orange-500 hover:text-orange-600 transition-colors duration-200 text-sm font-medium border-t border-zinc-800 mt-4">
                    View Full Leaderboard →
                  </div>
                </Link>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );

};

export default LeaderBoard;