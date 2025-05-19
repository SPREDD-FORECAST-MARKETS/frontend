import { useState } from "react";
import type { MarketCard } from "../lib/interface";

interface MarketCardsProps {
  data: MarketCard[];
}

const MarketCards = ({ data }: MarketCardsProps) => {
  const hasBuyOptions = data.some((card) => card.buyOptions !== undefined);
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6 m-[2rem]">
      {data.map((data, index) => (
        <EnhancedCard key={index} data={data} hasBuyOptions={hasBuyOptions} />
      ))}
    </div>
  );
};

// Separate component for each card to enable individual state management
const EnhancedCard = ({ data, hasBuyOptions }: { data: MarketCard, hasBuyOptions: boolean }) => {
  const [, setIsHovered] = useState(false);
  const optionsCount = data.options?.length || 0;
  const minContentHeight = Math.max(40 * optionsCount, 120);
  
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
    const diffHours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (diffDays > 0) {
      return `${diffDays}d ${diffHours}h left`;
    } else {
      const diffMinutes = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60));
      return `${diffHours}h ${diffMinutes}m left`;
    }
  };

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="bg-gradient-to-b from-[#111] to-[#0a0a0a] rounded-xl border border-zinc-800 overflow-hidden shadow-xl relative h-[370px] flex flex-col p-0 transition-all duration-500 hover:shadow-2xl hover:shadow-orange-900/10 hover:border-zinc-700 group"
    >
      {/* Enhanced gradient overlay with animation */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-900/5 via-transparent to-transparent pointer-events-none opacity-70 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      {/* Subtle corner glow effect */}
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-orange-500/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
      
      {/* Card Header with subtle animation */}
      <div className="p-5 pb-2 flex items-center gap-3 border-b border-zinc-800/20">
        <div className="w-10 h-10 rounded overflow-hidden bg-gradient-to-br from-zinc-800 to-black p-0.5 shadow-md shadow-black/20 group-hover:shadow-orange-900/20 transition-all duration-500">
          <img
            src={data.icon}
            alt={data.title}
            className="w-full h-full object-cover rounded-sm transform group-hover:scale-110 transition-transform duration-500"
          />
        </div>
        <h3 className="text-white font-serif font-bold text-xl flex-1 tracking-wide group-hover:text-orange-50 transition-colors duration-300">
          {data.title}
        </h3>
      </div>

      {/* Main content with improved typography and spacing */}
      <div
        className="px-5 pt-4 overflow-hidden flex-grow"
        style={{ minHeight: minContentHeight }}
      >
        <div className="flex flex-col gap-y-4 items-start rounded-lg">
          <p className="text-white font-serif text-xl leading-snug tracking-wide">
            {data.description}
          </p>
          
          {/* Closing time with improved visual cue */}
          <div className="flex items-center mt-1 bg-zinc-800/30 rounded-full pl-2 pr-3 py-1 group-hover:bg-zinc-800/50 transition-colors duration-300">
            <div className={`w-2 h-2 rounded-full mr-2 ${
              new Date(data.closingAt).getTime() - new Date().getTime() < 86400000 
                ? "bg-red-500 animate-pulse" 
                : "bg-green-500"
            }`}></div>
            <span className="text-zinc-300 text-sm">
              Closes: {formatDate(data.closingAt)}
              <span className="ml-2 text-xs text-orange-400 font-medium">
                ({getTimeUntilClosing(data.closingAt.toString())})
              </span>
            </span>
          </div>
        </div>
      </div>
      
      {/* Creator info with enhanced styling */}
      <div className="flex justify-between items-center p-5 bg-gradient-to-r from-zinc-900/30 to-zinc-800/20">
        <div className="flex items-center group/creator">
          <span className="text-orange-400 font-bold text-md group-hover/creator:text-orange-300 transition-colors duration-300 underline decoration-orange-500/30 underline-offset-2 decoration-1">
            {data.creatorName}
          </span>
          <span className="ml-2 px-2 py-0.5 bg-orange-500/10 rounded-full text-xs text-zinc-400 opacity-0 group-hover/creator:opacity-100 transition-all duration-300 transform translate-x-[-10px] group-hover/creator:translate-x-0">
            Creator
          </span>
        </div>

        <span className="text-zinc-500 font-serif text-sm">
          Created {formatDate(data.createdAt)}
        </span>
      </div>
      
      {/* Buy buttons with enhanced animations */}
      <div className="px-5 py-4 bg-gradient-to-b from-transparent to-zinc-900/20">
        {hasBuyOptions && (
          <div className="grid grid-cols-2 gap-3">
            <button className="bg-gradient-to-br from-green-600 to-green-800 hover:from-green-500 hover:to-green-700 py-3 rounded-md text-sm text-white flex items-center justify-center gap-1 transition-all duration-300 hover:shadow-lg hover:shadow-green-800/30 transform hover:translate-y-[-1px] group/buy">
              <span className="font-medium">Buy Yes</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
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
            <button className="bg-gradient-to-br from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 py-3 rounded-md text-sm text-white flex items-center justify-center gap-1 transition-all duration-300 hover:shadow-lg hover:shadow-red-800/30 transform hover:translate-y-[-1px] group/buy">
              <span className="font-medium">Buy No</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
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
        )}
      </div>

      {/* Card Footer with improved interaction */}
      <div className="px-5 py-3 flex justify-between items-center border-t border-zinc-800/40 bg-black/30">
        <span className="text-white text-xs font-medium bg-zinc-800/50 px-2 py-1 rounded-full">
          {data.volume}
        </span>
        
        {data.timeframe && (
          <span className="text-zinc-500 text-xs flex items-center gap-1 bg-zinc-800/30 px-2 py-1 rounded-full">
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
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            {data.timeframe}
          </span>
        )}
        
        <div className="flex gap-3">
          <button className="text-zinc-500 hover:text-orange-500 transition-colors hover:scale-110 duration-300 p-1.5 rounded-full hover:bg-zinc-800/40">
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
            >
              <path d="M3 3h18v18H3zM8 12h8" />
            </svg>
          </button>
          <button className="text-zinc-500 hover:text-orange-500 transition-colors hover:scale-110 duration-300 p-1.5 rounded-full hover:bg-zinc-800/40">
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
            >
              <path d="m19 21-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MarketCards;