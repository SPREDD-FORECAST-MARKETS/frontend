import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock } from "lucide-react";
import type { Market } from "../types/apis";

interface MarketCardsProps {
  data: Market[];
}

const MarketCards = ({ data }: MarketCardsProps) => {
  // const hasBuyOptions = data.some((card) => card.buyOptions !== undefined);
  const hasBuyOptions = true;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6 px-3 sm:px-5 md:px-6 mx-2 sm:mx-4 md:mx-6">
      {data.map((data, index) => (
        <EnhancedCard key={index} data={data} hasBuyOptions={hasBuyOptions} />
      ))}
    </div>
  );
};

// Separate component for each card to enable individual state management
const EnhancedCard = ({
  data,
  hasBuyOptions,
}: {
  data: Market;
  hasBuyOptions: boolean;
}) => {
  const [, setIsHovered] = useState(false);
  const navigate = useNavigate();
  // const optionsCount = data.options?.length || 0;
  const optionsCount = 2;
  const minContentHeight = Math.max(40 * optionsCount, 120);

  // Check if market is closed
  const isMarketClosed =
    new Date(data.expiry_date).getTime() <= new Date().getTime();

  // Format dates nicely
  const formatDate = (date: string | Date) => {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return dateObj.toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  // Calculate time until closing
  const getTimeUntilClosing = (closingDate: string) => {
    const now = new Date();
    const closing = new Date(closingDate);
    const diffTime = closing.getTime() - now.getTime();

    if (diffTime <= 0) return "Closed";

    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(
      (diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );

    if (diffDays > 0) {
      return `${diffDays}d ${diffHours}h left`;
    } else {
      const diffMinutes = Math.floor(
        (diffTime % (1000 * 60 * 60)) / (1000 * 60)
      );
      return `${diffHours}h ${diffMinutes}m left`;
    }
  };

  // Handle navigation with state
  const handleCardClick = (e: React.MouseEvent) => {
    e.preventDefault();

    // Transform MarketCard data into the expected MarketData format
    const marketData = {
      id: data.id,
      name: data.question,
      outcomes: {
        yes: `Yes`,
        no: `No`,
      },
      tags: data.tags,
      endDate: formatDate(data.expiry_date),
      creator: data.creator.username,
      description: data.description,
      iconUrl: data.image,
    };

    // Navigate programmatically with state
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
        <div className="absolute inset-0  backdrop-blur-sm z-10 flex flex-col items-center justify-center">
          <div className="rounded-xl  p-6 text-center">
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

          <div
            className={`flex items-center mt-1 bg-zinc-800/30 rounded-full pl-2 pr-3 py-1 transition-colors duration-300 ${
              !isMarketClosed ? "group-hover:bg-zinc-800/50" : ""
            }`}
          >
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
              {formatDate(data.expiry_date)}
              {!isMarketClosed && (
                <span className="ml-2 text-xs text-orange-400 font-medium hidden sm:inline">
                  ({getTimeUntilClosing(data.expiry_date.toString())})
                </span>
              )}
            </span>
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

        <span className="text-zinc-500 font-serif text-xs sm:text-sm truncate max-w-[110px] sm:max-w-none">
          Created {formatDate(data.createdAt)}
        </span>
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
                      outcomes: {
                        yes: `Yes`,
                        no: `No`,
                      },
                      tags: data.tags,
                      endDate: formatDate(data.expiry_date),
                      creator: data.creator.username,
                      description: data.description,
                      iconUrl: data.image,
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
                      outcomes: {
                        yes: `Yes`,
                        no: `No`,
                      },
                      tags: data.tags,
                      endDate: formatDate(data.expiry_date),
                      creator: data.creator.username,
                      description: data.description,
                      iconUrl: data.image,
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
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketCards;
