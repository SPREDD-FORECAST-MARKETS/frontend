import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Clock, Users, TrendingUp } from "lucide-react";
import type { Market } from "../lib/interface";
import { TimeUtils, formatMarketTime } from "../utils/helpers";
import { usePrivy } from "@privy-io/react-auth";
import { MarketResolutionModal } from "./MarketResolutionModal";
import { useMarketOdds, useMarketDetails } from "../hooks/useMarketDetails";


const MarketCards = ({ data }: { data: Market[] }) => {
  return (
    <div className="w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
          relative group bg-[#131314f2] h-full
          backdrop-blur-xl border border-slate-600/40 rounded-2xl p-5 overflow-hidden
          shadow-2xl shadow-black/30 transition-all duration-300 ease-out
          before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/3 
          before:via-transparent before:to-white/3 before:rounded-2xl before:pointer-events-none 
          before:opacity-0 before:transition-opacity before:duration-500
          ${canInteract ? "cursor-pointer hover:-translate-y-1 hover:shadow-3xl hover:shadow-black/50 hover:before:opacity-100" : "opacity-70 cursor-default"}
          ${isVisible ? "animate-reveal opacity-100" : "opacity-0 translate-y-10 scale-95"}
        `}
        style={{ animationDelay: `${index * 100}ms` }}
      >
        {/* Professional glass overlay effect */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none overflow-hidden rounded-2xl">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-800 ease-out" />
        </div>
        

        {data.isResolved && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] z-20 flex items-center justify-center rounded-2xl">
            <div className="bg-gray-900/95 border border-gray-600/50 rounded-xl p-3 text-center backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-2">
                <Lock size={16} className="text-gray-300" />
                <span className="text-white text-sm font-medium">Resolved</span>
              </div>
              {data.winningOutcome && (
                <div className="flex items-center gap-1.5 bg-green-500/20 border border-green-400/40 rounded-lg px-2.5 py-1">
                  <TrendingUp size={12} className="text-green-300" />
                  <span className="text-green-300 text-xs font-medium">{data.winningOutcome} Won</span>
                </div>
              )}
            </div>
          </div>
        )}
        
        {needsResolution && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-20 flex items-center justify-center rounded-2xl">
            <div className="bg-black/70 border border-gray-600/30 rounded-2xl p-6 text-center max-w-xs backdrop-blur-md">
              <div className="w-12 h-12 bg-orange-500/30 rounded-full mx-auto mb-3 flex items-center justify-center">
                <span className="text-orange-300 text-xl font-bold">!</span>
              </div>
              <h3 className="text-white text-lg font-bold mb-2">Needs Resolution</h3>
              <p className="text-gray-300 text-sm mb-4">This market has ended and requires your action.</p>
              <button
                onClick={(e) => { e.stopPropagation(); setShowResolutionModal(true); }}
                className="bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white font-bold px-6 py-2 rounded-xl transition-all duration-300 w-full hover:shadow-lg hover:shadow-orange-500/25 transform hover:scale-[1.02]"
              >
                Resolve Now
              </button>
            </div>
          </div>
        )}
        
        {/* Main content */}
        <div className="relative z-10 flex flex-col h-full">
          {/* Compact header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <img src={data.image} alt="" className="w-10 h-10 rounded-lg object-cover" />
              <span className="text-slate-400 bg-slate-800/60 px-2.5 py-1 rounded text-sm">{categoryTag}</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-500 text-sm">
              <Clock size={13} />
              <span className="whitespace-nowrap">{getDaysHours(data.expiry_date)}</span>
            </div>
          </div>

          {/* Compact content section */}
          <div className="flex-1 mb-3">
            <h3 className="text-white text-lg xl:text-xl font-semibold leading-tight mb-2 line-clamp-3">
              {data.question}
            </h3>
            <p className="text-slate-400 text-base leading-relaxed line-clamp-3">
              {data.description}
            </p>
          </div>

          {/* Stats layout - moved below description */}
          {marketDetails && (
            <div className="flex items-center justify-between mb-3 border-t border-slate-800/50 pt-3">
              <div className="flex items-center gap-1.5">
                <Users size={14} className="text-orange-400" />
                <span className="text-white text-base font-medium">{marketDetails.bettorCount} Trades</span>
              </div>
              <div className="flex items-center gap-1.5">
                <img src="/usdc.svg" alt="USDC" className="w-4 h-4" />
                <span className="text-white text-base font-medium">${(marketDetails.totalVolume / 1e6).toFixed(2)} Volume</span>
              </div>
            </div>
          )}

          {/* Simple creator section */}
          <div className="mb-3 text-base text-slate-500">
            by <span className="text-slate-300">{data.creator.username}</span>
          </div>

          {/* Percentage visual buttons */}
          <div className="space-y-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (canInteract) {
                  navigate(`/trade/${data.id}`, { state: { marketData: { ...data, name: data.question, endDate: timeInfo.local, iconUrl: data.image, userTimezone: userTimezone }, initialBuy: true } });
                }
              }}
              disabled={!canInteract}
              className="w-full relative h-10 xl:h-11 bg-[#0a2e1f] hover:bg-green-800/30 font-semibold rounded-lg transition-all duration-300 disabled:cursor-not-allowed overflow-hidden group hover:shadow-md hover:shadow-green-500/15 hover:scale-[1.02]"
            >
              <div 
                className="absolute left-0 top-0 h-full bg-gradient-to-r from-green-600 to-green-500 transition-all duration-300 group-hover:from-green-500 group-hover:to-green-400"
                style={{ width: `${odds.yesPercentage}%` }}
              />
              <div className="relative z-10 flex items-center justify-between px-3 xl:px-4 h-full">
                <span className="text-white font-bold text-base group-hover:text-green-100 transition-colors duration-300">Yes</span>
                <span className="font-bold text-base whitespace-nowrap ml-2 text-white group-hover:text-green-100 transition-colors duration-300">{odds.yesPercentage.toFixed(0)}%</span>
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
              className="w-full relative h-10 xl:h-11 bg-[#3a0e0e] hover:bg-red-800/30 font-semibold rounded-lg transition-all duration-300 disabled:cursor-not-allowed overflow-hidden group hover:shadow-md hover:shadow-red-500/15 hover:scale-[1.02]"
            >
              <div 
                className="absolute left-0 top-0 h-full bg-gradient-to-r from-red-600 to-red-500 transition-all duration-300 group-hover:from-red-500 group-hover:to-red-400"
                style={{ width: `${odds.noPercentage}%` }}
              />
              <div className="relative z-10 flex items-center justify-between px-3 xl:px-4 h-full">
                <span className="text-white font-bold text-base group-hover:text-red-100 transition-colors duration-300">No</span>
                <span className="font-bold text-base whitespace-nowrap ml-2 text-white group-hover:text-red-100 transition-colors duration-300">{odds.noPercentage.toFixed(0)}%</span>
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