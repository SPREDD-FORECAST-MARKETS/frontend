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

  console.log("==================",leaderboardUsers)
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
        return (
          <div className="relative">
            <Crown className="w-5 h-5 text-amber-400 drop-shadow-lg" />
            <div className="absolute inset-0 bg-amber-400/20 rounded-full blur-sm"></div>
          </div>
        );
      case 1:
        return (
          <div className="relative">
            <Medal className="w-5 h-5 text-slate-300 drop-shadow-lg" />
            <div className="absolute inset-0 bg-slate-300/20 rounded-full blur-sm"></div>
          </div>
        );
      case 2:
        return (
          <div className="relative">
            <Award className="w-5 h-5 text-orange-400 drop-shadow-lg" />
            <div className="absolute inset-0 bg-orange-400/20 rounded-full blur-sm"></div>
          </div>
        );
      default:
        return <span className="text-sm font-bold text-slate-300">#{index + 1}</span>;
    }
  };

  const getRankStyle = (index: number) => {
    switch (index) {
      case 0:
        return "bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border-amber-500/30";
      case 1:
        return "bg-gradient-to-r from-slate-400/20 to-slate-300/20 border-slate-400/30";
      case 2:
        return "bg-gradient-to-r from-orange-500/20 to-amber-500/20 border-orange-500/30";
      default:
        return "bg-white/5 border-white/10";
    }
  };

  return (
    <div 
      className="bg-[#131314f2] backdrop-blur-xl border border-white/10 h-[450px] rounded-2xl shadow-2xl shadow-black/40 overflow-hidden relative"
      style={{ 
        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}
    >
      {/* Glass overlay effect */}
      <div className="absolute inset-0 backdrop-blur-sm" />
      
      {/* Subtle gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-black/20" />

      {/* Content with higher z-index */}
      <div className="relative z-10">
        {/* Header */}
        <div className="p-6 pb-4 border-b border-white/10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-[#ed5d0e]/90 backdrop-blur-sm shadow-lg">
                <Lightbulb className="w-5 h-5 text-white" />
              </div>
              <div>
                <Link to="/leaderboard" className="block">
                  <h2 className="text-xl font-bold text-white drop-shadow-sm">Leaderboards</h2>
                </Link>
                <p className="text-sm text-slate-300">Top performers this week</p>
              </div>
            </div>

            {/* Tab Buttons */}
            <div className="flex gap-2 p-1 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl shadow-lg">
              <button
                onClick={() => handlePointTypeChange("CREATOR")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  leaderboardPointType === "CREATOR"
                    ? "bg-[#ed5d0e]/90 backdrop-blur-sm text-white shadow-md"
                    : "text-slate-300 hover:text-white hover:bg-white/10"
                }`}
              >
                <Lightbulb className="w-4 h-4" />
                Creators
              </button>
              <button
                onClick={() => handlePointTypeChange("TRADER")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  leaderboardPointType === "TRADER"
                    ? "bg-[#ed5d0e]/90 backdrop-blur-sm text-white shadow-md"
                    : "text-slate-300 hover:text-white hover:bg-white/10"
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                Traders
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 pt-4">
          <div className="space-y-3 max-h-80 overflow-y-auto scrollbar-hide">
            {loading && isInitialLoad && (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-amber-500 border-t-transparent"></div>
              </div>
            )}

            {error && (
              <div className="flex items-center justify-center py-12">
                <p className="text-amber-400 text-sm font-medium">{error}</p>
              </div>
            )}

            {!loading && !error && leaderboardUsers.length === 0 && !isInitialLoad && (
              <div className="flex items-center justify-center py-12">
                <p className="text-slate-300 text-sm text-center">
                  No {leaderboardPointType.toLowerCase()}s found in leaderboard.
                </p>
              </div>
            )}

            {leaderboardUsers.length > 0 && (
              <>
                {leaderboardUsers.map((item, index) => (
                  <div
                    key={item.user.id}
                    className={`group relative overflow-hidden rounded-xl transition-all duration-300 hover:bg-white/10 backdrop-blur-sm border hover:border-white/20 hover:shadow-lg cursor-pointer ${getRankStyle(index)}`}
                  >
                    {/* Hover shimmer effect */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none overflow-hidden rounded-xl">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-out" />
                    </div>

                    <div className="flex items-center gap-4 p-4 relative z-10">
                      {/* Rank */}
                      <div className="flex items-center justify-center w-8">
                        {getRankIcon(index)}
                      </div>

                      {/* User Avatar */}
                      <div className="relative">
                        <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-white/20 group-hover:ring-amber-500/50 transition-all duration-300 shadow-md">
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
                          <div className="absolute -top-1 -right-1">
                            <div className="bg-[#ed5d0e]/90 backdrop-blur-sm rounded-full p-1 shadow-lg border border-white/20">
                              <span className="text-[10px] font-bold text-white">{index + 1}</span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* User Info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-white group-hover:text-amber-300 transition-colors duration-300 truncate drop-shadow-sm">
                          {item.user.username}
                        </p>
                        <p className="text-xs text-slate-300 truncate">
                          {item.user.wallet_address.slice(0, 6)}...{item.user.wallet_address.slice(-4)}
                        </p>
                      </div>

                      {/* Points */}
                      <div className="text-right">
                        <div className="font-bold text-white group-hover:text-amber-300 transition-colors duration-300 drop-shadow-sm">
                          {item.points.toLocaleString()}
                        </div>
                        <div className="text-xs text-slate-300">
                          {leaderboardPointType === "CREATOR" ? "Creator" : "Trader"} FP
                        </div>
                      </div>
                    </div>

                    {/* Special glow for top 3 */}
                    {index < 3 && (
                      <div className="absolute inset-0 opacity-30 pointer-events-none rounded-xl">
                        <div className={`absolute inset-0 ${
                          index === 0 ? 'bg-gradient-to-r from-amber-500/10 to-yellow-500/10' :
                          index === 1 ? 'bg-gradient-to-r from-slate-400/10 to-slate-300/10' :
                          'bg-gradient-to-r from-orange-500/10 to-amber-500/10'
                        } rounded-xl`} />
                      </div>
                    )}
                  </div>
                ))}

                {leaderboardUsers.length === 10 && (
                  <Link to="/leaderboard" className="block">
                    <div className="text-center p-4 text-amber-400 hover:text-amber-300 transition-colors duration-300 text-sm font-semibold border-t border-white/10 mt-4 backdrop-blur-sm">
                      View Full Leaderboard →
                    </div>
                  </Link>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Enhanced glass effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl" />
    </div>
  );
};

export default LeaderBoard;