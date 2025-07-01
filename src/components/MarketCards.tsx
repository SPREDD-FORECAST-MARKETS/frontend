import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock } from "lucide-react";
import type { Market } from "../types/apis";
import { TimeUtils } from "../utils/helpers";

interface MarketCardsProps {
  data: Market[];
}

const MarketCards = ({ data }: MarketCardsProps) => {
  const hasBuyOptions = true;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6 px-3 sm:px-5 md:px-6 mx-2 sm:mx-4 md:mx-6">
      {data.map((data, index) => (
        <EnhancedCard key={index} data={data} hasBuyOptions={hasBuyOptions} />
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
  const navigate = useNavigate();
  const optionsCount = 2;
  const minContentHeight = Math.max(40 * optionsCount, 120);

  // Use timezone utilities
  const isMarketClosed = TimeUtils.isMarketClosed(data.expiry_date);
  const userTimezone = TimeUtils.getUserTimezone();

  // Handle navigation with state
  const handleCardClick = (e: React.MouseEvent) => {
    e.preventDefault();

    const marketData = {
      id: data.id,
      name: data.question,
      outcomes: {
        yes: `Yes`,
        no: `No`,
      },
      tags: data.tags,
      endDate: TimeUtils.formatLocalDate(data.expiry_date),
      creator: data.creator.username,
      description: data.description,
      iconUrl: data.image,
      userTimezone: userTimezone,
    };

    navigate(`/trade/${data.id}`, { state: { marketData } });
  };

  return (
    <div
      onClick={!isMarketClosed ? handleCardClick : undefined}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`bg-gradient-to-b from-[#111] to-[#0a0a0a] rounded-xl border border-zinc-800 overflow-hidden shadow-xl relative h-[350px] sm:h-[370px] flex flex-col p-0 transition-all duration-500 group ${
        isMarketClosed
          ? "opacity-75 cursor-default"
          : "hover:shadow-2xl hover:shadow-orange-900/10 hover:border-zinc-700 cursor-pointer"
      }`}
    >
      {/* Card content with responsive improvements */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-900/5 via-transparent to-transparent pointer-events-none opacity-70 group-hover:opacity-100 transition-opacity duration-500"></div>
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-orange-500/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

      {/* Market Closed Overlay */}
      {isMarketClosed && (
        <div className="absolute inset-0 backdrop-blur-sm z-10 flex flex-col items-center justify-center">
          <div className="rounded-xl p-6 text-center">
            <Lock size={32} className="text-zinc-500 mx-auto mb-3" />
            <h3 className="text-zinc-400 text-lg font-medium">Market Closed</h3>
            <p className="text-zinc-500 text-sm mt-1">
              Trading has ended for this market
            </p>
          </div>
        </div>
      )}

      <div className="p-3 sm:p-5 pb-2 flex items-center gap-2 sm:gap-3 border-b border-zinc-800/20">
        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded overflow-hidden bg-gradient-to-br from-zinc-800 to-black p-0.5 shadow-md shadow-black/20 group-hover:shadow-orange-900/20 transition-all duration-500">
          <img
            src={data.image}
            alt={data.question}
            className={`w-full h-full object-cover rounded-sm transition-transform duration-500 ${
              !isMarketClosed ? "group-hover:scale-110" : ""
            }`}
          />
        </div>
        <h3
          className={`text-white font-serif font-bold text-base sm:text-lg md:text-xl flex-1 tracking-wide transition-colors duration-300 line-clamp-1 ${
            !isMarketClosed ? "group-hover:text-orange-50" : ""
          }`}
        >
          {data.question}
        </h3>
      </div>

      <div
        className="px-3 sm:px-5 pt-3 sm:pt-4 overflow-hidden flex-grow"
        style={{ minHeight: minContentHeight }}
      >
        <div className="flex flex-col gap-y-3 sm:gap-y-4 items-start rounded-lg">
          <p className="text-white font-serif text-base sm:text-lg md:text-xl leading-snug tracking-wide line-clamp-4 sm:line-clamp-3">
            {data.description}
          </p>

          {/* Enhanced time display with timezone awareness */}
          <div
            className={`flex flex-col gap-1 mt-1 bg-zinc-800/30 rounded-lg p-2 transition-colors duration-300 ${
              !isMarketClosed ? "group-hover:bg-zinc-800/50" : ""
            }`}
          >
            <div className="flex items-center">
              <div
                className={`w-2 h-2 rounded-full mr-2 ${
                  isMarketClosed
                    ? "bg-red-500"
                    : new Date(data.expiry_date).getTime() -
                        new Date().getTime() <
                      86400000
                    ? "bg-red-500 animate-pulse"
                    : "bg-green-500"
                }`}
              ></div>
              <span className="text-zinc-300 text-xs sm:text-sm">
                {isMarketClosed ? "Closed" : "Closes"}:{" "}
                {TimeUtils.formatLocalDate(data.expiry_date)}
              </span>
            </div>

            <div className="flex">
              {!isMarketClosed && (
                <div className="text-xs text-orange-400 font-medium ml-4">
                  {TimeUtils.getTimeUntilClosing(data.expiry_date)}
                </div>
              )}

              {/* Show timezone for clarity */}
              <div className="text-xs text-zinc-500 ml-4">
                Your timezone: {userTimezone}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center p-3 sm:p-5 bg-gradient-to-r from-zinc-900/30 to-zinc-800/20">
        <div className="flex items-center group/creator">
          <span
            className={`text-orange-400 font-bold text-sm sm:text-md transition-colors duration-300 underline decoration-orange-500/30 underline-offset-2 decoration-1 truncate max-w-[110px] sm:max-w-none ${
              !isMarketClosed ? "group-hover/creator:text-orange-300" : ""
            }`}
          >
            {data.creator.username}
          </span>
          <span
            className={`ml-2 px-2 py-0.5 bg-orange-500/10 rounded-full text-xs text-zinc-400 hidden sm:inline-block transition-all duration-300 transform translate-x-[-10px] ${
              !isMarketClosed
                ? "opacity-0 group-hover/creator:opacity-100 group-hover/creator:translate-x-0"
                : "opacity-0"
            }`}
          >
            Creator
          </span>
        </div>

        <div className="flex flex-col items-end">
          <span className="text-zinc-500 font-serif text-xs sm:text-sm truncate">
            {TimeUtils.getRelativeTime(data.createdAt)}
          </span>
          <span className="text-zinc-600 text-xs hidden sm:block">
            {TimeUtils.formatLocalDate(data.createdAt, {
              dateStyle: "short",
              timeStyle: "short",
            })}
          </span>
        </div>
      </div>

      {hasBuyOptions && !isMarketClosed && (
        <div className="px-3 sm:px-5 py-3 sm:py-4 bg-gradient-to-b from-transparent to-zinc-900/20">
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            <button
              className="bg-gradient-to-br from-green-600 to-green-800 hover:from-green-500 hover:to-green-700 py-2 sm:py-3 rounded-md text-xs sm:text-sm text-white flex items-center justify-center gap-1 transition-all duration-300 hover:shadow-lg hover:shadow-green-800/30 transform hover:translate-y-[-1px] group/buy"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/trade/${data.id}`, {
                  state: {
                    marketData: {
                      id: data.id,
                      name: data.question,
                      outcomes: { yes: `Yes`, no: `No` },
                      tags: data.tags,
                      endDate: TimeUtils.formatLocalDate(data.expiry_date),
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
              <span className="font-medium">Buy Yes</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="group-hover/buy:translate-y-0.5 transition-transform duration-300 hidden sm:inline-block"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>
            <button
              className="bg-gradient-to-br from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 py-2 sm:py-3 rounded-md text-xs sm:text-sm text-white flex items-center justify-center gap-1 transition-all duration-300 hover:shadow-lg hover:shadow-red-800/30 transform hover:translate-y-[-1px] group/buy"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/trade/${data.id}`, {
                  state: {
                    marketData: {
                      id: data.id,
                      name: data.question,
                      outcomes: { yes: `Yes`, no: `No` },
                      tags: data.tags,
                      endDate: TimeUtils.formatLocalDate(data.expiry_date),
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
              <span className="font-medium">Buy No</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="group-hover/buy:translate-y-0.5 transition-transform duration-300 hidden sm:inline-block"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Closed Market Button Area */}
      {hasBuyOptions && isMarketClosed && (
        <div className="px-3 sm:px-5 py-3 sm:py-4 bg-gradient-to-b from-transparent to-zinc-900/20">
          <div className="bg-zinc-800/50 rounded-lg py-3 text-center">
            <span className="text-zinc-500 text-sm font-medium">
              Trading Ended
            </span>
            <div className="text-xs text-zinc-600 mt-1">
              Closed {TimeUtils.getRelativeTime(data.expiry_date)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketCards;
