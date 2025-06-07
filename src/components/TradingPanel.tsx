import { useReadContract, useWriteContract } from 'wagmi';
import type { Market } from '../lib/interface';
import { calculateReturn } from '../utils/calculations';
import { MARKET_ABI } from '../abi/MarketABI';
import { formatUnits, parseUnits } from 'viem';
import { useEffect, useState } from 'react';
import { useAtom } from 'jotai';
import { balanceAtom } from '../atoms/user';
import { usePrivy } from '@privy-io/react-auth';
import { useUsdtToken } from '../hooks/useToken';
import { CONTRACT_ADDRESSES } from '../utils/wagmiConfig';
import { useToast } from '../hooks/useToast';

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

  const [priceYes, setPriceYes] = useState(0.0);
  const [priceNo, setPriceNo] = useState(0.0);
  const [userSharesYes, setUserShareYes] = useState(0);
  const [userSharesNo, setUserShareNo] = useState(0);
  const [totalShares, setTotalShares] = useState(0.0);
  const [balanceLow, setBalanceLow] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [transactionHash, setTransactionHash] = useState<string | null>(null);
  const [transactionType, setTransactionType] = useState<'buy' | 'sell' | null>(null);

  const [userBalance,] = useAtom(balanceAtom);
  const { user } = usePrivy();
  const { writeContractAsync, isSuccess, isError } = useWriteContract();
  const { approve } = useUsdtToken();
  const toast = useToast();

  const { data } = useReadContract({
    address: marketData.contract_address as `0x${string}`,
    abi: MARKET_ABI,
    functionName: "getCurrentPrices",
    args: [],
  }) as { data: [bigint, bigint] }

  const { data: sharesData } = useReadContract({
    address: marketData.contract_address as `0x${string}`,
    abi: MARKET_ABI,
    functionName: "getUserBalances",
    args: [user?.wallet?.address],
  }) as { data: [bigint, bigint, bigint] }

  // Handle transaction success/failure with useEffect
  useEffect(() => {
    if (transactionHash && isSuccess && transactionType) {
      if (transactionType === 'buy') {
        toast.success("Buy order successful!");
      } else {
        toast.success("Sell order successful!");
      }
      
      // Call the original onSubmit callback for any additional handling
      onSubmit();
      
      // Reset form
      onQuantityChange(0);
      
      // Reset transaction state
      setTransactionHash(null);
      setTransactionType(null);
      setIsSubmitting(false);
    }
  }, [isSuccess, transactionHash, transactionType, toast, onSubmit, onQuantityChange]);

  useEffect(() => {
    if (transactionHash && isError && transactionType) {
      if (transactionType === 'buy') {
        toast.error("Failed to buy shares.");
      } else {
        toast.error("Failed to sell shares.");
      }
      
      // Reset transaction state
      setTransactionHash(null);
      setTransactionType(null);
      setIsSubmitting(false);
    }
  }, [isError, transactionHash, transactionType, toast]);

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    onQuantityChange(!isNaN(value) && value >= 0 ? value : 0);
  };

  const handleMaxClick = () => {
    if (isBuy) {
      // When buying, use user's balance
      onQuantityChange(parseFloat(formatUnits(userBalance?.value!, userBalance?.decimals!)));
    } else {
      // When selling, use user's shares for the selected outcome
      const maxShares = isYes ? userSharesYes : userSharesNo;
      onQuantityChange(maxShares);
    }
  };

  const handleSubmit = async () => {
    if (quantity <= 0 || balanceLow || isSubmitting) return;

    setIsSubmitting(true);

    try {
      if (isBuy) {
        // Buy tokens
        const amountIn = parseUnits(quantity.toString(), 6); // Assuming USDT has 6 decimals
        const minTokensOut = BigInt(Math.floor(totalShares * 0.95)); // 5% slippage tolerance
        
        // Approve first (no toast here)
        await approve({
          tokenAddress: CONTRACT_ADDRESSES.token as `0x${string}`,
          spender: marketData.contract_address as `0x${string}`,
          usdAmount: quantity,
          decimals: 6,
        });
        
        // Then execute buy transaction
        const result = await writeContractAsync({
          address: marketData.contract_address as `0x${string}`,
          abi: MARKET_ABI,
          functionName: 'buyTokens',
          args: [
            isYes, // _buyOptionA (true for YES, false for NO)
            amountIn, // _amount
            minTokensOut // _minTokensOut
          ]
        });

        // Set transaction details for useEffect to handle
        setTransactionHash(result);
        setTransactionType('buy');

      } else {
        // Sell tokens
        const tokensIn = BigInt(quantity); // quantity is already in shares
        
        const result = await writeContractAsync({
          address: marketData.contract_address as `0x${string}`,
          abi: MARKET_ABI,
          functionName: 'sellTokens',
          args: [
            isYes, // _sellOptionA (true for YES, false for NO)
            tokensIn, // _tokensIn
            1 // _minAmountOut
          ]
        });
        
        // Set transaction details for useEffect to handle
        setTransactionHash(result);
        setTransactionType('sell');
      }

    } catch (error) {
      console.error('Transaction failed:', error);
      toast.error('Transaction failed. Please try again.');
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (data === undefined) return;
    setPriceYes(parseFloat(formatUnits(BigInt(data[0]), 6)));
    setPriceNo(parseFloat(formatUnits(BigInt(data[1]), 6)));
  }, [data])

  useEffect(() => {
    if (sharesData === undefined) return;
    setUserShareYes(parseInt(sharesData[0].toString()));
    setUserShareNo(parseInt(sharesData[1].toString()));
  }, [sharesData])

  useEffect(() => {
    if (isBuy) {
      if (isYes) setTotalShares(quantity / priceYes);
      else setTotalShares(quantity / priceNo);
    } else {
      // When selling, quantity represents shares directly
      setTotalShares(quantity);
    }
  }, [priceNo, priceYes, quantity, isBuy, isYes])

  useEffect(() => {
    if (isBuy) {
      // When buying, check if user has enough balance
      if (parseFloat(formatUnits(userBalance?.value!, userBalance?.decimals!)) < Number(quantity)) {
        setBalanceLow(true);
      } else {
        setBalanceLow(false);
      }
    } else {
      // When selling, check if user has enough shares
      const maxShares = isYes ? userSharesYes : userSharesNo;
      if (maxShares < quantity) {
        setBalanceLow(true);
      } else {
        setBalanceLow(false);
      }
    }
  }, [quantity, isBuy, isYes, userSharesYes, userSharesNo, userBalance])

  return (
    <div className="bg-[#0d1117] rounded-lg border border-[#222] overflow-hidden h-full shadow-lg">
      {/* Buy/Sell tabs */}
      <div className="grid grid-cols-2">
        <button
          className={`py-4 text-center font-medium text-lg transition-all ${isBuy ? 'bg-green-600 text-white' : 'bg-[#0d1117] text-white hover:bg-[#171c21]'
            }`}
          onClick={() => onBuySellToggle(true)}
        >
          BUY
        </button>
        <button
          className={`py-4 text-center font-medium text-lg transition-all ${!isBuy ? 'bg-red-600 text-white' : 'bg-[#0d1117] text-white hover:bg-[#171c21]'
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
            className={`p-4 rounded transition-all cursor-pointer ${isYes ? 'bg-[#132416] border border-green-900' : 'bg-[#171c21] hover:bg-[#1f2429]'
              }`}
            onClick={() => onYesNoToggle(true)}
          >
            <div className="flex flex-col items-center text-center">
              <div className="flex items-center mb-2">
                <span className="h-6 w-6 rounded-full bg-green-600 text-white flex items-center justify-center text-xs mr-2">Y</span>
                <span className="text-green-500 font-bold">YES</span>
              </div>
              <span className="text-[#ccc] font-medium text-sm">
                {isBuy ? (
                  `${priceYes.toFixed(2)}`
                ) : (
                  <span className="flex items-center">
                    <span className="text-xs mr-1">S</span>
                    {userSharesYes > 999999 ? `${(userSharesYes / 1000000).toFixed(1)}M` :
                      userSharesYes > 9999 ? `${(userSharesYes / 1000).toFixed(1)}K` :
                        userSharesYes.toString()}
                  </span>
                )}
              </span>
            </div>
          </div>
          <div
            className={`p-4 rounded transition-all cursor-pointer ${!isYes ? 'bg-[#241313] border border-red-900' : 'bg-[#171c21] hover:bg-[#1f2429]'
              }`}
            onClick={() => onYesNoToggle(false)}
          >
            <div className="flex flex-col items-center text-center">
              <div className="flex items-center mb-2">
                <span className="h-6 w-6 rounded-full bg-red-600 text-white flex items-center justify-center text-xs mr-2">N</span>
                <span className="text-red-500 font-bold">NO</span>
              </div>
              <span className="text-[#ccc] font-medium text-sm">
                {isBuy ? (
                  `${priceNo.toFixed(2)}`
                ) : (
                  <span className="flex items-center">
                    <span className="text-xs mr-1">S</span>
                    {userSharesNo > 999999 ? `${(userSharesNo / 1000000).toFixed(1)}M` :
                      userSharesNo > 9999 ? `${(userSharesNo / 1000).toFixed(1)}K` :
                        userSharesNo.toString()}
                  </span>
                )}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Amount input */}
      <div className="p-5 border-b border-[#222]">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-medium text-white">
            {isBuy ? 'Forecast Amount (USDT)' : 'Shares to Sell'}
          </h3>
        </div>
        <div className="relative">
          <input
            type="number"
            value={quantity}
            onChange={handleQuantityChange}
            className="w-full bg-[#171c21] border border-[#333] rounded px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500"
            min="0"
            step={isBuy ? "0.01" : "1"}
          />
          <button
            onClick={handleMaxClick}
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
            onClick={() => onQuantityChange(isBuy ? 10 : 10)}
            className="bg-[#171c21] text-[#ccc] py-2 rounded text-sm hover:bg-[#1f2429] transition-colors"
          >
            {isBuy ? '$10' : '10 Shares'}
          </button>
          <button
            onClick={() => onQuantityChange(isBuy ? 50 : 50)}
            className="bg-[#171c21] text-[#ccc] py-2 rounded text-sm hover:bg-[#1f2429] transition-colors"
          >
            {isBuy ? '$50' : '50 Shares'}
          </button>
        </div>
      </div>

      {/* Potential returns */}
      <div className="p-5 border-b border-[#222]">
        <div className="flex justify-between items-center">
          <span className="text-[#888]">
            {isBuy ? 'Potential forecast points:' : 'Potential returns:'}
          </span>
          <span className="text-white font-medium">
            {isBuy ? `${calculateReturn(quantity, isBuy)} FP` : `$${(quantity * (isYes ? priceYes : priceNo)).toFixed(2)}`}
          </span>
        </div>
        <div className="flex justify-between items-center mt-2">
          <span className="text-[#888]">
            {isBuy ? 'Total Shares' : 'Shares to Sell'}
          </span>
          <span className="text-white font-medium">
            {totalShares.toFixed(0)} {isYes ? "YES" : "NO"}
          </span>
        </div>
      </div>

      {/* Submit button */}
      <div className="p-5">
        <button
          className={`w-full ${isBuy ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
            } text-white font-bold py-3 px-4 rounded text-lg transition-all ${quantity <= 0 || balanceLow || isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          onClick={handleSubmit}
          disabled={quantity <= 0 || balanceLow || isSubmitting}
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Processing...
            </div>
          ) : (
            'Place Forecast'
          )}
        </button>
      </div>

      {balanceLow && (
        <p className='text-center text-red-500 mt-5'>
          {isBuy ? 'Low Balance, please add funds.' : 'Insufficient shares to sell.'}
        </p>
      )}
    </div>
  );
};

export default TradingPanel;