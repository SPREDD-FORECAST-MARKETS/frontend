import type { Market } from '../lib/interface';
import { formatDateTime } from '../utils/helpers';

interface MarketInfoCardProps {
  marketData: Market;
}

const MarketInfoCard = ({ marketData }: MarketInfoCardProps) => {
  const { creator, createdAt, description, resolution_criteria, image, question } = marketData;

  return (
    <div 
      className="bg-[#131314f2] backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl shadow-black/40 overflow-hidden h-full flex flex-col relative"
      style={{ 
        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}
    >
      {/* Glass overlay effect */}
      <div className="absolute inset-0 backdrop-blur-sm" />
      
      {/* Subtle gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-black/20" />

      {/* Content with higher z-index */}
      <div className="relative z-10 h-full flex flex-col">
        {/* Header Section */}
        <div className="flex items-start justify-between p-4 sm:p-6 flex-col sm:flex-row gap-4 sm:gap-6 border-b border-white/10">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative">
              <div className="min-w-[48px] h-12 w-12 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center shadow-lg overflow-hidden">
                <img 
                  src={image} 
                  alt={question} 
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Status indicator */}
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-amber-500 rounded-full border-2 border-[#131314] flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <h2 className="text-lg sm:text-xl font-bold text-white line-clamp-2 drop-shadow-sm leading-tight">
                {marketData.question}
              </h2>
              <div className="text-slate-300 text-sm mt-2 flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-amber-500/90 backdrop-blur-sm flex items-center justify-center shadow-lg">
                    <span className="text-white text-xs font-bold">
                      {creator.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="font-medium">Created by {creator.username}</span>
                </div>
                <span className="text-slate-400">•</span>
                <span className="text-slate-400">{formatDateTime(createdAt)}</span>
              </div>
            </div>
          </div>
          
          {/* Probability Badge */}
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-2 rounded-xl text-sm whitespace-nowrap shadow-lg">
            <span className="text-slate-400 font-medium">Probability:</span>
            <span className="text-white font-bold drop-shadow-sm">65%</span>
          </div>
        </div>

        {/* Content Section */}
        <div className="px-4 sm:px-6 py-4 sm:py-6 flex-1 overflow-y-auto">
          <div className="text-slate-200 space-y-6">
            {/* Description Section */}
            <div className="group">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-lg bg-amber-500/20 backdrop-blur-sm border border-amber-500/30 flex items-center justify-center">
                  <svg className="w-3 h-3 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="font-bold text-slate-300 text-sm tracking-wide uppercase">Description</h3>
              </div>
              
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 shadow-lg">
                <p className="leading-relaxed text-sm sm:text-base text-slate-200 font-medium">
                  {description}
                </p>
              </div>
            </div>

            {/* Resolution Criteria Section */}
            <div className="group">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-lg bg-amber-500/20 backdrop-blur-sm border border-amber-500/30 flex items-center justify-center">
                  <svg className="w-3 h-3 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="font-bold text-slate-300 text-sm tracking-wide uppercase">Resolution Criteria</h3>
              </div>
              
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 shadow-lg">
                <p className="leading-relaxed text-sm sm:text-base text-slate-200 font-medium">
                  {resolution_criteria}
                </p>
              </div>
            </div>

            {/* Additional Info Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 shadow-lg">
                <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">Market Status</div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-white font-bold text-sm">Active</span>
                </div>
              </div>
              
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 shadow-lg">
                <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">Market Type</div>
                <div className="text-white font-bold text-sm">Binary</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced glass effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl" />
    </div>
  );
};

export default MarketInfoCard;