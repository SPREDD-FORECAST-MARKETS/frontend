import { useState, useEffect, type SVGProps } from "react";
import {
  Trophy,
  ChevronDown,
  Award,
  Lightbulb,
  TrendingUp,
} from "lucide-react";
import {
  fetchLeaderboard,
  handleDashboardError,
  type LeaderboardEntry,
  type PointType,
} from "../apis/leaderboard";
import type { JSX } from "react/jsx-runtime";

const getBadgeIcon = (position: number) => {
  if (position === 0) return <Trophy size={14} className="text-black" />;
  if (position === 1) return <Trophy size={14} className="text-black" />;
  if (position === 2) return <Trophy size={14} className="text-black" />;
  return null;
};

const LeaderBoardTable = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [leaderboardPointType, setLeaderboardPointType] =
    useState<PointType>("CREATOR");
  const [leaderboardUsers, setLeaderboardUsers] = useState<LeaderboardEntry[]>(
    []
  );
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [showRewards, setShowRewards] = useState(true);
  const [showAll, setShowAll] = useState(false);

  const getLeaderboard = async (
    pointType: PointType,
    limit?: number,
    isRefresh = false
  ) => {
    // Only show loading state on initial load or point type change, not on refresh
    if (!isRefresh) {
      setLoading(true);
    }
    setError(null);

    try {
      const [data, status] = await fetchLeaderboard(pointType, limit);
      if (status === 200 && data) {
        setLeaderboardUsers(data);
        if (isInitialLoad) {
          setIsInitialLoad(false);
        }
        return;
      } else {
        throw new Error("Failed to fetch leaderboard");
      }
    } catch (err: unknown) {
      const errorMsg = handleDashboardError(err, "fetchLeaderboard");
      setError(errorMsg);
      throw err;
    } finally {
      if (!isRefresh) {
        setLoading(false);
      }
    }
  };

  const handlePointTypeChange = (pointType: PointType) => {
    setLeaderboardPointType(pointType);
    setShowAll(false); // Reset to show limited results when switching
    getLeaderboard(pointType, showAll ? undefined : 20, false); // Not a refresh, show loading
  };

  useEffect(() => {
    const limit = showAll ? undefined : 20;
    getLeaderboard(leaderboardPointType, limit, false); // Initial load
    const interval = setInterval(() => {
      getLeaderboard(leaderboardPointType, limit, true); // This is a refresh
    }, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [leaderboardPointType, showAll]);

  // Calculate max points for progress bar scaling
  const maxPoints = Math.max(...leaderboardUsers.map((user) => user.points));

  // Decide how many entries to show
  const displayData = showAll ? leaderboardUsers : leaderboardUsers.slice(0, 7);

  return (
    <div className="w-full max-w-4xl mx-auto bg-zinc-900 rounded-xl overflow-hidden shadow-xl border border-zinc-800">
      {/* Header */}
      <div className="bg-black p-3 sm:p-4 border-b border-zinc-800">
        <div className="flex flex-col gap-4">
          {/* Title and Point Type Toggle */}
          <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
            <div className="flex items-center gap-2">
              <Award className="text-orange-500" size={18} />
              <h2 className="text-white text-base sm:text-lg font-bold">
                {leaderboardPointType === "CREATOR" ? "Creator" : "Trader"}{" "}
                Leaderboard
              </h2>
            </div>

            {/* Creator/Trader Toggle */}
            <div className="flex space-x-2">
              <button
                onClick={() => handlePointTypeChange("CREATOR")}
                className={`${
                  leaderboardPointType === "CREATOR"
                    ? "bg-gradient-to-br from-orange-600 to-orange-700 shadow-orange-500/20"
                    : "bg-gradient-to-br from-zinc-700 to-zinc-800"
                } p-2 rounded-full transition-all duration-300 hover:shadow-orange-500/40 hover:scale-110 hover:from-orange-500 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed`}
                title="Creators"
                disabled={loading && !isInitialLoad}
              >
                <Lightbulb
                  className={`${
                    leaderboardPointType === "CREATOR"
                      ? "text-white"
                      : "text-white"
                  } w-4 h-4`}
                />
              </button>
              <button
                onClick={() => handlePointTypeChange("TRADER")}
                className={`${
                  leaderboardPointType === "TRADER"
                    ? "bg-gradient-to-br from-orange-600 to-orange-700 shadow-orange-500/20"
                    : "bg-gradient-to-br from-zinc-700 to-zinc-800"
                } p-2 rounded-full transition-all duration-300 hover:shadow-orange-500/40 hover:scale-110 hover:from-orange-500 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed`}
                title="Traders"
                disabled={loading && !isInitialLoad}
              >
                <TrendingUp
                  className={`${
                    leaderboardPointType === "TRADER"
                      ? "text-white"
                      : "text-white"
                  } w-4 h-4`}
                />
              </button>
            </div>
          </div>

          {/* Rewards/Accuracy Toggle */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setShowRewards(true)}
              className={`flex-1 sm:flex-none px-3 py-2 text-sm rounded-md transition-all duration-200 ${
                showRewards
                  ? "bg-orange-500 text-black font-medium shadow-lg transform scale-105"
                  : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
              }`}
            >
              Points
            </button>
            <button
              onClick={() => setShowRewards(false)}
              className={`flex-1 sm:flex-none px-3 py-2 text-sm rounded-md transition-all duration-200 ${
                !showRewards
                  ? "bg-orange-500 text-black font-medium shadow-lg transform scale-105"
                  : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
              }`}
            >
              Profile
            </button>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && isInitialLoad && (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="flex items-center justify-center h-64">
          <p className="text-center text-red-400 font-serif">{error}</p>
        </div>
      )}

      {/* Empty State */}
      {!loading &&
        !error &&
        leaderboardUsers.length === 0 &&
        !isInitialLoad && (
          <div className="flex items-center justify-center h-64">
            <p className="text-center text-gray-500 font-serif">
              No {leaderboardPointType.toLowerCase()}s found in leaderboard.
            </p>
          </div>
        )}

      {/* Table Content */}
      {leaderboardUsers.length > 0 && (
        <>
          {/* Table header - Hidden on mobile for cleaner look */}
          <div className="hidden sm:grid grid-cols-12 gap-2 py-3 px-4 text-xs text-zinc-500 font-medium border-b border-zinc-800/50">
            <div className="col-span-1 text-center">RANK</div>
            <div className="col-span-6">USER</div>
            <div className="col-span-2 text-right">POINTS</div>
            <div className="col-span-3 text-right pr-2">
              {showRewards ? "DETAILS" : "PROFILE"}
            </div>
          </div>

          {/* Leaderboard items */}
          <div className="divide-y divide-zinc-800/30">
            {displayData.map((user, index) => {
              // Calculate progress percentage
              const progressPercent =
                maxPoints > 0 ? (user.points / maxPoints) * 100 : 0;

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
                                src={
                                  user.user.profile_pic ||
                                  "https://www.shutterstock.com/image-vector/default-avatar-profile-icon-social-600nw-1906669723.jpg"
                                }
                                alt={user.user.username}
                                className="w-full h-full object-cover"
                                loading="lazy"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-white truncate text-sm">
                                {user.user.username}
                              </div>
                              <div className="text-xs text-gray-400 truncate">
                                {user.user.wallet_address.slice(0, 6)}...
                                {user.user.wallet_address.slice(-4)}
                              </div>
                            </div>
                          </div>

                          {/* Points and Progress */}
                          <div className="mb-2">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-xs text-zinc-500">
                                {leaderboardPointType === "CREATOR"
                                  ? "Creator"
                                  : "Trader"}{" "}
                                Points
                              </span>
                              <span className="font-bold text-orange-500 text-sm">
                                {user.points.toLocaleString()}
                              </span>
                            </div>
                            <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-orange-500 to-orange-400 transition-all duration-500"
                                style={{ width: `${progressPercent}%` }}
                              />
                            </div>
                          </div>

                          {/* Additional Info */}
                          {!showRewards && (
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-zinc-500">
                                Wallet
                              </span>
                              <span className="font-medium text-white text-xs">
                                {user.user.wallet_address.slice(0, 8)}...
                                {user.user.wallet_address.slice(-6)}
                              </span>
                            </div>
                          )}
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
                            src={
                              user.user.profile_pic ||
                              "https://www.shutterstock.com/image-vector/default-avatar-profile-icon-social-600nw-1906669723.jpg"
                            }
                            alt={user.user.username}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="font-medium text-white truncate">
                            {user.user.username}
                          </span>
                          <span className="text-xs text-gray-400 truncate">
                            {user.user.wallet_address.slice(0, 6)}...
                            {user.user.wallet_address.slice(-4)}
                          </span>
                        </div>
                      </div>

                      <div className="col-span-2 text-right">
                        <div className="font-bold text-orange-500">
                          {user.points.toLocaleString()}
                        </div>
                        <div className="text-zinc-500 text-xs">
                          {leaderboardPointType === "CREATOR"
                            ? "Creator"
                            : "Trader"}{" "}
                          FP
                        </div>

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
                          <div className="text-right">
                            <div className="font-bold text-white text-sm">
                              Rank #{index + 1}
                            </div>
                            <div className="text-xs text-zinc-500">
                              {leaderboardPointType === "CREATOR"
                                ? "Creator"
                                : "Trader"}
                            </div>
                          </div>
                        ) : (
                          <div className="text-right">
                            <div className="font-medium text-white text-xs">
                              {user.user.wallet_address.slice(0, 8)}...
                            </div>
                            <div className="text-xs text-zinc-500">Wallet</div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* View more / less */}
          {leaderboardUsers.length > 7 && (
            <div className="text-center py-4 border-t border-zinc-800 flex justify-center bg-black/40">
              <button
                onClick={() => setShowAll(!showAll)}
                className="text-sm text-zinc-400 hover:text-orange-500 transition-colors flex items-center gap-2 px-4 py-2 rounded-md hover:bg-zinc-800/50 active:scale-95 transform transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                <span>{showAll ? "Show Less" : "View All Rankings"}</span>
                {showAll ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
            </div>
          )}

          {/* Loading indicator for refresh */}
          {loading && !isInitialLoad && (
            <div className="text-center py-2 border-t border-zinc-800 bg-black/20">
              <div className="text-xs text-zinc-500 flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-3 w-3 border-b border-orange-500"></div>
                Updating...
              </div>
            </div>
          )}
        </>
      )}
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
