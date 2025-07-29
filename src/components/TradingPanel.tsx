import { useReadContract, useWriteContract } from "wagmi";
import type { Market } from "../lib/interface";
import { MARKET_ABI } from "../abi/MarketABI";
import { formatUnits, parseUnits } from "viem";
import { useEffect, useState } from "react";
import { useAtom } from "jotai";
import { balanceAtom } from "../atoms/user";
import { usePrivy } from "@privy-io/react-auth";
import { useUsdtToken } from "../hooks/useToken";
import { CONTRACT_ADDRESSES } from "../utils/wagmiConfig";
import { useToast } from "../hooks/useToast";
import { createOrUpdateTokenAllocation, createTrade } from "../apis/trade";

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
  onYesNoToggle,
  onQuantityChange,
  onSubmit,
}: TradingPanelProps) => {
  const [oddsA, setOddsA] = useState(50); // Default 50% odds
  const [oddsB, setOddsB] = useState(50);
  const [totalVolume, setTotalVolume] = useState(0);
  const [userBetA, setUserBetA] = useState(0);
  const [userBetB, setUserBetB] = useState(0);
  const [, setUserClaimed] = useState(false);
  const [balanceLow, setBalanceLow] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [transactionHash, setTransactionHash] = useState<string | null>(null);
  const [potentialWinnings, setPotentialWinnings] = useState(0);

  const [userBalance] = useAtom(balanceAtom);
  const { user, getAccessToken } = usePrivy();
  const { writeContractAsync, isSuccess, isError } = useWriteContract();
  const { approve } = useUsdtToken();
  const toast = useToast();

  // Get market odds from contract
  const { data: oddsData, refetch: refetchOdds } = useReadContract({
    address: marketData.contract_address as `0x${string}`,
    abi: MARKET_ABI,
    functionName: "getMarketOdds",
    args: [],
  }) as { data: readonly [bigint, bigint, bigint] | undefined; refetch: () => void };

  // Get user's current bets
  const { data: userBetData, refetch: refetchUserBets } = useReadContract({
    address: marketData.contract_address as `0x${string}`,
    abi: MARKET_ABI,
    functionName: "getUserBet",
    args: user?.wallet?.address ? [user.wallet.address as `0x${string}`] : undefined,
  }) as { data: readonly [bigint, bigint, boolean, bigint] | undefined; refetch: () => void };

  // Calculate potential winnings
  const { data: potentialWinningsData } = useReadContract({
    address: marketData.contract_address as `0x${string}`,
    abi: MARKET_ABI,
    functionName: "calculatePotentialWinnings",
    args: quantity > 0 ? [isYes, parseUnits(quantity.toString(), 6)] : undefined,
    query: {
      enabled: quantity > 0,
    },
  }) as { data: readonly [bigint, bigint] | undefined; refetch: () => void };

  // Handle transaction success/failure
  useEffect(() => {
    if (transactionHash && isSuccess) {
      toast.success("Bet placed successfully!");
      onSubmit();
      onQuantityChange(0);
      setTransactionHash(null);
      setIsSubmitting(false);

      // Refetch all data
      refetchOdds();
      refetchUserBets();
    }
  }, [isSuccess, transactionHash, toast, onSubmit, onQuantityChange, refetchOdds, refetchUserBets]);

  useEffect(() => {
    if (transactionHash && isError) {
      toast.error("Failed to place bet.");
      setTransactionHash(null);
      setIsSubmitting(false);
    }
  }, [isError, transactionHash, toast]);

  // Update odds data
  useEffect(() => {
    if (oddsData) {
      const [oddsAValue, oddsBValue, totalVolumeValue] = oddsData;
      
      // Convert odds to percentages (assuming odds are in basis points or similar)
      const totalOdds = Number(oddsAValue) + Number(oddsBValue);
      if (totalOdds > 0) {
        setOddsA(Math.round((Number(oddsAValue) / totalOdds) * 100));
        setOddsB(Math.round((Number(oddsBValue) / totalOdds) * 100));
      }
      
      setTotalVolume(Number(formatUnits(totalVolumeValue, 6)));
    }
  }, [oddsData]);

  // Update user bet data
  useEffect(() => {
    if (userBetData) {
      const [amountA, amountB, claimed] = userBetData;
      setUserBetA(Number(formatUnits(amountA, 6)));
      setUserBetB(Number(formatUnits(amountB, 6)));
      setUserClaimed(claimed);
    }
  }, [userBetData]);

  // Update potential winnings
  useEffect(() => {
    if (potentialWinningsData && isBuy) {
      const [winnings] = potentialWinningsData;
      setPotentialWinnings(Number(formatUnits(winnings, 6)));
    } else if (!isBuy) {
      // For selling, calculate based on current position
      const currentBet = isYes ? userBetA : userBetB;
      const sellPercentage = currentBet > 0 ? Math.min(quantity / currentBet, 1) : 0;
      setPotentialWinnings(quantity * sellPercentage);
    }
  }, [potentialWinningsData, isBuy, quantity, isYes, userBetA, userBetB]);

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    onQuantityChange(!isNaN(value) && value >= 0 ? value : 0);
  };

  const handleMaxClick = () => {
    if (isBuy) {
      // When buying, use user's balance
      onQuantityChange(
        userBalance?.value && userBalance?.decimals
          ? parseFloat(formatUnits(userBalance.value, userBalance.decimals))
          : 0
      );
    } else {
      // When selling, use user's current bet amount for the selected outcome
      const maxAmount = isYes ? userBetA : userBetB;
      onQuantityChange(maxAmount);
    }
  };

  const handleSubmit = async () => {
    if (quantity <= 0 || balanceLow || isSubmitting) return;

    setIsSubmitting(true);

    try {
      if (isBuy) {
        // Place a new bet
        const betAmount = parseUnits(quantity.toString(), 6);

        // Approve USDT spending first
        await approve({
          tokenAddress: CONTRACT_ADDRESSES.token as `0x${string}`,
          spender: marketData.contract_address as `0x${string}`,
          usdAmount: quantity,
          decimals: 6,
        });

        // Place the bet using the placeBet function
        const txHash = await writeContractAsync({
          address: marketData.contract_address as `0x${string}`,
          abi: MARKET_ABI,
          functionName: "placeBet",
          args: [
            isYes, // _betOnA: true for YES/Option A, false for NO/Option B
            betAmount, // _amount: bet amount in wei
          ],
        });

        setTransactionHash(txHash);

        // Call APIs for successful bet
        const authToken = await getAccessToken();
        
        await createTrade(authToken!, {
          order_type: "BUY",
          order_size: quantity,
          amount: quantity,
          afterPrice: isYes ? (oddsA / 100) : (oddsB / 100),
          marketID: marketData.id,
          outcomeId: isYes
            ? marketData.outcome[0].id
            : marketData.outcome[1].id,
        });

        const newTotalBet = (isYes ? userBetA : userBetB) + quantity;
        await createOrUpdateTokenAllocation(authToken!, {
          amount: newTotalBet,
          outcomeId: isYes
            ? marketData.outcome[0].id
            : marketData.outcome[1].id,
        });

      } else {
        // For selling, we would need a different function
        // Since the current ABI doesn't have a sell function, 
        // we'll show an error for now
        toast.error("Selling functionality not available in current contract");
        setIsSubmitting(false);
        return;
      }

    } catch (error) {
      setIsSubmitting(false);
      
      const errorMessage =
        error instanceof Error ? error.message.toLowerCase() : "unknown error";

      if (errorMessage.includes("insufficient")) {
        toast.error("Insufficient balance. Please check your funds.");
      } else if (errorMessage.includes("user rejected") || errorMessage.includes("denied")) {
        toast.error("Transaction was cancelled.");
      } else if (errorMessage.includes("market") && errorMessage.includes("ended")) {
        toast.error("This market has already ended.");
      } else {
        toast.error("Transaction failed. Please try again.");
      }
    }
  };

  // Check if user has sufficient balance
  useEffect(() => {
    if (isBuy) {
      const availableBalance = userBalance?.value 
        ? parseFloat(formatUnits(userBalance.value, userBalance.decimals!))
        : 0;
      setBalanceLow(availableBalance < quantity);
    } else {
      // For selling, check if user has enough bet amount
      const maxSellAmount = isYes ? userBetA : userBetB;
      setBalanceLow(maxSellAmount < quantity);
    }
  }, [quantity, isBuy, isYes, userBetA, userBetB, userBalance]);

  // Get current price based on odds
  const getCurrentPrice = (forYes: boolean) => {
    return forYes ? (oddsA / 100) : (oddsB / 100);
  };

  return (
    <div className="bg-gradient-to-b from-[#111] to-[#0a0a0a] rounded-2xl border border-zinc-800 overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300">
      {/* Panel Header */}
      <div className="bg-transparent px-6 py-4 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center shadow-md">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Trading Panel</h2>
            <p className="text-sm text-zinc-400">Place your bet</p>
          </div>
        </div>
      </div>

      {/* Buy/Sell Toggle */}
      <div className="p-6 border-b border-zinc-800">
          <button
            className={`py-3 px-4 rounded-md font-medium transition-all duration-200 w-full ${
              isBuy
                ? "bg-green-500 text-white shadow-lg transform scale-105"
                : "text-zinc-400 hover:text-white hover:bg-zinc-700"
            }`}
          >
            BET
          </button>
      </div>

      {/* Outcome Selection */}
      <div className="p-6 border-b border-zinc-800">
        <h3 className="text-sm font-medium text-zinc-400 mb-4">Choose Outcome</h3>
        <div className="grid grid-cols-2 gap-3">
          <button
            className={`p-4 rounded-xl transition-all duration-200 border-2 ${
              isYes
                ? "bg-green-500/10 border-green-500 shadow-lg shadow-green-500/20"
                : "bg-zinc-900 border-zinc-800 hover:border-green-500/50"
            }`}
            onClick={() => onYesNoToggle(true)}
          >
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">Y</span>
                </div>
                <span className="text-green-500 font-bold text-sm">YES</span>
              </div>
              <div className="text-white font-medium">
                <div>${getCurrentPrice(true).toFixed(2)}</div>
                <div className="text-xs text-zinc-400">{oddsA}% odds</div>
                {userBetA > 0 && (
                  <div className="text-xs text-green-400 mt-1">
                    Your bet: ${userBetA.toFixed(2)}
                  </div>
                )}
              </div>
            </div>
          </button>

          <button
            className={`p-4 rounded-xl transition-all duration-200 border-2 ${
              !isYes
                ? "bg-red-500/10 border-red-500 shadow-lg shadow-red-500/20"
                : "bg-zinc-900 border-zinc-800 hover:border-red-500/50"
            }`}
            onClick={() => onYesNoToggle(false)}
          >
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">N</span>
                </div>
                <span className="text-red-500 font-bold text-sm">NO</span>
              </div>
              <div className="text-white font-medium">
                <div>${getCurrentPrice(false).toFixed(2)}</div>
                <div className="text-xs text-zinc-400">{oddsB}% odds</div>
                {userBetB > 0 && (
                  <div className="text-xs text-red-400 mt-1">
                    Your bet: ${userBetB.toFixed(2)}
                  </div>
                )}
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Amount Input */}
      <div className="p-6 border-b border-zinc-800">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-medium text-zinc-400">Bet Amount (USDT)</h3>
          <span className="text-xs text-zinc-500">
            Available: $
            {userBalance?.value 
              ? formatUnits(userBalance.value, userBalance.decimals!) 
              : "0"}
          </span>
        </div>

        <div className="relative">
          <input
            type="number"
            value={quantity}
            onChange={handleQuantityChange}
            className="w-full bg-zinc-900 border-2 border-zinc-800 rounded-xl px-4 py-4 text-white text-lg font-medium focus:outline-none focus:border-orange-500 transition-colors"
            placeholder="0"
            min="0"
            step="0.01"
          />
          <button
            onClick={handleMaxClick}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-xs text-orange-500 bg-orange-500/10 px-3 py-1 rounded-md hover:bg-orange-500/20 transition-colors font-medium"
          >
            MAX
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2 mt-4">
          <button
            onClick={() => onQuantityChange(0)}
            className="bg-zinc-900 border border-zinc-800 text-zinc-400 py-2 rounded-lg text-sm hover:bg-zinc-800 hover:text-white transition-colors"
          >
            Reset
          </button>
          <button
            onClick={() => onQuantityChange(10)}
            className="bg-zinc-900 border border-zinc-800 text-zinc-400 py-2 rounded-lg text-sm hover:bg-zinc-800 hover:text-white transition-colors"
          >
            $10
          </button>
          <button
            onClick={() => onQuantityChange(50)}
            className="bg-zinc-900 border border-zinc-800 text-zinc-400 py-2 rounded-lg text-sm hover:bg-zinc-800 hover:text-white transition-colors"
          >
            $50
          </button>
        </div>
      </div>

      {/* Trade Summary */}
      <div className="p-6 border-b border-zinc-800 bg-zinc-900/50">
        <h3 className="text-sm font-medium text-zinc-400 mb-4">Bet Summary</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-zinc-400">Potential Winnings:</span>
            <span className="text-white font-medium">
              ${potentialWinnings.toFixed(2)}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-zinc-400">Betting on:</span>
            <span className="text-white font-medium">
              {isYes ? "YES" : "NO"}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-zinc-400">Current Odds:</span>
            <span className="text-white font-medium">
              {isYes ? oddsA : oddsB}%
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-zinc-400">Total Volume:</span>
            <span className="text-white font-medium">
              ${totalVolume.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Submit button */}
      <div className="p-5">
        <button
          className={`w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-4 rounded text-lg transition-all ${
            quantity <= 0 || balanceLow || isSubmitting ? "opacity-50 cursor-not-allowed" : ""
          }`}
          onClick={handleSubmit}
          disabled={quantity <= 0 || balanceLow || isSubmitting}
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Placing Bet...
            </div>
          ) : (
            `Place $${quantity} Bet`
          )}
        </button>
      </div>

      {balanceLow && (
        <p className="text-center text-red-500 mt-5 px-5 pb-5">
          Insufficient balance. Please add funds.
        </p>
      )}
    </div>
  );
};

export default TradingPanel;