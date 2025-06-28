import { Lightbulb, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchLeaderboard, handleDashboardError, type LeaderboardEntry, type PointType } from "../apis/leaderboard";


const LeaderBoard = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [leaderboardPointType, setLeaderboardPointType] = useState<PointType>("CREATOR");
  const [leaderboardUsers, setLeaderboardUsers] = useState<LeaderboardEntry[]>([]);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const getLeaderboard = async (pointType: PointType, limit?: number, isRefresh = false) => {
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
        throw new Error('Failed to fetch leaderboard');
      }
    } catch (err: any) {
      const errorMsg = handleDashboardError(err, 'fetchLeaderboard');
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
    getLeaderboard(pointType, 10, false); // Not a refresh, show loading
  };

  useEffect(() => {
    getLeaderboard(leaderboardPointType, 10, false); // Initial load
    const interval = setInterval(() => {
      getLeaderboard(leaderboardPointType, 10, true); // This is a refresh
    }, 10000);
    return () => clearInterval(interval);
  }, [leaderboardPointType]);

  return (
    <div className="border border-zinc-800 w-full rounded-xl">
      <div className="bg-gradient-to-b from-[#111] to-[#0a0a0a] rounded-xl p-4 sm:p-6 shadow-lg">
        <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between mb-4 sm:mb-6 gap-3">
          <Link to="/leaderboard" className="block">
            <h2 className="text-white text-2xl sm:text-2xl md:text-3xl font-serif font-bold hover:text-teal-100 transition-colors duration-300">
              Leaderboards
            </h2>
          </Link>
          <div className="flex space-x-2">
            <button 
              onClick={() => handlePointTypeChange('CREATOR')}
              className={`${
                leaderboardPointType === 'CREATOR' 
                  ? 'bg-gradient-to-br from-orange-600 to-orange-700 shadow-teal-500/20' 
                  : 'bg-gradient-to-br from-zinc-700 to-zinc-800'
              } p-1.5 sm:p-2 rounded-full transition-all duration-300 hover:shadow-orange-500/40 hover:scale-110 hover:from-orange-500 hover:to-orange-600`}
              title="Creators"
            >
              <Lightbulb className={`${leaderboardPointType === 'CREATOR' ? 'text-teal-100' : 'text-white'} w-4 h-4 sm:w-5 sm:h-5`} />
            </button>
            <button 
              onClick={() => handlePointTypeChange('TRADER')}
              className={`${
                leaderboardPointType === 'TRADER' 
                  ? 'bg-gradient-to-br from-orange-600 to-orange-700 shadow-teal-500/20' 
                  : 'bg-gradient-to-br from-zinc-700 to-zinc-800'
              } p-1.5 sm:p-2 rounded-full transition-all duration-300 hover:shadow-orange-500/40 hover:scale-110 hover:from-orange-500 hover:to-orange-600`}
              title="Traders"
            >
              <TrendingUp className={`${leaderboardPointType === 'TRADER' ? 'text-teal-100' : 'text-white'} w-4 h-4 sm:w-5 sm:h-5`} />
            </button>
          </div>
        </div>

        {/* Fixed height container with scroll - equivalent to 5 entries */}
        <div 
          className="overflow-y-auto scrollbar-thin scrollbar-track-zinc-800 scrollbar-thumb-zinc-600 hover:scrollbar-thumb-zinc-500"
          style={{ 
            minHeight: '280px', // Equivalent to 5 entries (56px each)
            maxHeight: '280px'
          }}
        >
          {/* Only show loading state on initial load */}
          {loading && isInitialLoad && (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
            </div>
          )}

          {/* Show error state */}
          {error && (
            <div className="flex items-center justify-center h-full">
              <p className="text-center text-red-400 font-serif">
                {error}
              </p>
            </div>
          )}

          {/* Show empty state only when not loading and no error */}
          {!loading && !error && leaderboardUsers.length === 0 && !isInitialLoad && (
            <div className="flex items-center justify-center h-full">
              <p className="text-center text-gray-500 font-serif">
                No {leaderboardPointType.toLowerCase()}s found in leaderboard.
              </p>
            </div>
          )}

          {/* Show leaderboard data */}
          {leaderboardUsers.length > 0 && (
            <div className="space-y-2 pr-2">
              {leaderboardUsers.map((item, index) => (
                <Link 
                  to={`/profile/${item.user.wallet_address}`} 
                  key={item.id}
                  className="block"
                >
                  <div className="flex items-center group hover:bg-teal-500/5 rounded-lg transition-all duration-300 cursor-pointer p-2 min-h-[52px]">
                    {/* Rank Number */}
                    <div className="text-gray-500 font-serif mr-2 sm:mr-3 md:mr-5 w-6 text-center text-sm sm:text-base font-bold">
                      #{index + 1}
                    </div>
                    
                    {/* Profile Picture */}
                    <div className="h-8 w-8 min-w-8 sm:h-10 sm:w-10 sm:min-w-10 rounded-full overflow-hidden mr-2 sm:mr-3 md:mr-5 bg-gradient-to-br from-gray-800 to-black p-0.5 group-hover:from-teal-900 group-hover:to-black transition-all duration-300">
                      <img
                        src={item.user.profile_pic || "https://www.shutterstock.com/image-vector/default-avatar-profile-icon-social-600nw-1906669723.jpg"}
                        alt={`${item.user.username}'s avatar`}
                        className="w-full h-full object-cover rounded-full"
                        loading="lazy"
                      />
                    </div>
                    
                    {/* Username */}
                    <div className="flex-1 mr-2 sm:mr-4 min-w-0">
                      <p className="text-white font-serif text-sm sm:text-base group-hover:text-teal-100 transition-colors duration-300 truncate">
                        {item.user.username}
                      </p>
                      <p className="text-gray-500 text-xs group-hover:text-gray-400 transition-colors duration-300 truncate">
                        {item.user.wallet_address.slice(0, 6)}...{item.user.wallet_address.slice(-4)}
                      </p>
                    </div>
                    
                    {/* Points */}
                    <div className="text-right">
                      <div className="text-orange-500 font-serif text-sm sm:text-base font-bold whitespace-nowrap group-hover:text-orange-400 group-hover:scale-105 transition-all duration-300">
                        {item.points.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500 group-hover:text-gray-400 transition-colors duration-300">
                        {leaderboardPointType === 'CREATOR' ? 'Creator' : 'Trader'} FP
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
              
              {/* Show "View More" link if there are exactly 10 items */}
              {leaderboardUsers.length === 10 && (
                <Link 
                  to="/leaderboard" 
                  className="block mt-4"
                >
                  <div className="text-center p-3 text-teal-500 hover:text-teal-400 transition-colors duration-300 font-serif text-sm border-t border-zinc-800">
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