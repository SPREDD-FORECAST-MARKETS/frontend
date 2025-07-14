import { useState } from "react";
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
        />
      ))}
    </div>
  );
};

const EnhancedCard = ({
  data,
  hasBuyOptions,
}: {
  data: Market;
  hasBuyOptions: boolean;
}) => {
  const [, setIsHovered] = useState(false);
  const [showResolutionModal, setShowResolutionModal] = useState(false);
  const navigate = useNavigate();
  const { user } = usePrivy();

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
        onClick={
          !isMarketClosed && !needsResolution ? handleCardClick : undefined
        }
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`bg-gradient-to-b from-[#111] to-[#0a0a0a] rounded-xl border border-zinc-800 overflow-hidden shadow-xl relative h-[420px] sm:h-[450px] flex flex-col p-0 transition-all duration-500 group ${
          isMarketClosed || needsResolution
            ? "opacity-75 cursor-default"
            : "hover:shadow-2xl hover:shadow-orange-900/10 hover:border-zinc-700 cursor-pointer"
        }`}
      >
        {/* Card content with responsive improvements */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-900/5 via-transparent to-transparent pointer-events-none opacity-70 group-hover:opacity-100 transition-opacity duration-500"></div>
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-orange-500/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

        {/* Market Closed/Resolved Overlay */}
        {isMarketClosed && data.isResolved && (
          <div className="absolute inset-0 backdrop-blur-sm z-10 flex flex-col items-center justify-center">
            <div className="rounded-xl p-6 text-center">
              <Lock size={32} className="text-zinc-500 mx-auto mb-3" />
              <h3 className="text-zinc-400 text-lg font-medium">
                Market Resolved
              </h3>
              <p className="text-zinc-500 text-sm mt-1">
                This market has been resolved
              </p>
              {data.outcomeWon && (
                <p className="text-orange-400 text-sm mt-2 font-semibold">
                  Winner: {data.winningOutcome}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Needs Resolution Overlay for Creator */}
        {needsResolution && (
          <div className="absolute inset-0 backdrop-blur-sm z-10 flex flex-col items-center justify-center">
            <div className="rounded-xl p-6 text-center">
              <div className="w-8 h-8 bg-orange-500 rounded-full mx-auto mb-3 flex items-center justify-center">
                <span className="text-white text-sm font-bold">!</span>
              </div>
              <h3 className="text-orange-400 text-lg font-medium">
                Needs Resolution
              </h3>
              <p className="text-zinc-400 text-sm mt-1 mb-4">
                This market has ended and needs to be resolved
              </p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowResolutionModal(true);
                }}
                className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-4 py-2 rounded-lg transition-colors duration-200"
              >
                Resolve Market
              </button>
            </div>
          </div>
        )}

        {/* Regular Market Closed Overlay */}
        {isMarketClosed && !data.isResolved && !isUserCreator && (
          <div className="absolute inset-0 backdrop-blur-sm z-10 flex flex-col items-center justify-center">
            <div className="rounded-xl p-6 text-center">
              <Lock size={32} className="text-zinc-500 mx-auto mb-3" />
              <h3 className="text-zinc-400 text-lg font-medium">
                Market Closed
              </h3>
              <p className="text-zinc-500 text-sm mt-1">
                Trading has ended, awaiting resolution
              </p>
            </div>
          </div>
        )}

        {/* Header Section */}
        <div className="p-4 sm:p-5 pb-3 flex items-center gap-3 border-b border-zinc-800/20 flex-shrink-0">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg overflow-hidden bg-gradient-to-br from-zinc-800 to-black p-0.5 shadow-md shadow-black/20 group-hover:shadow-orange-900/20 transition-all duration-500 flex-shrink-0">
            <img
              src={data.image}
              alt={data.question}
              className={`w-full h-full object-cover rounded-md transition-transform duration-500 ${
                !isMarketClosed ? "group-hover:scale-110" : ""
              }`}
            />
          </div>
          <h3
            className={`text-white font-serif font-bold text-sm sm:text-base md:text-lg flex-1 tracking-wide transition-colors duration-300 line-clamp-2 leading-tight ${
              !isMarketClosed ? "group-hover:text-orange-50" : ""
            }`}
          >
            {data.question}
          </h3>
        </div>

        {/* Content Section - Flexible */}
        <div className="px-4 sm:px-5 pt-3 sm:pt-4 flex-1 flex flex-col justify-between min-h-0">
          {/* Description */}
          <div className="flex-1">
            <p className="text-zinc-300 font-serif text-sm sm:text-base leading-relaxed tracking-wide line-clamp-3">
              {data.description}
            </p>
          </div>

          {/* Enhanced Time Section with Better UTC Display */}
          <div className="mt-4 rounded-lg p-3 transition-colors duration-300">
            {/* Status indicator and countdown */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <div
                  className={`w-2 h-2 rounded-full flex-shrink-0 ${
                    data.isResolved
                      ? "bg-blue-500"
                      : isMarketClosed
                      ? "bg-red-500"
                      : isEndingSoon
                      ? "bg-red-500 animate-pulse"
                      : "bg-green-500"
                  }`}
                ></div>
                <span className="text-zinc-300 text-xs font-medium uppercase tracking-wide">
                  {data.isResolved
                    ? "Resolved"
                    : isMarketClosed
                    ? "Closed"
                    : "Active"}
                </span>
              </div>

              {/* Show time left for active markets */}
              {!isMarketClosed && timeDifference > 0 && (
                <div className="px-2 py-1 rounded-md">
                  <span
                    className={`text-xs font-semibold ${
                      isEndingSoon ? "text-red-400" : "text-orange-400"
                    }`}
                  >
                    {timeInfo.relative}
                  </span>
                </div>
              )}
            </div>

            {/* Enhanced Date information with UTC display */}
            <div className="border-t border-zinc-700/50 pt-2 space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-zinc-400 text-xs">
                  {data.isResolved
                    ? "Resolved:"
                    : isMarketClosed
                    ? "Closed:"
                    : "Closes:"}
                </span>
                <span className="text-zinc-300 text-xs font-medium">
                  {timeInfo.relative}
                </span>
              </div>

              {/* Local time display */}
              <div className="text-zinc-300 text-xs">
                {timeInfo.local}
              </div>

              {/* Precise countdown for markets ending within 1 hour */}
              {!isMarketClosed &&
                timeDifference > 0 &&
                timeDifference < 3600000 && (
                  <div className="text-orange-400 text-xs font-mono">
                    {getPreciseCountdown(data.expiry_date)}
                  </div>
                )}
            </div>
          </div>
        </div>

        {/* Footer Section */}
        <div className="flex justify-between items-center p-4 sm:p-5 bg-gradient-to-r from-zinc-900/30 to-zinc-800/20 flex-shrink-0">
          <div className="flex items-center group/creator">
            <span
              className={`text-orange-400 font-bold text-xs sm:text-sm transition-colors duration-300 underline decoration-orange-500/30 underline-offset-2 decoration-1 truncate max-w-[80px] sm:max-w-[100px] ${
                !isMarketClosed ? "group-hover/creator:text-orange-300" : ""
              }`}
            >
              {data.creator.username}
            </span>
            {isUserCreator && (
              <span className="ml-2 px-2 py-0.5 bg-orange-500/20 rounded-full text-xs text-orange-400 font-medium">
                You
              </span>
            )}
          </div>

          <div className="flex flex-col items-end">
            <span className="text-zinc-500 font-serif text-xs truncate">
              {TimeUtils.getRelativeTime(data.createdAt)}
            </span>
          </div>
        </div>

        {/* Buy Options - Active Markets */}
        {hasBuyOptions && !isMarketClosed && !data.isResolved && (
          <div className="px-4 sm:px-5 py-3 sm:py-4 bg-gradient-to-b from-transparent to-zinc-900/20 flex-shrink-0">
            <div className="grid grid-cols-2 gap-3">
              <button
                className="bg-gradient-to-br from-green-600 to-green-800 hover:from-green-500 hover:to-green-700 py-3 sm:py-3.5 rounded-lg text-xs sm:text-sm text-white flex items-center justify-center gap-2 transition-all duration-300 hover:shadow-lg hover:shadow-green-800/30 transform hover:translate-y-[-1px] group/buy font-semibold"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/trade/${data.id}`, {
                    state: {
                      marketData: {
                        id: data.id,
                        name: data.question,
                        outcomes: { yes: `Yes`, no: `No` },
                        tags: data.tags,
                        endDate: timeInfo.local, // Use formatted local time
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
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="group-hover/buy:translate-y-0.5 transition-transform duration-300"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>
              <button
                className="bg-gradient-to-br from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 py-3 sm:py-3.5 rounded-lg text-xs sm:text-sm text-white flex items-center justify-center gap-2 transition-all duration-300 hover:shadow-lg hover:shadow-red-800/30 transform hover:translate-y-[-1px] group/buy font-semibold"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/trade/${data.id}`, {
                    state: {
                      marketData: {
                        id: data.id,
                        name: data.question,
                        outcomes: { yes: `Yes`, no: `No` },
                        tags: data.tags,
                        endDate: timeInfo.local, // Use formatted local time
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
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="group-hover/buy:translate-y-0.5 transition-transform duration-300"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Closed/Resolved Market Footer */}
        {hasBuyOptions &&
          (isMarketClosed || data.isResolved) &&
          !needsResolution && (
            <div className="px-4 sm:px-5 py-3 sm:py-4 bg-gradient-to-b from-transparent to-zinc-900/20 flex-shrink-0">
              <div className="bg-zinc-800/50 rounded-lg py-3 text-center">
                <span className="text-zinc-500 text-sm font-medium">
                  {data.isResolved ? "Market Resolved" : "Trading Ended"}
                </span>
                <div className="text-xs text-zinc-600 mt-1">
                  {timeInfo.local}
                </div>
                <div className="text-xs text-zinc-500 mt-1">
                  UTC: {timeInfo.utc}
                </div>
                {data.isResolved && data.outcomeWon && (
                  <div className="text-xs text-orange-400 mt-1 font-semibold">
                    Winner: {data.outcomeWon === 1 ? "Yes" : "No"}
                  </div>
                )}
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