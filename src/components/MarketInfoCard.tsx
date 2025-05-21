import { Info } from 'lucide-react';
import type { MarketData } from '../lib/interface';

interface MarketInfoCardProps {
  marketData: MarketData;
}

const MarketInfoCard = ({ marketData }: MarketInfoCardProps) => {
  const { category, creator, endDate, description } = marketData;
  
  return (
    <div className="border border-[#222] rounded-lg overflow-hidden bg-[#0d1117] p-3 sm:p-4 md:p-5 shadow-lg">
      <div className="flex items-start justify-between mb-3 sm:mb-4 md:mb-5 flex-col sm:flex-row gap-3 sm:gap-4">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="min-w-[48px] sm:min-w-[56px] h-12 w-12 sm:h-14 sm:w-14 rounded-lg bg-orange-500 flex items-center justify-center">
            <span className="text-xl sm:text-2xl font-bold text-black">{category.substring(0, 1)}</span>
          </div>
          <div>
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white line-clamp-1 sm:line-clamp-none">{marketData.name}</h2>
            <div className="text-[#888] flex items-center text-xs sm:text-sm mt-1 flex-wrap">
              <span className="line-clamp-1">Created by {creator}</span>
              <span className="mx-1 sm:mx-2 hidden xs:inline">•</span>
              <span className="line-clamp-1">Ending: {endDate}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-[#171c21] px-2 sm:px-3 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm whitespace-nowrap">
          <span className="text-[#888]">Probability:</span>
          <span className="text-white font-bold">{Math.round(marketData.probabilities.yes * 100)}%</span>
        </div>
      </div>
      <div className="text-[#ccc] space-y-2 sm:space-y-3">
        <p className="leading-relaxed text-sm sm:text-base">{description}</p>
        <div className="flex items-start sm:items-center mt-3 sm:mt-4 text-xs sm:text-sm text-[#888]">
          <Info size={14} className="mr-1.5 sm:mr-2 text-orange-500 mt-0.5 sm:mt-0 flex-shrink-0" />
          <span>This is a prediction market. Learn more about forecasting on our platform.</span>
        </div>
      </div>
    </div>
  );
};

export default MarketInfoCard;