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
          bg-black border border-gray-800
          rounded-xl shadow-lg
          transition-all duration-300 ease-out
          overflow-hidden
          flex flex-col
          ${isMarketClosed || needsResolution
            ? "opacity-70 cursor-default"
            : "hover:shadow-xl hover:border-orange-500/30 hover:shadow-orange-500/10 cursor-pointer"
          }
          ${isVisible
            ? "animate-reveal opacity-100"
            : "opacity-0 translate-y-10 scale-95"
          }
        `}
        style={{ 
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)", 
          animationDelay: `${index * 150}ms`
        }}
      >
        {/* Status Overlays */}
        {isMarketClosed && data.isResolved && (
          <div className="absolute inset-0 bg-black/90 z-20 flex flex-col items-center justify-center">
            <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 text-center">
              <Lock size={32} className="text-gray-400 mx-auto mb-3" />
              <h3 className="text-white text-lg font-semibold mb-2">
                Market Resolved
              </h3>
              <p className="text-gray-400 text-sm mb-3">
                This market has been resolved
              </p>
              {data.outcomeWon && (
                <div className="inline-flex items-center gap-2 bg-orange-500/20 border border-orange-500/50 rounded-full px-3 py-1">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span className="text-orange-400 text-sm font-medium">
                    Winner: {data.winningOutcome}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Needs Resolution Overlay for Creator */}
        {needsResolution && (
          <div className="absolute inset-0 bg-black/90 z-20 flex flex-col items-center justify-center">
            <div className="bg-gray-900 border border-orange-500/50 rounded-xl p-6 text-center">
              <div className="w-12 h-12 bg-orange-500 rounded-full mx-auto mb-3 flex items-center justify-center">
                <span className="text-white text-xl font-bold">!</span>
              </div>
              <h3 className="text-white text-lg font-semibold mb-2">
                Needs Resolution
              </h3>
              <p className="text-gray-300 text-sm mb-4">
                This market has ended and needs to be resolved
              </p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowResolutionModal(true);
                }}
                className="bg-orange-500 hover:bg-orange-600 text-white font-medium px-4 py-2 rounded-lg transition-colors duration-200"
              >
                Resolve Market
              </button>
            </div>
          </div>
        )}

        {/* Regular Market Closed Overlay */}
        {isMarketClosed && !data.isResolved && !isUserCreator && (
          <div className="absolute inset-0 bg-black/90 z-20 flex flex-col items-center justify-center">
            <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 text-center">
              <Lock size={32} className="text-gray-400 mx-auto mb-3" />
              <h3 className="text-white text-lg font-semibold mb-2">
                Market Closed
              </h3>
              <p className="text-gray-400 text-sm">
                Trading has ended, awaiting resolution
              </p>
            </div>
          </div>
        )}

        {/* Header Section with Image and Title */}
        <div className="p-4 flex items-start gap-3">
          {/* Image Container */}
          <div className="flex-shrink-0">
            <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-800 border border-gray-700">
              <img
                src={data.image}
                alt={data.question}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Title and Status */}
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-medium text-sm leading-tight line-clamp-3 mb-2">
              {data.question}
            </h3>
            
            {/* Status Badge */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-full ${
                  data.isResolved
                    ? "bg-orange-500"
                    : isMarketClosed
                    ? "bg-gray-500"
                    : isEndingSoon
                    ? "bg-orange-500"
                    : "bg-green-500"
                }`}></div>
                <span className="text-white text-xs font-medium">
                  {data.isResolved ? "RESOLVED" : isMarketClosed ? "CLOSED" : "ACTIVE"}
                </span>
              </div>
              
              {!isMarketClosed && timeDifference > 0 && (
                <span className="text-orange-400 text-xs font-medium">
                  {timeInfo.relative}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="px-4 pb-3">
          <p className="text-gray-400 text-sm line-clamp-2">
            {data.description}
          </p>
        </div>

        {/* Time Information */}
        <div className="px-4 pb-3">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-3">
            <div className="flex justify-between items-center mb-1">
              <span className="text-gray-400 text-xs">
                {data.isResolved ? "Resolved:" : isMarketClosed ? "Closed:" : "Closes:"}
              </span>
              <span className="text-orange-400 text-xs font-medium">{timeInfo.relative}</span>
            </div>
            <div className="text-gray-500 text-xs">
              {timeInfo.local}
            </div>
          </div>
          
          {!isMarketClosed && timeDifference > 0 && timeDifference < 3600000 && (
            <div className="text-orange-400 text-xs font-mono text-center mt-2 bg-orange-500/10 border border-orange-500/20 rounded px-2 py-1">
              ⏰ {getPreciseCountdown(data.expiry_date)}
            </div>
          )}
        </div>

        {/* Creator Section */}
        <div className="px-4 pb-3">
          <div className="flex justify-between items-center text-xs">
            <div className="flex items-center gap-1.5">
              <span className="text-orange-400 font-medium">
                {data.creator.username}
              </span>
              {isUserCreator && (
                <span className="bg-orange-500/20 border border-orange-500/50 rounded px-1.5 py-0.5 text-orange-400 text-xs">
                  Creator
                </span>
              )}
            </div>
            <span className="text-gray-500">
              {TimeUtils.getRelativeTime(data.createdAt)}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        {hasBuyOptions && !isMarketClosed && !data.isResolved && (
          <div className="p-4 pt-0 mt-auto">
            <div className="grid grid-cols-2 gap-3">
              <button
                className="bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 px-4 rounded-lg text-sm transition-colors duration-200 flex items-center justify-center gap-2 border border-green-500/30"
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
                <span>Buy Yes</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              
              <button
                className="bg-red-600 hover:bg-red-700 text-white font-medium py-2.5 px-4 rounded-lg text-sm transition-colors duration-200 flex items-center justify-center gap-2 border border-red-500/30"
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
                <span>Buy No</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Closed State */}
        {hasBuyOptions && (isMarketClosed || data.isResolved) && !needsResolution && (
          <div className="p-4 pt-0 mt-auto">
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-3 text-center">
              <span className="text-gray-300 text-sm font-medium block mb-1">
                {data.isResolved ? "🏁 Market Resolved" : "⏰ Trading Ended"}
              </span>
              <div className="text-xs text-gray-500">
                <div>{timeInfo.local}</div>
                {data.isResolved && data.outcomeWon && (
                  <div className="mt-2 inline-flex items-center gap-1 bg-orange-500/20 border border-orange-500/50 rounded-full px-2 py-1">
                    <span className="text-orange-400 text-xs font-medium">
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