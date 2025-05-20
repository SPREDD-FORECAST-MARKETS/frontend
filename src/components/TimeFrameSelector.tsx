import { RefreshCw, Settings } from 'lucide-react';
import type { TimeframeOption } from '../lib/interface';

interface TimeframeSelectorProps {
  activeTimeframe: TimeframeOption;
  onTimeframeChange: (timeframe: TimeframeOption) => void;
  onRefresh: () => void;
  isLoading: boolean;
}

const TimeframeSelector = ({ 
  activeTimeframe, 
  onTimeframeChange, 
  onRefresh, 
  isLoading 
}: TimeframeSelectorProps) => {
  const timeframes: TimeframeOption[] = ['1H', '6H', '1D', '1W', '1M', '6M'];
  
  return (
    <div className="flex items-center gap-1 w-full sm:w-auto">
      <div className="flex bg-[#171c21] rounded-md p-1 flex-1 sm:flex-auto">
        {timeframes.map(tf => (
          <button
            key={tf}
            className={`px-3 py-1.5 text-sm rounded transition-all flex-1 ${
              activeTimeframe === tf ? 'bg-[#2c3136] text-white' : 'text-[#888] hover:text-[#bbb] hover:bg-[#1f2429]'
            }`}
            onClick={() => onTimeframeChange(tf)}
          >
            {tf}
          </button>
        ))}
      </div>
      <button 
        onClick={onRefresh} 
        disabled={isLoading}
        className="p-2 text-[#888] hover:text-white rounded-md hover:bg-[#1f2429] transition-colors"
      >
        <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
      </button>
      <button className="p-2 text-[#888] hover:text-white rounded-md hover:bg-[#1f2429] transition-colors">
        <Settings size={16} />
      </button>
    </div>
  );
};

export default TimeframeSelector;
