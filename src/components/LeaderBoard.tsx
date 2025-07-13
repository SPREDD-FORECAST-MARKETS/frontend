import { Lightbulb, TrendingUp } from "lucide-react";
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
  const [leaderboardPointType, setLeaderboardPointType] =
    useState<PointType>("CREATOR");
  const [leaderboardUsers, setLeaderboardUsers] = useState<LeaderboardEntry[]>(
    []
  );
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const getLeaderboard = async (
    pointType: PointType,
    limit?: number,
    isRefresh = false
  ) => {
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

  return (
    <div className="border border-zinc-800 rounded-2xl w-full shadow-xl bg-gradient-to-b from-[#111] to-[#0a0a0a]">
      <div className="p-4 sm:p-6">
        {/* Header */}
        <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between mb-6 gap-3">
          <Link to="/leaderboard" className="block">
            <h2 className=" text-white text-2xl md:text-3xl font-serif font-bold tracking-tight bg-gradient-to-r from-orange-500 to-orange-700 bg-clip-text text-transparent">
              Leaderboards
            </h2>
          </Link>

          <div className="flex space-x-3">
            <button
              onClick={() => handlePointTypeChange("CREATOR")}
              className={`p-2 rounded-full border border-zinc-700 transition-all duration-300 hover:shadow-md hover:scale-110 ${
                leaderboardPointType === "CREATOR"
                  ? "bg-gradient-to-br from-orange-600 to-orange-700 shadow-orange-500/20 ring-2 ring-orange-500"
                  : "bg-zinc-800"
              }`}
              title="Creators"
            >
              <Lightbulb
                className={`w-5 h-5 ${
                  leaderboardPointType === "CREATOR"
                    ? "text-orange-100"
                    : "text-white"
                }`}
              />
            </button>

            <button
              onClick={() => handlePointTypeChange("TRADER")}
              className={`p-2 rounded-full border border-zinc-700 transition-all duration-300 hover:shadow-md hover:scale-110 ${
                leaderboardPointType === "TRADER"
                  ? "bg-gradient-to-br from-orange-600 to-orange-700 shadow-orange-500/20 ring-2 ring-orange-500"
                  : "bg-zinc-800"
              }`}
              title="Traders"
            >
              <TrendingUp
                className={`w-5 h-5 ${
                  leaderboardPointType === "TRADER"
                    ? "text-orange-100"
                    : "text-white"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Scrollable List */}
        <div
          className="overflow-y-auto overflow-x-hidden scrollbar-hide overscroll-contain pr-1"
          style={{
            minHeight: "280px",
            maxHeight: "280px",
          }}
        >
          {loading && isInitialLoad && (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
            </div>
          )}

          {error && (
            <div className="flex items-center justify-center h-full">
              <p className="text-center text-red-400 font-serif">{error}</p>
            </div>
          )}

          {!loading &&
            !error &&
            leaderboardUsers.length === 0 &&
            !isInitialLoad && (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500 font-serif text-center">
                  No {leaderboardPointType.toLowerCase()}s found in leaderboard.
                </p>
              </div>
            )}

          {leaderboardUsers.length > 0 && (
            <div className="space-y-2">
              {leaderboardUsers.map((item, index) => (
                <div
                  key={item.user.id}
                  className="flex items-center group hover:bg-orange-500/5 hover:shadow-inner rounded-lg transition-all duration-300 cursor-pointer p-2 min-h-[52px]"
                >
                  <div className="text-gray-500 font-serif mr-3 w-6 text-center text-sm sm:text-base font-bold">
                    #{index + 1}
                  </div>

                  <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-full overflow-hidden mr-3 bg-gradient-to-br from-gray-800 to-black p-0.5 flex items-center justify-center group-hover:ring-2 group-hover:ring-orange-500 transition-all duration-300">
                    <img
                      src={
                        item.user.profile_pic ||
                        "https://www.shutterstock.com/image-vector/default-avatar-profile-icon-social-600nw-1906669723.jpg"
                      }
                      alt={`${item.user.username}'s avatar`}
                      className="w-full h-full object-cover rounded-full"
                      loading="lazy"
                    />
                  </div>

                  <div className="flex-1 mr-3 min-w-0">
                    <p className="text-white font-serif text-sm sm:text-base group-hover:text-orange-100 transition-colors duration-300 truncate">
                      {item.user.username}
                    </p>
                    <p className="text-gray-500 text-xs group-hover:text-gray-400 transition-colors duration-300 truncate">
                      {item.user.wallet_address.slice(0, 6)}...
                      {item.user.wallet_address.slice(-4)}
                    </p>
                  </div>

                  <div className="text-right">
                    <div className="text-orange-500 font-serif text-sm sm:text-base font-bold whitespace-nowrap group-hover:text-orange-400 transition-all duration-300">
                      {item.points.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500 group-hover:text-gray-400 transition-colors duration-300">
                      {leaderboardPointType === "CREATOR"
                        ? "Creator"
                        : "Trader"}{" "}
                      FP
                    </div>
                  </div>
                </div>
              ))}

              {leaderboardUsers.length === 10 && (
                <Link to="/leaderboard" className="block mt-4">
                  <div className="text-center p-3 text-orange-500 hover:text-orange-400 transition-colors duration-300 font-serif text-sm border-t border-zinc-800">
                    View Full Leaderboard →
                  </div>
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeaderBoard;
