import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Clock, Users } from "lucide-react";
import type { Market } from "../lib/interface";
import { TimeUtils, formatMarketTime } from "../utils/helpers";
import { usePrivy } from "@privy-io/react-auth";
import { MarketResolutionModal } from "./MarketResolutionModal";
import { useMarketOdds, useMarketDetails } from "../hooks/useMarketDetails";

interface MarketCardsProps {
  data: Market[];
}

const MarketCards = ({ data }: MarketCardsProps) => {
  return (
    <div className="space-y-8 px-4 sm:px-6 md:px-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.map((marketData, index) => (
          <RaizeStyleCard key={index} data={marketData} index={index} />
        ))}
      </div>
    </div>
  );
};

const RaizeStyleCard = ({ data, index }: { data: Market; index: number }) => {
  const [showResolutionModal, setShowResolutionModal] = useState(false);
  const [, setIsHovered] = useState(false);
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
    if (!tags || tags.length === 0) return { bg: "bg-slate-600", text: "text-white" };
    const tag = tags[0].toLowerCase();
    const colorMap: { [key: string]: { bg: string; text: string } } = {
      crypto: { bg: "bg-[#ed5d0e]", text: "text-white" },
      politics: { bg: "bg-red-500", text: "text-white" },
      sports: { bg: "bg-blue-500", text: "text-white" },
      tech: { bg: "bg-violet-500", text: "text-white" },
      entertainment: { bg: "bg-pink-500", text: "text-white" },
      business: { bg: "bg-emerald-500", text: "text-white" },
      "pop culture": { bg: "bg-fuchsia-500", text: "text-white" },
      "global politics": { bg: "bg-rose-500", text: "text-white" },
    };
    return colorMap[tag] || { bg: "bg-slate-500", text: "text-white" };
  };

  const categoryColor = getCategoryColor(data.tags);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
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

  // Add body scroll lock when modal is open
  useEffect(() => {
    if (showResolutionModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    // Cleanup function to restore scroll when component unmounts
    return () => {
      document.body.style.overflow = 'unset';
    };
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
    if (diff <= 0) return "Ended";
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const getMarketOdds = () => {
    if (marketOdds && marketOdds.totalVolume > 0) {
      return {
        yesPercentage: marketOdds.probabilityA,
        noPercentage: marketOdds.probabilityB,
      };
    }
    return { yesPercentage: 50.0, noPercentage: 50.0 };
  };

  const odds = getMarketOdds();

  return (
    <>
      <div
        ref={cardRef}
        onClick={!isMarketClosed && !needsResolution ? handleCardClick : undefined}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`
          relative group bg-[#131314f2] backdrop-blur-xl border border-white/10 rounded-2xl 
          shadow-2xl shadow-black/40 transition-all duration-500 ease-out overflow-hidden 
          cursor-pointer min-h-[400px]
          before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/5 
          before:via-transparent before:to-white/5 before:rounded-2xl before:pointer-events-none 
          before:opacity-0 before:transition-opacity before:duration-500
          ${
            isMarketClosed || needsResolution
              ? "opacity-70 cursor-default"
              : "hover:transform hover:scale-[1.02] hover:border-white/20 hover:shadow-3xl hover:shadow-black/60 hover:before:opacity-100"
          }
          ${isVisible ? "animate-reveal opacity-100" : "opacity-0 translate-y-10 scale-95"}
        `}
        style={{
          animationDelay: `${index * 100}ms`,
          fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        }}
      >
        {/* Glass overlay effect */}
        <div className="absolute inset-0 backdrop-blur-sm" />
        {/* Subtle gradient overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-black/20" />

        {/* Status Overlays */}
        {isMarketClosed && data.isResolved && (
          <div className="absolute inset-0 backdrop-blur-lg bg-[#161617]/90 z-20 flex items-center justify-center rounded-2xl">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-6 text-center shadow-2xl max-w-xs">
              <Lock size={24} className="text-slate-300 mx-auto mb-3" />
              <h3 className="text-white text-lg font-semibold mb-2">Market Resolved</h3>
              <p className="text-slate-300 text-sm mb-3">This market has been resolved</p>
              {data.outcomeWon && (
                <div className="inline-flex items-center gap-2 bg-[#ed5d0e]/20 backdrop-blur-sm border border-amber-500/50 rounded-full px-3 py-1">
                  <div className="w-2 h-2 bg-[#ed5d0e] rounded-full"></div>
                  <span className="text-amber-300 text-sm font-medium">Winner: {data.winningOutcome}</span>
                </div>
              )}
            </div>
          </div>
        )}
        {needsResolution && (
          <div className="absolute inset-0 backdrop-blur-lg z-20 flex items-center justify-center rounded-2xl">
            <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 text-center shadow-2xl max-w-xs">
              <div className="w-12 h-12 bg-[#ed5d0e]/90 backdrop-blur-sm rounded-full mx-auto mb-3 flex items-center justify-center shadow-lg">
                <span className="text-white text-xl font-bold">!</span>
              </div>
              <h3 className="text-white text-lg font-semibold mb-2">Needs Resolution</h3>
              <p className="text-slate-200 text-sm mb-4">This market has ended and needs to be resolved</p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowResolutionModal(true);
                }}
                className="bg-[#ed5d0e]/90 hover:bg-[#ed5d0e] backdrop-blur-sm text-white font-medium px-4 py-2 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl text-sm"
              >
                Resolve Market
              </button>
            </div>
          </div>
        )}

        <div className="relative z-10 flex flex-col h-full">
          {/* Card Header */}
          <div className="p-6 pb-4">
            {/* Category and Time Row */}
            <div className="flex items-center justify-between mb-4">
              <div className={`${categoryColor.text} px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wide flex items-center gap-2`}>
                <img
                  src={data.image}
                  alt="Market icon"
                  className="w-8 h-8 rounded-full object-cover border border-white/20"
                />
                <span>{data.tags?.[0] || "General"}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-200 text-xs font-medium bg-white/10 backdrop-blur-sm border border-white/20 px-3 py-1.5 rounded-full shadow-md">
                <Clock size={12} className="text-slate-300" />
                <span className="whitespace-nowrap">{getDaysHours(data.expiry_date)}</span>
              </div>
            </div>

            {/* Market Question */}
            <h2 className="text-white font-bold text-xl leading-tight mb-3 line-clamp-2 text-center drop-shadow-md">
              {data.question}
            </h2>
            <p className="text-slate-200 text-sm leading-tight mb-4 line-clamp-3 text-center drop-shadow-sm">
              {data.description}
            </p>

            {/* Market Stats */}
            {marketDetails && (
              <div className="flex items-center justify-between text-xs text-slate-300 mb-4">
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 px-3 py-1.5 rounded-lg shadow-sm">
                  <Users size={12} className="text-slate-300" />
                  <span className="text-white font-medium">{marketDetails.bettorCount}</span>
                </div>
                <div className="flex items-center gap-2 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-sm">
                  <span className="text-slate-400">Pool</span>
                  <span className="text-white font-semibold">${(marketDetails.totalVolume / 1e6).toFixed(2)}</span>
                  <img src="usdc.svg" alt="USDC" className="w-5 h-5" />
                </div>
              </div>
            )}
          </div>

          {/* Odds Section */}
          <div className="px-6 pb-6 mt-auto">
            <div className="grid grid-rows-2 gap-3">
              {/* Yes Option */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (!isMarketClosed && !data.isResolved) {
                    navigate(`/trade/${data.id}`, {
                      state: {
                        marketData: {
                          id: data.id,
                          name: data.question,
                          outcomes: { yes: "Yes", no: "No" },
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
                  }
                }}
                disabled={isMarketClosed || data.isResolved}
                className={`
                  flex justify-between items-center w-full relative group/btn overflow-hidden 
                  text-white font-bold py-3 px-4 rounded-xl transition-all duration-300 
                  transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed 
                  disabled:hover:scale-100 bg-[#2b37334d] border-emerald-400/50 
                  hover:bg-emerald-500/30 hover:border-emerald-400/50 hover:shadow-lg 
                  hover:shadow-emerald-500/25
                  before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent 
                  before:via-white/5 before:to-transparent before:translate-x-[-100%] 
                  before:transition-transform before:duration-700 hover:before:translate-x-[100%]
                `}
              >
                <div className="text-base text-[#009966] font-bold drop-shadow-sm relative z-10">Yes</div>
                <div className="text-base font-bold text-[#009966] drop-shadow-sm relative z-10">
                  {odds.yesPercentage.toFixed(1)}%
                </div>
              </button>

              {/* No Option */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (!isMarketClosed && !data.isResolved) {
                    navigate(`/trade/${data.id}`, {
                      state: {
                        marketData: {
                          id: data.id,
                          name: data.question,
                          outcomes: { yes: "Yes", no: "No" },
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
                  }
                }}
                disabled={isMarketClosed || data.isResolved}
                className={`
                  flex justify-between items-center w-full relative group/btn overflow-hidden 
                  text-white font-bold py-3 px-4 rounded-xl transition-all duration-300 
                  transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed 
                  disabled:hover:scale-100 bg-[#3f24244d] border-red-400/50 
                  hover:bg-red-500/30 hover:border-red-400/50 hover:shadow-lg 
                  hover:shadow-red-500/25
                  before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent 
                  before:via-white/5 before:to-transparent before:translate-x-[-100%] 
                  before:transition-transform before:duration-700 hover:before:translate-x-[100%]
                `}
              >
                <div className="text-base font-bold text-[#ec003f] drop-shadow-sm relative z-10">No</div>
                <div className="text-base font-bold text-[#ec003f] drop-shadow-sm relative z-10">
                  {odds.noPercentage.toFixed(1)}%
                </div>
              </button>
            </div>
          </div>

          {/* Enhanced Hover Effects */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl" />
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none overflow-hidden rounded-2xl">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-out" />
          </div>
        </div>
      </div>

      {/* Modal with Blurred Background */}
      {showResolutionModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
          {/* Blurred Background Overlay */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-md transition-all duration-300"
            onClick={() => setShowResolutionModal(false)}
          />
          
          {/* Modal Container */}
          <div className="relative z-10 max-w-lg w-full mx-4 transform transition-all duration-300 ease-out scale-100 opacity-100">
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