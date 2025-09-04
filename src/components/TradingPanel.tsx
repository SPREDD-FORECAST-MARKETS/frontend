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
  const [walletNotConnected, setWalletNotConnected] = useState(false);
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
    if (quantity <= 0 || balanceLow || isSubmitting || walletNotConnected) return;

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
    // First check if wallet is connected
    if (!user?.wallet?.address) {
      setWalletNotConnected(true);
      setBalanceLow(false);
      return;
    }

    setWalletNotConnected(false);

    if (isBuy) {
      // Use USDC balance instead of generic balance
      const availableUsdcBalance = usdcBalance ? parseFloat(formatUnits(usdcBalance, 6)) : 0;
      setBalanceLow(availableUsdcBalance < quantity);
    } else {
      const maxSellAmount = isYes ? userBetA : userBetB;
      setBalanceLow(maxSellAmount < quantity);
    }
  }, [quantity, isBuy, isYes, userBetA, userBetB, usdcBalance, user?.wallet?.address]);

  const getCurrentPrice = (forYes:boolean) => (forYes ? oddsA / 100 : oddsB / 100);

  return (
    <div className="bg-gradient-to-br from-zinc-900/95 to-zinc-950/95 backdrop-blur-sm border border-slate-600/40 hover:border-zinc-700/60 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 p-6 relative" style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/[0.02] via-transparent to-orange-500/[0.02] rounded-xl"></div>
      <div className="relative z-10">
        <h2 className="text-xl font-bold text-white mb-4 tracking-tight">Trading Panel</h2>

        {/* Outcome Selection */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <button
            className={`p-3 rounded-xl border transition-all duration-200 ${isYes ? 'bg-gradient-to-br from-emerald-500/25 to-emerald-600/20 border-emerald-500/40 text-emerald-300 shadow-lg shadow-emerald-500/10' : 'bg-zinc-800/60 border-zinc-700/50 text-zinc-300 hover:bg-emerald-500/10 hover:border-emerald-500/30 hover:text-emerald-400'}`}
            onClick={() => onYesNoToggle(true)}
          >
            <div className="text-center">
              <div className="font-bold text-sm">YES</div>
              <div className="text-lg font-bold">${getCurrentPrice(true).toFixed(2)}</div>
              <div className="text-xs opacity-80">{oddsA}%</div>
              {userBetA > 0 && <div className="text-xs mt-1 font-semibold">Bet: ${userBetA.toFixed(2)}</div>}
            </div>
          </button>
          <button
            className={`p-3 rounded-xl border transition-all duration-200 ${!isYes ? 'bg-gradient-to-br from-red-500/25 to-red-600/20 border-red-500/40 text-red-300 shadow-lg shadow-red-500/10' : 'bg-zinc-800/60 border-zinc-700/50 text-zinc-300 hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400'}`}
            onClick={() => onYesNoToggle(false)}
          >
            <div className="text-center">
              <div className="font-bold text-sm">NO</div>
              <div className="text-lg font-bold">${getCurrentPrice(false).toFixed(2)}</div>
              <div className="text-xs opacity-80">{oddsB}%</div>
              {userBetB > 0 && <div className="text-xs mt-1 font-semibold">Bet: ${userBetB.toFixed(2)}</div>}
            </div>
          </button>
        </div>

        {/* Amount Input */}
        <div className="mb-4">
          <div className="text-xs text-zinc-400 mb-2 font-medium">Available: ${userBalance?.value ? formatUnits(userBalance.value, userBalance.decimals!) : "0"}</div>
          <div className="relative">
            <input
              type="number"
              value={quantity}
              onChange={handleQuantityChange}
              className="w-full bg-zinc-800/70 border border-zinc-700/60 rounded-xl px-4 py-3 text-white text-sm font-medium focus:outline-none focus:border-orange-500/60 focus:ring-2 focus:ring-orange-500/20 hover:border-zinc-600/70 transition-all duration-200"
              placeholder="0"
              min="0"
              step="0.01"
            />
            <button
              onClick={handleMaxClick}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-orange-400 bg-orange-500/20 border border-orange-500/30 px-3 py-1.5 rounded-lg hover:bg-orange-500/30 hover:text-orange-300 transition-all duration-200 font-semibold"
            >
              MAX
            </button>
          </div>
          <div className="flex gap-2 mt-3">
            <button onClick={() => onQuantityChange(10)} className="bg-zinc-800/70 border border-zinc-700/60 text-zinc-300 px-3 py-2 rounded-xl text-xs font-semibold hover:bg-zinc-700/80 hover:text-white hover:border-zinc-600/70 transition-all duration-200">10</button>
            <button onClick={() => onQuantityChange(50)} className="bg-zinc-800/70 border border-zinc-700/60 text-zinc-300 px-3 py-2 rounded-xl text-xs font-semibold hover:bg-zinc-700/80 hover:text-white hover:border-zinc-600/70 transition-all duration-200">50</button>
          </div>
        </div>


        {/* Submit Button */}
        <button
          className={`w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-xl text-sm font-bold shadow-lg ${quantity <= 0 || balanceLow || isSubmitting || walletNotConnected ? 'opacity-50 cursor-not-allowed' : 'hover:from-orange-600 hover:to-orange-700 hover:shadow-xl hover:scale-[1.02] transition-all duration-200'}`}
          onClick={handleSubmit}
          disabled={quantity <= 0 || balanceLow || isSubmitting || walletNotConnected}
        >
          {isSubmitting ? "Placing Bet..." : `Place $${quantity} Bet`}
        </button>
        {walletNotConnected && (
          <div className="mt-3 text-xs text-yellow-400 text-center font-semibold bg-yellow-500/10 border border-yellow-500/20 rounded-lg py-2 px-3">Please connect wallet first.</div>
        )}
        {!walletNotConnected && balanceLow && (
          <div className="mt-3 text-xs text-red-400 text-center font-semibold bg-red-500/10 border border-red-500/20 rounded-lg py-2 px-3">Insufficient balance. Please add funds.</div>
        )}
      </div>
    </div>
  );
};

export default TradingPanel;