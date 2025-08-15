import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Clock, Users, BarChart2, TrendingUp } from "lucide-react";
import type { Market } from "../lib/interface";
import { TimeUtils, formatMarketTime } from "../utils/helpers";
import { usePrivy } from "@privy-io/react-auth";
import { MarketResolutionModal } from "./MarketResolutionModal";
import { useMarketOdds, useMarketDetails } from "../hooks/useMarketDetails";


const MarketCards = ({ data }: { data: Market[] }) => {
  return (
    <div className="w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
        {data.map((marketData, index) => (
          <RaizeStyleCard key={index} data={marketData} index={index} />
        ))}
      </div>
    </div>
  );
};


const RaizeStyleCard = ({ data, index }: { data: Market; index: number }) => {
  // All original state and hooks are untouched
  const [showResolutionModal, setShowResolutionModal] = useState(false);
  const navigate = useNavigate();
  const { user } = usePrivy();
  const cardRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const { data: marketOdds } = useMarketOdds(data.marketId);
  const { data: marketDetails } = useMarketDetails(data.marketId);
  

  const timeInfo = formatMarketTime(data.expiry_date);
  const userTimezone = TimeUtils.getUserTimezone();
  const isMarketClosed = timeInfo.isEnded;
  const userWalletAddress = user?.wallet?.address;
  const isUserCreator = Boolean(
    userWalletAddress &&
      data.creator.wallet_address &&
      userWalletAddress.toLowerCase() === data.creator.wallet_address.toLowerCase()
  );
  const needsResolution = isMarketClosed && !data.isResolved && isUserCreator;

  // Enhanced category colors
  const getCategoryColor = (tags: string[]) => {
    if (!tags || tags.length === 0) return "defi";
    return tags[0].toLowerCase();
  };

  const categoryTag = getCategoryColor(data.tags);


  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.1 }
    );
    if (cardRef.current) observer.observe(cardRef.current);
    return () => {
      if (cardRef.current) observer.unobserve(cardRef.current);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = showResolutionModal ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [showResolutionModal]);
  

  const handleCardClick = () => {
    if (data.isResolved || needsResolution) return;
    const marketData = {
      id: data.id,
      name: data.question,
      outcomes: { yes: "Yes", no: "No" },
      tags: data.tags,
      endDate: timeInfo.local,
      creator: data.creator.username,
      description: data.description,
      iconUrl: data.image,
      userTimezone: userTimezone,
    };
    navigate(`/trade/${data.id}`, { state: { marketData } });
  };

  const getDaysHours = (timestamp: Date | string) => {
    const now = new Date().getTime();
    const end = new Date(timestamp).getTime();
    const diff = end - now;
    if (diff <= 0) return "Market Ended";
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    if (days > 0) return `${days}d ${hours}h left`;
    if (hours > 0) return `${hours}h ${minutes}m left`;
    return `${minutes}m left`;
  };
  
  const getMarketOdds = () => {
    if (marketOdds && marketOdds.totalVolume > 0) {
      // Validate percentages and ensure they're within valid range
      const yesPercent = Number(marketOdds.probabilityA);
      const noPercent = Number(marketOdds.probabilityB);
      
      // Check if percentages are valid numbers and within reasonable range
      const isValidPercent = (val: number) => !isNaN(val) && val >= 0 && val <= 100;
      
      if (isValidPercent(yesPercent) && isValidPercent(noPercent)) {
        return {
          yesPercentage: yesPercent,
          noPercentage: noPercent,
        };
      }
    }
    return { yesPercentage: 50.0, noPercentage: 50.0 };
  };

  const odds = getMarketOdds();
  const canInteract = !isMarketClosed && !data.isResolved;

  return (
    <>
      <div
        ref={cardRef}
        onClick={!needsResolution ? handleCardClick : undefined}
        className={`
          relative group bg-[#131314f2] 
          backdrop-blur-xl border border-slate-600/60 rounded-3xl p-6 overflow-hidden
          shadow-2xl shadow-black/20 transition-all duration-300 ease-out
          ${canInteract ? "cursor-pointer hover:border-slate-500/80 hover:-translate-y-1 hover:shadow-3xl hover:shadow-black/30" : "opacity-70 cursor-default"}
          ${isVisible ? "animate-reveal opacity-100" : "opacity-0 translate-y-10 scale-95"}
        `}
        style={{ animationDelay: `${index * 100}ms` }}
      >
        

        {data.isResolved && (
          <div className="absolute inset-0 bg-slate-900/95 backdrop-blur-md z-20 flex items-center justify-center rounded-3xl">
            <div className="bg-slate-800/90 border border-slate-600/50 rounded-2xl p-8 text-center max-w-xs backdrop-blur-sm">
              <div className="w-16 h-16 bg-slate-700/50 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Lock size={28} className="text-slate-300" />
              </div>
              <h3 className="text-white text-xl font-bold mb-2">Market Resolved</h3>
              <p className="text-slate-400 text-sm mb-6">This market is closed.</p>
              {data.winningOutcome && (
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500/20 to-green-500/20 border border-emerald-400/30 rounded-full px-6 py-2">
                  <TrendingUp size={16} className="text-emerald-300" />
                  <span className="text-emerald-300 text-sm font-semibold">Winner: {data.winningOutcome}</span>
                </div>
              )}
            </div>
          </div>
        )}
        
        {needsResolution && (
          <div className="absolute inset-0 bg-slate-900/95 backdrop-blur-md z-20 flex items-center justify-center rounded-3xl">
            <div className="bg-slate-800/90 border border-slate-600/50 rounded-2xl p-8 text-center max-w-xs backdrop-blur-sm">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-500/30 to-orange-500/30 border border-amber-400/40 rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg">
                <span className="text-amber-300 text-2xl font-bold">!</span>
              </div>
              <h3 className="text-white text-xl font-bold mb-2">Needs Resolution</h3>
              <p className="text-slate-300 text-sm my-4">This market has ended and requires your action.</p>
              <button
                onClick={(e) => { e.stopPropagation(); setShowResolutionModal(true); }}
                className="mt-4 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold px-8 py-3 rounded-xl transition-all duration-300 shadow-lg shadow-orange-900/40 w-full hover:shadow-xl hover:shadow-orange-800/50 transform hover:scale-[1.02]"
              >
                Resolve Now
              </button>
            </div>
          </div>
        )}
        
        {/* Main content */}
        <div className="relative z-10">
          {/* Compact header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <img src={data.image} alt="" className="w-10 h-10 rounded-lg object-cover" />
              <span className="text-slate-400 text-sm bg-slate-800/60 px-2.5 py-1 rounded text-xs">{categoryTag}</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-500 text-xs">
              <Clock size={12} />
              <span>{getDaysHours(data.expiry_date)}</span>
            </div>
          </div>

          {/* Better stats layout */}
          {marketDetails && (
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center gap-2 bg-slate-800/60 px-3 py-1.5 rounded-lg">
                <Users size={14} className="text-slate-400" />
                <span className="text-white text-sm font-medium">{marketDetails.bettorCount} Trades</span>
              </div>
              <div className="flex items-center gap-2 bg-slate-800/60 px-3 py-1.5 rounded-lg">
                <BarChart2 size={14} className="text-slate-400" />
                <span className="text-white text-sm font-medium">${(marketDetails.totalVolume / 1e6).toFixed(2)} Volume</span>
              </div>
            </div>
          )}

          {/* Compact content section */}
          <div className="mb-6">
            <h3 className="text-white text-lg font-semibold leading-tight mb-3 line-clamp-2">
              {data.question}
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed line-clamp-2">
              {data.description}
            </p>
          </div>

          {/* Simple creator section */}
          <div className="mb-6 text-sm text-slate-500">
            by <span className="text-slate-300">{data.creator.username}</span>
          </div>

          {/* Percentage visual buttons with extreme value protection */}
          <div className="space-y-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (canInteract) {
                  navigate(`/trade/${data.id}`, { state: { marketData: { ...data, name: data.question, endDate: timeInfo.local, iconUrl: data.image, userTimezone: userTimezone }, initialBuy: true } });
                }
              }}
              disabled={!canInteract}
              className="w-full relative h-10 bg-green-800 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors duration-200 disabled:cursor-not-allowed overflow-hidden"
            >
              <div 
                className="absolute left-0 top-0 h-full bg-green-500 transition-all duration-300"
                style={{ width: `${Math.max(Math.min(odds.yesPercentage, 95), 5)}%` }}
              />
              <div className="relative z-10 flex items-center justify-between px-4 h-full">
                <span className="truncate">Yes</span>
                <span className="font-bold text-xs sm:text-sm whitespace-nowrap ml-2">{odds.yesPercentage.toFixed(0)}%</span>
              </div>
            </button>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (canInteract) {
                  navigate(`/trade/${data.id}`, { state: { marketData: { ...data, name: data.question, endDate: timeInfo.local, iconUrl: data.image, userTimezone: userTimezone }, initialBuy: false } });
                }
              }}
              disabled={!canInteract}
              className="w-full relative h-10 bg-red-700 hover:bg-red-600 text-white font-semibold rounded-lg transition-colors duration-200 disabled:cursor-not-allowed overflow-hidden"
            >
              <div 
                className="absolute left-0 top-0 h-full bg-red-500 transition-all duration-300"
                style={{ width: `${Math.max(Math.min(odds.noPercentage, 95), 5)}%` }}
              />
              <div className="relative z-10 flex items-center justify-between px-4 h-full">
                <span className="truncate">No</span>
                <span className="font-bold text-xs sm:text-sm whitespace-nowrap ml-2">{odds.noPercentage.toFixed(0)}%</span>
              </div>
            </button>
          </div>
        </div>
      </div>
      
      {/* Modal is unchanged */}
      {showResolutionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/70 backdrop-blur-md"
            onClick={() => setShowResolutionModal(false)}
          />
          <div className="relative z-10 max-w-lg w-full">
            <MarketResolutionModal
              market={data}
              isOpen={showResolutionModal}
              onClose={() => setShowResolutionModal(false)}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default MarketCards;