import type { Market } from '../lib/interface';
import { formatDateTime } from '../utils/helpers';

interface MarketInfoCardProps {
  marketData: Market;
}

const MarketInfoCard = ({ marketData }: MarketInfoCardProps) => {
  const { creator, createdAt, description, resolution_criteria, image, question } = marketData;

  return (
    <div className="border border-[#222] rounded-lg overflow-hidden bg-gradient-to-b from-[#111] to-[#0a0a0a] p-3 sm:p-4 md:p-5 shadow-lg">
      <div className="flex items-start justify-between mb-3 sm:mb-4 md:mb-5 flex-col sm:flex-row gap-3 sm:gap-4">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="min-w-[48px] sm:min-w-[56px] h-12 w-12 sm:h-14 sm:w-14 rounded-lg bg-gray-500 flex items-center justify-center">
            {/* <span className="text-xl sm:text-2xl font-bold text-black">{tags.length !== 0 && tags[0].substring(0, 1)}</span> */}
            <img src={image} alt={question} />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white line-clamp-1 sm:line-clamp-none">{marketData.question}</h2>
            <div className="text-[#888] flex items-center text-xs sm:text-sm mt-1 flex-wrap">
              <p className="line-clamp-1">Created by {creator.username}</p>
              <p>&nbsp;&nbsp;</p>
              <p className="line-clamp-1">Created On: {formatDateTime(createdAt)}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-[#171c21] px-2 sm:px-3 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm whitespace-nowrap">
          <span className="text-[#888]">Probability:</span>
          <span className="text-white font-bold">65%</span>
        </div>
      </div>
      <div className="text-[#ccc] space-y-2 sm:space-y-3">
        <p className='font-bold text-gray-400'>Description</p>
        <p className="leading-relaxed text-sm sm:text-base">{description}</p>
        <p className='pt-5 font-bold text-gray-400'>Resolution Criteria</p>
        <p className="leading-relaxed text-sm sm:text-base">{resolution_criteria}</p>
      </div>
    </div>
  );
};

export default MarketInfoCard;