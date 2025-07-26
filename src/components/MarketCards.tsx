import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Lock } from "lucide-react";
import type { Market } from "../lib/interface";
import {
  TimeUtils,
  formatMarketTime,
  getPreciseCountdown,
} from "../utils/helpers";
import { usePrivy } from "@privy-io/react-auth";
import { MarketResolutionModal } from "./MarketResolutionModal";

interface MarketCardsProps {
  data: Market[];
}


const MarketCards = ({ data }: MarketCardsProps) => {
  const hasBuyOptions = true;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6 px-3 sm:px-5 md:px-6 mx-2 sm:mx-4 md:mx-6">
      {data.map((marketData, index) => (
        <EnhancedCard
          key={index}
          data={marketData}
          hasBuyOptions={hasBuyOptions}
          index={index}
        />
      ))}
    </div>
  );
};

const EnhancedCard = ({
  data,
  hasBuyOptions,
  index,
}: {
  data: Market;
  hasBuyOptions: boolean;
  index: number;
}) => {
  const [, setIsHovered] = useState(false);
  const [showResolutionModal, setShowResolutionModal] = useState(false);
  const navigate = useNavigate();
  const { user } = usePrivy();
  const cardRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isInView, setIsInView] = useState(false);

  const timeInfo = formatMarketTime(data.expiry_date);
  const userTimezone = TimeUtils.getUserTimezone();

  // Market state using updated time info
  const isMarketClosed = timeInfo.isEnded;
  const timeDifference = timeInfo.timeDifference;
  const isEndingSoon = timeInfo.isEndingSoon;

  // User and creator state
  const userWalletAddress = user?.wallet?.address;
  const isUserCreator = Boolean(
    userWalletAddress &&
    data.creator.wallet_address &&
    userWalletAddress.toLowerCase() === data.creator.wallet_address.toLowerCase()
  );

  const needsResolution = isMarketClosed && !data.isResolved && isUserCreator;

  //const isEndingSoon = timeDifference > 0 && timeDifference < 86400000;

  // Intersection Observer for scroll-triggered reveal and shrink animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          setIsInView(true);
        } else {
          setIsInView(false);
        }
      },
      {
        threshold: 0.3,
        rootMargin: "0px 0px -100px 0px", // Trigger slightly early
      }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => {
      if (cardRef.current) {
        observer.unobserve(cardRef.current);
      }
    };
  }, []);

  const handleCardClick = (e: React.MouseEvent) => {
    e.preventDefault();

    if (data.isResolved || needsResolution) return;

    const marketData = {
      id: data.id,
      name: data.question,
      outcomes: {
        yes: `Yes`,
        no: `No`,
      },
      tags: data.tags,
      endDate: timeInfo.local, // Use formatted local time
      creator: data.creator.username,
      description: data.description,
      iconUrl: data.image,
      userTimezone: userTimezone,
    };

    navigate(`/trade/${data.id}`, { state: { marketData } });
  };

 return (
  <>
    <div
      ref={cardRef}
      onClick={!isMarketClosed && !needsResolution ? handleCardClick : undefined}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        relative group
        bg-gradient-to-br from-zinc-900/90 via-zinc-800/80 to-black/90
        backdrop-blur-xl border border-zinc-700/50
        rounded-3xl shadow-2xl shadow-black/50
        transition-all duration-500 ease-out
        overflow-hidden
        min-h-[480px] max-h-[520px]
        flex flex-col p-0
        ${isMarketClosed || needsResolution
          ? "opacity-70 cursor-default scale-98"
          : "hover:shadow-orange-500/20 hover:shadow-2xl hover:border-orange-500/30 hover:scale-[1.02] cursor-pointer"
        }
        ${isVisible
          ? "animate-reveal opacity-100"
          : "opacity-0 translate-y-10 scale-95"
        }
        ${!isInView && isVisible ? "scale-98" : ""}
        before:absolute before:inset-0 
        before:bg-gradient-to-br before:from-white/5 before:via-transparent before:to-transparent
        before:opacity-0 before:group-hover:opacity-100 before:transition-opacity before:duration-700
        after:absolute after:inset-0 
        after:bg-gradient-to-t after:from-orange-500/5 after:via-transparent after:to-transparent
        after:opacity-0 after:group-hover:opacity-100 after:transition-opacity after:duration-500
      `}
      style={{ 
        transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)", 
        animationDelay: `${index * 150}ms`,
        backdropFilter: 'blur(20px)',
        background: `
          linear-gradient(135deg, 
            rgba(39, 39, 42, 0.9) 0%, 
            rgba(24, 24, 27, 0.8) 50%, 
            rgba(0, 0, 0, 0.9) 100%
          )
        `
      }}
    >
      {/* Enhanced Glassmorphism Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-purple-500/5 opacity-60 group-hover:opacity-100 transition-opacity duration-700"></div>
      
      {/* Animated Glow Effects */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-gradient-radial from-orange-500/20 to-transparent rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-all duration-1000 animate-pulse-slow"></div>
      <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-gradient-radial from-orange-400/15 to-transparent rounded-full blur-2xl opacity-0 group-hover:opacity-80 transition-all duration-1000 delay-200"></div>

      {/* Status Overlays - Enhanced */}
      {isMarketClosed && data.isResolved && (
        <div className="absolute inset-0 backdrop-blur-2xl bg-black/60 z-20 flex flex-col items-center justify-center">
          <div className="relative bg-gradient-to-br from-zinc-800/90 to-zinc-900/90 backdrop-blur-xl rounded-2xl p-8 text-center border border-zinc-600/30 shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-2xl"></div>
            <div className="relative z-10">
              <Lock size={40} className="text-zinc-300 mx-auto mb-4 drop-shadow-lg" />
              <h3 className="text-zinc-100 text-xl font-bold mb-2 tracking-wide">
                Market Resolved
              </h3>
              <p className="text-zinc-400 text-sm mb-4">
                This market has been resolved
              </p>
              {data.outcomeWon && (
                <div className="inline-flex items-center gap-2 bg-orange-500/20 border border-orange-500/30 rounded-full px-4 py-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                  <span className="text-orange-300 text-sm font-semibold">
                    Winner: {data.winningOutcome}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Header Section - Fixed Height */}
      <div className="relative p-6 pb-4 flex items-center gap-4 border-b border-zinc-700/50 flex-shrink-0 bg-gradient-to-r from-zinc-800/30 to-transparent">
        {/* Enhanced Image Container */}
        <div className="relative group/image flex-shrink-0">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden bg-gradient-to-br from-zinc-600 via-zinc-700 to-black p-0.5 shadow-xl shadow-black/40 group-hover:shadow-orange-900/30 transition-all duration-700">
            <div className="w-full h-full rounded-[14px] overflow-hidden relative">
              <img
                src={data.image}
                alt={data.question}
                className={`w-full h-full object-cover transition-all duration-700 ${
                  !isMarketClosed ? "group-hover:scale-110 group-hover:brightness-110" : ""
                }`}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </div>
          </div>
          {!isMarketClosed && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full border-2 border-zinc-800 shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-500 animate-pulse"></div>
          )}
        </div>

        {/* Enhanced Title - Fixed to 2 lines max */}
        <div className="flex-1 min-w-0">
          <h3 className={`text-white font-bold text-base sm:text-lg leading-tight tracking-wide transition-all duration-500 line-clamp-2 min-h-[2.5rem] ${
            !isMarketClosed ? "group-hover:text-orange-50 group-hover:drop-shadow-lg" : ""
          }`}>
            {data.question}
          </h3>
          
          {/* Enhanced Status Badge */}
          <div className="flex items-center gap-2 mt-2">
            <div className="flex items-center gap-2 bg-zinc-800/60 backdrop-blur-sm rounded-full px-3 py-1 border border-zinc-700/50">
              <div className={`w-2 h-2 rounded-full transition-all duration-300 ${
                data.isResolved
                  ? "bg-orange-500 shadow-lg shadow-orange-500/50"
                  : isMarketClosed
                  ? "bg-zinc-500"
                  : isEndingSoon
                  ? "bg-orange-500 animate-pulse shadow-lg shadow-orange-500/50"
                  : "bg-emerald-500 shadow-lg shadow-emerald-500/50"
              }`}></div>
              <span className="text-zinc-300 text-xs font-semibold uppercase tracking-wider">
                {data.isResolved ? "Resolved" : isMarketClosed ? "Closed" : "Live"}
              </span>
            </div>
            
            {!isMarketClosed && timeDifference > 0 && (
              <div className="bg-gradient-to-r from-orange-500/20 to-orange-600/20 backdrop-blur-sm border border-orange-500/30 rounded-full px-3 py-1">
                <span className="text-orange-300 text-xs font-bold">
                  {timeInfo.relative}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Enhanced Content Section - Improved Flex Layout */}
      <div className="flex-1 flex flex-col min-h-0 px-6 pt-5">
        {/* Description - Fixed height with overflow handling */}
        <div className="flex-shrink-0 mb-4">
          <p className="text-zinc-300 font-medium text-sm sm:text-base leading-relaxed tracking-wide line-clamp-4 max-h-[6rem] overflow-hidden group-hover:text-zinc-200 transition-colors duration-300">
            {data.description}
          </p>
        </div>

        {/* Flexible spacer that adapts */}
        <div className="flex-1 min-h-[1rem]"></div>

        {/* Enhanced Time Information - Always positioned correctly */}
        <div className="flex-shrink-0 mb-4">
          <div className="bg-gradient-to-br from-zinc-800/60 via-zinc-800/40 to-zinc-900/60 backdrop-blur-xl rounded-2xl p-4 border border-zinc-700/30 shadow-inner">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-2xl"></div>
            
            <div className="relative space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-zinc-400 text-xs font-medium uppercase tracking-wider">
                  {data.isResolved ? "Resolved" : isMarketClosed ? "Closed" : "Closes"}
                </span>
                <span className="text-zinc-200 text-xs font-bold">
                  {timeInfo.relative}
                </span>
              </div>
              
              <div className="text-zinc-300 text-xs font-mono bg-zinc-900/40 rounded-lg p-2 border border-zinc-700/20">
                {timeInfo.local}
              </div>
              
              {!isMarketClosed && timeDifference > 0 && timeDifference < 3600000 && (
                <div className="text-orange-400 text-xs font-mono text-center bg-orange-500/10 rounded-lg p-2 border border-orange-500/20 animate-pulse">
                  ⏰ {getPreciseCountdown(data.expiry_date)}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Enhanced Creator Section - Always visible at bottom */}
        <div className="flex-shrink-0 mb-0">
          <div className="flex justify-between items-center pt-3 border-t border-zinc-700/30">
            <div className="flex items-center gap-2 group/creator">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <span className={`text-orange-400 font-bold text-xs sm:text-sm transition-colors duration-300 underline decoration-orange-500/30 underline-offset-2 decoration-1 truncate max-w-[100px] ${
                !isMarketClosed ? "group-hover/creator:text-orange-300" : ""
              }`}>
                {data.creator.username}
              </span>
              {isUserCreator && (
                <span className="bg-gradient-to-r from-orange-500/20 to-orange-600/20 border border-orange-500/30 rounded-full px-2 py-0.5 text-xs text-orange-300 font-semibold">
                  Creator
                </span>
              )}
            </div>
            <span className="text-zinc-500 font-medium text-xs">
              {TimeUtils.getRelativeTime(data.createdAt)}
            </span>
          </div>
        </div>
      </div>

      {/* Enhanced Glass-like Action Buttons - Fixed positioning */}
      {hasBuyOptions && !isMarketClosed && !data.isResolved && (
        <div className="flex-shrink-0 p-6 pt-4 bg-gradient-to-t from-black/20 to-transparent">
          <div className="grid grid-cols-2 gap-4">
            {/* Glass-like YES Button */}
            <button
              className="group/btn relative backdrop-blur-xl bg-gradient-to-br from-emerald-400/20 via-emerald-500/15 to-emerald-600/20 hover:from-emerald-400/30 hover:via-emerald-500/25 hover:to-emerald-600/30 py-4 rounded-2xl text-sm font-bold text-emerald-100 flex items-center justify-center gap-3 transition-all duration-500 shadow-lg shadow-emerald-500/10 hover:shadow-emerald-400/20 hover:shadow-xl transform hover:translate-y-[-2px] hover:scale-[1.02] border border-emerald-400/30 hover:border-emerald-300/50 overflow-hidden"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/trade/${data.id}`, {
                  state: {
                    marketData: {
                      id: data.id,
                      name: data.question,
                      outcomes: { yes: `Yes`, no: `No` },
                      tags: data.tags,
                      endDate: timeInfo.local,
                      creator: data.creator.username,
                      description: data.description,
                      iconUrl: data.image,
                      userTimezone: userTimezone,
                    },
                    initialBuy: true,
                  },
                });
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-white/5 to-transparent opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/10 to-transparent"></div>
              <span className="relative z-10 flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
                </svg>
                <span className="font-black">BUY YES</span>
              </span>
            </button>
            
            {/* Glass-like NO Button */}
            <button
              className="group/btn relative backdrop-blur-xl bg-gradient-to-br from-red-400/20 via-red-500/15 to-red-600/20 hover:from-red-400/30 hover:via-red-500/25 hover:to-red-600/30 py-4 rounded-2xl text-sm font-bold text-red-100 flex items-center justify-center gap-3 transition-all duration-500 shadow-lg shadow-red-500/10 hover:shadow-red-400/20 hover:shadow-xl transform hover:translate-y-[-2px] hover:scale-[1.02] border border-red-400/30 hover:border-red-300/50 overflow-hidden"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/trade/${data.id}`, {
                  state: {
                    marketData: {
                      id: data.id,
                      name: data.question,
                      outcomes: { yes: `Yes`, no: `No` },
                      tags: data.tags,
                      endDate: timeInfo.local,
                      creator: data.creator.username,
                      description: data.description,
                      iconUrl: data.image,
                      userTimezone: userTimezone,
                    },
                    initialBuy: false,
                  },
                });
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-white/5 to-transparent opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute inset-0 bg-gradient-to-t from-red-500/10 to-transparent"></div>
              <span className="relative z-10 flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
                </svg>
                <span className="font-black">BUY NO</span>
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Enhanced Closed State */}
      {hasBuyOptions && (isMarketClosed || data.isResolved) && !needsResolution && (
        <div className="flex-shrink-0 p-6 pt-4 bg-gradient-to-t from-zinc-900/40 to-transparent">
          <div className="bg-gradient-to-br from-zinc-800/80 to-zinc-900/80 backdrop-blur-xl rounded-2xl p-4 text-center border border-zinc-600/30 shadow-inner">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-2xl"></div>
            <div className="relative">
              <span className="text-zinc-300 text-sm font-bold block mb-2">
                {data.isResolved ? "🏁 Market Resolved" : "⏰ Trading Ended"}
              </span>
              <div className="text-xs text-zinc-500 space-y-1">
                <div>{timeInfo.local}</div>
                <div className="font-mono">UTC: {timeInfo.utc}</div>
              </div>
              {data.isResolved && data.outcomeWon && (
                <div className="mt-3 inline-flex items-center gap-2 bg-orange-500/20 border border-orange-500/30 rounded-full px-3 py-1">
                  <span className="text-orange-300 text-xs font-bold">
                    🏆 Winner: {data.outcomeWon === 1 ? "YES" : "NO"}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>

    <MarketResolutionModal
      market={data}
      isOpen={showResolutionModal}
      onClose={() => setShowResolutionModal(false)}
    />
  </>
);



};

export default MarketCards;

