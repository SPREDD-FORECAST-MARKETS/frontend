import { useReadContract, useWriteContract } from "wagmi";
import type { Market } from "../lib/interface";
import { MARKET_ABI } from "../abi/MarketABI";
import { formatUnits, parseUnits } from "viem";
import { useEffect, useState } from "react";
import { useAtom } from "jotai";
import { balanceAtom } from "../atoms/global";
import { usePrivy } from "@privy-io/react-auth";
import { useUsdcToken } from "../hooks/useToken";
import { useToast } from "../hooks/useToast";
import { createOrUpdateTokenAllocation, createTrade } from "../apis/trade";

interface TradingPanelProps {
  marketData: Market;
  isBuy: boolean;
  isYes: boolean;
  quantity: number;
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
  const [oddsA, setOddsA] = useState(50);
  const [oddsB, setOddsB] = useState(50);
  const [, setTotalVolume] = useState(0);
  const [userBetA, setUserBetA] = useState(0);
  const [userBetB, setUserBetB] = useState(0);
  const [balanceLow, setBalanceLow] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [transactionHash, setTransactionHash] = useState<string | null>(null);
  const [, setPotentialWinnings] = useState(0);

  const [userBalance] = useAtom(balanceAtom);
  const { user, getAccessToken } = usePrivy();
  const { writeContractAsync, isSuccess, isError } = useWriteContract();
  const { approve } = useUsdcToken();
  const toast = useToast();


  const { data: usdcBalance } = useReadContract({
    address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", // USDC address
    abi: [
      {
        inputs: [{ name: "account", type: "address" }],
        name: "balanceOf",
        outputs: [{ name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function"
      }
    ],
    functionName: "balanceOf",
    args: user?.wallet?.address ? [user.wallet.address as `0x${string}`] : undefined,
  }) as { data: bigint | undefined };

  const { data: oddsData, refetch: refetchOdds } = useReadContract({
    address: marketData.contract_address as `0x${string}`,
    abi: MARKET_ABI,
    functionName: "getMarketOdds",
    args: [],
  }) as { data: readonly [bigint, bigint, bigint] | undefined; refetch: () => void };

  const { data: userBetData, refetch: refetchUserBets } = useReadContract({
    address: marketData.contract_address as `0x${string}`,
    abi: MARKET_ABI,
    functionName: "getUserBet",
    args: user?.wallet?.address ? [user.wallet.address as `0x${string}`] : undefined,
  }) as { data: readonly [bigint, bigint, boolean, bigint] | undefined; refetch: () => void };

  const { data: potentialWinningsData } = useReadContract({
    address: marketData.contract_address as `0x${string}`,
    abi: MARKET_ABI,
    functionName: "calculatePotentialWinnings",
    args: quantity > 0 ? [isYes, parseUnits(quantity.toString(), 6)] : undefined,
    query: { enabled: quantity > 0 },
  }) as { data: readonly [bigint, bigint] | undefined; refetch: () => void };

  useEffect(() => {
    if (transactionHash && isSuccess) {
      toast.success("Bet placed successfully!");
      onSubmit();
      onQuantityChange(0);
      setTransactionHash(null);
      setIsSubmitting(false);
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

  useEffect(() => {
    if (oddsData) {
      const [oddsAValue, oddsBValue, totalVolumeValue] = oddsData;
      const totalOdds = Number(oddsAValue) + Number(oddsBValue);
      if (totalOdds > 0) {
        setOddsA(Math.round((Number(oddsAValue) / totalOdds) * 100));
        setOddsB(Math.round((Number(oddsBValue) / totalOdds) * 100));
      }
      setTotalVolume(Number(formatUnits(totalVolumeValue, 6)));
    }
  }, [oddsData]);

  useEffect(() => {
    if (userBetData) {
      const [amountA, amountB] = userBetData;
      setUserBetA(Number(formatUnits(amountA, 6)));
      setUserBetB(Number(formatUnits(amountB, 6)));
    }
  }, [userBetData]);

  useEffect(() => {
    if (potentialWinningsData && isBuy) {
      const [winnings] = potentialWinningsData;
      setPotentialWinnings(Number(formatUnits(winnings, 6)));
    } else if (!isBuy) {
      const currentBet = isYes ? userBetA : userBetB;
      const sellPercentage = currentBet > 0 ? Math.min(quantity / currentBet, 1) : 0;
      setPotentialWinnings(quantity * sellPercentage);
    }
  }, [potentialWinningsData, isBuy, quantity, isYes, userBetA, userBetB]);

  const handleQuantityChange = (e:any) => {
    const value = parseFloat(e.target.value);
    onQuantityChange(!isNaN(value) && value >= 0 ? value : 0);
  };

  const handleMaxClick = () => {
    if (isBuy) {
      onQuantityChange(userBalance?.value ? parseFloat(formatUnits(userBalance.value, userBalance.decimals!)) : 0);
    } else {
      const maxAmount = isYes ? userBetA : userBetB;
      onQuantityChange(maxAmount);
    }
  };

  const handleSubmit = async () => {
    if (quantity <= 0 || balanceLow || isSubmitting) return;

    setIsSubmitting(true);

    try {
      if (isBuy) {
        const betAmount = parseUnits(quantity.toString(), 6);
        await approve({
          // tokenAddress: CONTRACT_ADDRESSES.token as `0x${string}`,
          spender: marketData.contract_address as `0x${string}`,
          usdAmount: quantity,
          // decimals: 6,
        });

        const txHash = await writeContractAsync({
          address: marketData.contract_address as `0x${string}`,
          abi: MARKET_ABI,
          functionName: "placeBet",
          args: [isYes, betAmount],
        });

        setTransactionHash(txHash);

        const authToken = await getAccessToken();
        await createTrade(authToken!, {
          order_type: "BUY",
          order_size: quantity,
          amount: quantity,
          afterPrice: isYes ? (oddsA / 100) : (oddsB / 100),
          marketID: marketData.id,
          outcomeId: isYes ? marketData.outcome[0].id : marketData.outcome[1].id,
        });

        const newTotalBet = (isYes ? userBetA : userBetB) + quantity;
        await createOrUpdateTokenAllocation(authToken!, {
          amount: newTotalBet,
          outcomeId: isYes ? marketData.outcome[0].id : marketData.outcome[1].id,
        });
      } else {
        toast.error("Selling functionality not available in current contract");
        setIsSubmitting(false);
        return;
      }
    } catch (error) {
      setIsSubmitting(false);
      const errorMessage = error instanceof Error ? error.message.toLowerCase() : "unknown error";
      if (errorMessage.includes("insufficient")) toast.error("Insufficient balance. Please check your funds.");
      else if (errorMessage.includes("user rejected") || errorMessage.includes("denied")) toast.error("Transaction was cancelled.");
      else if (errorMessage.includes("market") && errorMessage.includes("ended")) toast.error("This market has already ended.");
      else toast.error("Transaction failed. Please try again.");
    }
  };

  useEffect(() => {
    if (isBuy) {
      // Use USDC balance instead of generic balance
      const availableUsdcBalance = usdcBalance ? parseFloat(formatUnits(usdcBalance, 6)) : 0;
      setBalanceLow(availableUsdcBalance < quantity);
    } else {
      const maxSellAmount = isYes ? userBetA : userBetB;
      setBalanceLow(maxSellAmount < quantity);
    }
  }, [quantity, isBuy, isYes, userBetA, userBetB, usdcBalance]);

  const getCurrentPrice = (forYes:boolean) => (forYes ? oddsA / 100 : oddsB / 100);

  return (
    <div className="bg-[#131314f2] backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl p-4 relative" style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      <div className="bg-gradient-to-br from-white/5 via-transparent to-black/20 absolute inset-0 rounded-xl"></div>
      <div className="relative z-10">
        <h2 className="text-xl font-bold text-white mb-3 tracking-tight">Trading Panel</h2>

        {/* Outcome Selection */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <button
            className={`p-2 rounded-lg border border-white/10 ${isYes ? 'bg-green-500/20 text-green-400 shadow-md' : 'bg-white/5 text-slate-300 hover:bg-green-500/10 hover:shadow-md'} transition-all duration-200`}
            onClick={() => onYesNoToggle(true)}
          >
            <div className="text-center">
              <div className="font-semibold text-sm">YES</div>
              <div className="text-base font-medium">${getCurrentPrice(true).toFixed(2)}</div>
              <div className="text-xs text-slate-400">{oddsA}%</div>
              {userBetA > 0 && <div className="text-xs text-green-400 mt-1">Bet: ${userBetA.toFixed(2)}</div>}
            </div>
          </button>
          <button
            className={`p-2 rounded-lg border border-white/10 ${!isYes ? 'bg-red-500/20 text-red-400 shadow-md' : 'bg-white/5 text-slate-300 hover:bg-red-500/10 hover:shadow-md'} transition-all duration-200`}
            onClick={() => onYesNoToggle(false)}
          >
            <div className="text-center">
              <div className="font-semibold text-sm">NO</div>
              <div className="text-base font-medium">${getCurrentPrice(false).toFixed(2)}</div>
              <div className="text-xs text-slate-400">{oddsB}%</div>
              {userBetB > 0 && <div className="text-xs text-red-400 mt-1">Bet: ${userBetB.toFixed(2)}</div>}
            </div>
          </button>
        </div>

        {/* Amount Input */}
        <div className="mb-3">
          <div className="text-xs text-slate-400 mb-1">Available: ${userBalance?.value ? formatUnits(userBalance.value, userBalance.decimals!) : "0"}</div>
          <div className="relative">
            <input
              type="number"
              value={quantity}
              onChange={handleQuantityChange}
              className="w-full bg-white/5 border border-white/20 rounded-lg px-3 py-2 text-white text-sm font-medium focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 transition-all duration-200"
              placeholder="0"
              min="0"
              step="0.01"
            />
            <button
              onClick={handleMaxClick}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-amber-400 bg-amber-500/20 border border-amber-500/30 px-2 py-1 rounded hover:bg-amber-500/30 hover:text-amber-300 transition-all duration-200 shadow-sm"
            >
              MAX
            </button>
          </div>
          <div className="flex gap-2 mt-2">
            <button onClick={() => onQuantityChange(10)} className="bg-white/5 border border-white/20 text-slate-300 px-2 py-1 rounded-lg text-xs font-medium hover:bg-white/10 hover:text-white transition-all duration-200 shadow-sm">10</button>
            <button onClick={() => onQuantityChange(50)} className="bg-white/5 border border-white/20 text-slate-300 px-2 py-1 rounded-lg text-xs font-medium hover:bg-white/10 hover:text-white transition-all duration-200 shadow-sm">50</button>
          </div>
        </div>


        {/* Submit Button */}
        <button
          className={`w-full bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-md ${quantity <= 0 || balanceLow || isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:from-amber-500 hover:to-amber-700 hover:shadow-lg transition-all duration-200'}`}
          onClick={handleSubmit}
          disabled={quantity <= 0 || balanceLow || isSubmitting}
        >
          {isSubmitting ? "Placing Bet..." : `Place $${quantity} Bet`}
        </button>
        {balanceLow && (
          <div className="mt-2 text-xs text-red-400 text-center font-medium">Insufficient balance. Please add funds.</div>
        )}
      </div>
    </div>
  );
};

export default TradingPanel;