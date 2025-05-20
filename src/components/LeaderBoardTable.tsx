import { useState, type SVGProps } from 'react';
import { Trophy, ChevronDown, Flame, Award } from 'lucide-react';
import type { LeaderBoardTableData } from '../lib/interface';
import type { JSX } from 'react/jsx-runtime';


const getBadgeIcon = (position: number) => {
  if (position === 0) return <Trophy size={14} className="text-black" />;
  if (position === 1) return <Trophy size={14} className="text-black" />;
  if (position === 2) return <Trophy size={14} className="text-black" />;
  return null;
};

interface LeaderBoardTableDataProps {
    leaderboardData: LeaderBoardTableData[]
}

const LeaderBoardTable = ({leaderboardData}:LeaderBoardTableDataProps) => {
  const [showRewards, setShowRewards] = useState(true);
  const [showAll, setShowAll] = useState(false);
  
  // Calculate max points for progress bar scaling
  const maxPoints = Math.max(...leaderboardData.map(user => user.points));
  
  // Decide how many entries to show
  const displayData = showAll ? leaderboardData : leaderboardData.slice(0, 7);

  return (
    <div className="w-full max-w-4xl mx-auto bg-zinc-900 rounded-xl overflow-hidden shadow-xl border border-zinc-800">
      {/* Header */}
      <div className="bg-black p-4 border-b border-zinc-800 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Award className="text-orange-500" size={20} />
          <h2 className="text-white text-lg font-bold">Predictor Leaderboard</h2>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowRewards(!showRewards)}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${showRewards ? 'bg-orange-500 text-black font-medium' : 'bg-zinc-800 text-zinc-400'}`}
          >
            Rewards
          </button>
          <button 
            onClick={() => setShowRewards(!showRewards)}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${!showRewards ? 'bg-orange-500 text-black font-medium' : 'bg-zinc-800 text-zinc-400'}`}
          >
            Accuracy
          </button>
        </div>
      </div>

      {/* Table header */}
      <div className="grid grid-cols-12 gap-2 py-3 px-4 text-xs text-zinc-500 font-medium border-b border-zinc-800/50">
        <div className="col-span-1 text-center">#</div>
        <div className="col-span-5 sm:col-span-6">PREDICTOR</div>
        <div className="col-span-3 sm:col-span-2 text-right">POINTS</div>
        <div className="col-span-3 text-right pr-2">
          {showRewards ? 'REWARD' : 'ACCURACY'}
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
            <div 
              key={user.id}
              className="relative group"
            >
              {/* Content */}
              <div className="relative grid grid-cols-12 gap-2 py-4 px-4 items-center group-hover:bg-zinc-900/70 transition-colors">
                <div className="col-span-1 text-center">
                  {index < 3 ? (
                    <div className={`rounded-full w-8 h-8 flex items-center justify-center ${rankBgColor} ${rankTextColor} mx-auto shadow-lg`}>
                      {getBadgeIcon(index) || (index + 1)}
                    </div>
                  ) : (
                    <span className="text-zinc-500 font-medium">{index + 1}</span>
                  )}
                </div>
                
                <div className="col-span-5 sm:col-span-6 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-zinc-800 group-hover:border-orange-500/50 transition-colors">
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium text-white truncate">{user.name}</span>
                    {user.winStreak > 0 && (
                      <span className="flex text-xs items-center gap-1 text-orange-400">
                        <Flame size={12} className="text-orange-500" />
                        <span>{user.winStreak} streak</span>
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="col-span-3 sm:col-span-2 text-right">
                  <div className="font-bold text-white">{user.points}</div>
                  <div className="text-zinc-500 text-xs">points</div>
                  
                  {/* Progress bar */}
                  <div className="mt-1 h-1 bg-zinc-800 rounded-full overflow-hidden w-full">
                    <div 
                      className="h-full bg-gradient-to-r from-orange-500 to-orange-400" 
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
                
                <div className="col-span-3 text-right pr-2">
                  {showRewards ? (
                    <span className="font-bold text-orange-500 text-lg">{user.reward}</span>
                  ) : (
                    <span className="font-medium text-white">{user.accuracy}</span>
                  )}
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
          className="text-sm text-zinc-400 hover:text-orange-500 transition-colors flex items-center gap-1 px-4 py-2 rounded-md hover:bg-zinc-800/50"
        >
          <span>{showAll ? 'Show Less' : 'View All Rankings'}</span>
          {showAll ? 
            <ChevronUp className="w-4 h-4" /> : 
            <ChevronDown className="w-4 h-4" />
          }
        </button>
      </div>
    </div>
  );
};

const ChevronUp = (props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) => (
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