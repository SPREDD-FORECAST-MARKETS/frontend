import { Info } from 'lucide-react';
import  type { MarketData } from '../lib/interface';

interface MarketInfoCardProps {
  marketData: MarketData;
}

const MarketInfoCard = ({ marketData }: MarketInfoCardProps) => {
  const { category, creator, endDate, description } = marketData;
  
  return (
    <div className="border border-[#222] rounded-lg overflow-hidden bg-[#0d1117] p-5 shadow-lg">
      <div className="flex items-start justify-between mb-5 flex-col sm:flex-row gap-4">
        <div className="flex items-center gap-4">
          <div className="min-w-[56px] h-14 w-14 rounded-lg bg-orange-500 flex items-center justify-center">
            <span className="text-2xl font-bold text-black">{category.substring(0, 1)}</span>
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">{marketData.name}</h2>
            <div className="text-[#888] flex items-center text-sm mt-1 flex-wrap">
              <span>Created by {creator}</span>
              <span className="mx-2">•</span>
              <span>Ending: {endDate}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-[#171c21] px-3 py-2 rounded-md">
          <span className="text-[#888] text-sm">Probability:</span>
          <span className="text-white font-bold">{Math.round(marketData.probabilities.yes * 100)}%</span>
        </div>
      </div>
      <div className="text-[#ccc] space-y-3">
        <p className="leading-relaxed">{description}</p>
        <div className="flex items-center mt-4 text-sm text-[#888]">
          <Info size={16} className="mr-2 text-orange-500" />
          <span>This is a prediction market. Learn more about forecasting on our platform.</span>
        </div>
      </div>
    </div>
  );
};

export default MarketInfoCard;