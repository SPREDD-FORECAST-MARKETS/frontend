import type { Market } from '../lib/interface';
import { calculateOdds, calculateReturn } from '../utils/calculations';

interface TradingPanelProps {
  marketData: Market;
  isBuy: boolean;
  isYes: boolean;
  quantity: number;
  onBuySellToggle: (isBuy: boolean) => void;
  onYesNoToggle: (isYes: boolean) => void;
  onQuantityChange: (quantity: number) => void;
  onSubmit: () => void;
}

const TradingPanel = ({ 
  marketData, 
  isBuy, 
  isYes,
  quantity, 
  onBuySellToggle, 
  onYesNoToggle,
  onQuantityChange, 
  onSubmit
}: TradingPanelProps) => {
  
  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    onQuantityChange(!isNaN(value) && value >= 0 ? value : 0);
  };
  
  return (
    <div className="bg-[#0d1117] rounded-lg border border-[#222] overflow-hidden h-full shadow-lg">
      {/* Buy/Sell tabs */}
      <div className="grid grid-cols-2">
        <button 
          className={`py-4 text-center font-medium text-lg transition-all ${
            isBuy ? 'bg-green-600 text-white' : 'bg-[#0d1117] text-white hover:bg-[#171c21]'
          }`}
          onClick={() => onBuySellToggle(true)}
        >
          BUY
        </button>
        <button 
          className={`py-4 text-center font-medium text-lg transition-all ${
            !isBuy ? 'bg-red-600 text-white' : 'bg-[#0d1117] text-white hover:bg-[#171c21]'
          }`}
          onClick={() => onBuySellToggle(false)}
        >
          SELL
        </button>
      </div>

      {/* Outcome section */}
      <div className="p-5 border-b border-[#222]">
        <h3 className="text-lg font-medium mb-4 text-white">Outcome</h3>
        <div className="grid grid-cols-2 gap-4">
          <div 
            className={`p-4 rounded transition-all cursor-pointer ${
              isYes ? 'bg-[#132416] border border-green-900' : 'bg-[#171c21] hover:bg-[#1f2429]'
            }`}
            onClick={() => onYesNoToggle(true)}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-green-500 font-bold flex items-center">
                <span className="h-6 w-6 rounded-full bg-green-600 text-white flex items-center justify-center text-xs mr-2">Y</span>
                YES
              </span>
              <span className="text-[#ccc] font-medium">$2</span>
            </div>
          </div>
          <div 
            className={`p-4 rounded transition-all cursor-pointer ${
              !isYes ? 'bg-[#241313] border border-red-900' : 'bg-[#171c21] hover:bg-[#1f2429]'
            }`}
            onClick={() => onYesNoToggle(false)}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-red-500 font-bold flex items-center">
                <span className="h-6 w-6 rounded-full bg-red-600 text-white flex items-center justify-center text-xs mr-2">N</span>
                NO
              </span>
              <span className="text-[#ccc] font-medium">$3</span>
            </div>
          </div>
        </div>
      </div>

      {/* Amount input */}
      <div className="p-5 border-b border-[#222]">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-medium text-white">Forecast Amount (USDT)</h3>
          <div className="text-sm text-[#888]">Balance: $1,000</div>
        </div>
        <div className="relative">
          <input 
            type="number" 
            value={quantity} 
            onChange={handleQuantityChange}
            className="w-full bg-[#171c21] border border-[#333] rounded px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500"
            min="0" 
            step="0.01" 
          />
          <button 
            onClick={() => onQuantityChange(1000)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-[#888] bg-[#232830] px-2 py-1 rounded hover:bg-[#2c3136]"
          >
            MAX
          </button>
        </div>
        
        <div className="grid grid-cols-3 gap-3 mt-3">
          <button 
            onClick={() => onQuantityChange(0)}
            className="bg-[#171c21] text-[#ccc] py-2 rounded text-sm hover:bg-[#1f2429] transition-colors"
          >
            Reset
          </button>
          <button 
            onClick={() => onQuantityChange(10)}
            className="bg-[#171c21] text-[#ccc] py-2 rounded text-sm hover:bg-[#1f2429] transition-colors"
          >
            $10
          </button>
          <button 
            onClick={() => onQuantityChange(50)}
            className="bg-[#171c21] text-[#ccc] py-2 rounded text-sm hover:bg-[#1f2429] transition-colors"
          >
            $50
          </button>
        </div>
      </div>

      {/* Potential returns */}
      <div className="p-5 border-b border-[#222]">
        <div className="flex justify-between items-center">
          <span className="text-[#888]">Potential forecast points:</span>
          <span className="text-white font-medium">{calculateReturn(quantity, isBuy)} FP</span>
        </div>
        <div className="flex justify-between items-center mt-2">
          <span className="text-[#888]">Odds:</span>
          <span className="text-white font-medium">{calculateOdds(isBuy, marketData)}</span>
        </div>
      </div>

      {/* Submit button */}
      <div className="p-5">
        <button 
          className={`w-full ${
            isBuy ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
          } text-white font-bold py-3 px-4 rounded text-lg transition-all ${
            quantity <= 0 ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          onClick={onSubmit}
          disabled={quantity <= 0}
        >
          Place Forecast
        </button>
        
        <div className="mt-5 space-y-4">
          <div className="flex justify-between items-center text-sm">
            <span className="text-[#888]">Platform Fee</span>
            <span className="text-white">$0.00</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[#ccc]">Total Cost</span>
            <span className="text-white font-medium">$ {quantity.toFixed(2)}</span>
          </div>
          <div className="p-3 rounded bg-[#171c21]">
            <div className="flex flex-col">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[#ccc]">Forecast on:</span>
                <span className={`${isBuy ? 'text-green-500' : 'text-red-500'} font-bold`}>
                  {isBuy ? 'YES' : 'NO'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#ccc]">If correct:</span>
                <span className="text-green-500 font-bold">+{calculateReturn(quantity, isBuy)} FP</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradingPanel;
