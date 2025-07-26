import type { Market } from '../lib/interface';
import { formatDateTime } from '../utils/helpers';

interface MarketInfoCardProps {
  marketData: Market;
}

const MarketInfoCard = ({ marketData }: MarketInfoCardProps) => {
  const { creator, createdAt, description, resolution_criteria, image, question } = marketData;

  return (
    <div className="border border-[#222] rounded-lg overflow-hidden bg-gradient-to-b from-[#111] to-[#0a0a0a] shadow-lg h-full flex flex-col">
      <div className="flex items-start justify-between p-3 sm:p-4 flex-col sm:flex-row gap-3 sm:gap-4">
        <div className="flex items-center gap-3">
          <div className="min-w-[40px] h-10 w-10 rounded-lg bg-gray-500 flex items-center justify-center">
            <img src={image} alt={question} />
          </div>
          <div className="flex-1">
            <h2 className="text-base sm:text-lg font-bold text-white line-clamp-2">{marketData.question}</h2>
            <div className="text-[#888] text-xs mt-1 flex flex-wrap gap-1">
              <span>Created by {creator.username}</span>
              <span>•</span>
              <span>{formatDateTime(createdAt)}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-[#171c21] px-2 py-1 rounded-md text-xs whitespace-nowrap">
          <span className="text-[#888]">Probability:</span>
          <span className="text-white font-bold">65%</span>
        </div>
      </div>
      
      <div className="px-3 sm:px-4 pb-3 sm:pb-4 flex-1 overflow-y-auto">
        <div className="text-[#ccc] space-y-3">
          <div>
            <p className='font-bold text-gray-400 text-sm mb-1'>Description</p>
            <p className="leading-relaxed text-xs sm:text-sm">{description}</p>
          </div>
          <div>
            <p className='font-bold text-gray-400 text-sm mb-1'>Resolution Criteria</p>
            <p className="leading-relaxed text-xs sm:text-sm">{resolution_criteria}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketInfoCard;