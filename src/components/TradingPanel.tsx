import { useReadContract, useWriteContract } from "wagmi";
import type { Market } from "../lib/interface";
import { calculateReturn } from "../utils/calculations";
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
  onBuySellToggle,
  onYesNoToggle,
  onQuantityChange,
  onSubmit,
}: TradingPanelProps) => {
  const [priceYes, setPriceYes] = useState(0.0);
  const [priceNo, setPriceNo] = useState(0.0);
  const [userSharesYes, setUserShareYes] = useState(0);
  const [userSharesNo, setUserShareNo] = useState(0);
  const [totalShares, setTotalShares] = useState(0.0);
  const [balanceLow, setBalanceLow] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [transactionHash, setTransactionHash] = useState<string | null>(null);
  const [transactionType, setTransactionType] = useState<"buy" | "sell" | null>(
    null
  );

  const [userBalance] = useAtom(balanceAtom);
  const { user, getAccessToken } = usePrivy();
  const { writeContractAsync, isSuccess, isError } = useWriteContract();
  const { approve } = useUsdtToken();
  const toast = useToast();

  const { data, refetch: refetchPrices } = useReadContract({
    address: marketData.contract_address as `0x${string}`,
    abi: MARKET_ABI,
    functionName: "getCurrentPrices",
    args: [],
  }) as { data: [bigint, bigint]; refetch: () => void };

  const { data: sharesData, refetch: refetchShares } = useReadContract({
    address: marketData.contract_address as `0x${string}`,
    abi: MARKET_ABI,
    functionName: "getUserBalances",
    args: [user?.wallet?.address],
  }) as { data: [bigint, bigint, bigint]; refetch: () => void };

  // Handle transaction success/failure with useEffect
  useEffect(() => {
    if (transactionHash && isSuccess && transactionType) {
      if (transactionType === "buy") {
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
  }, [
    isSuccess,
    transactionHash,
    transactionType,
    toast,
    onSubmit,
    onQuantityChange,
  ]);

  useEffect(() => {
    if (transactionHash && isError && transactionType) {
      if (transactionType === "buy") {
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
      onQuantityChange(
        userBalance?.value && userBalance?.decimals
          ? parseFloat(formatUnits(userBalance.value, userBalance.decimals))
          : 0
      );
    } else {
      // When selling, use user's shares for the selected outcome
      const maxShares = isYes ? userSharesYes : userSharesNo;
      onQuantityChange(maxShares);
    }
  };

  const handleSubmit = async () => {
    if (quantity <= 0 || balanceLow || isSubmitting) return;

    setIsSubmitting(true);
    let transactionHash: string | null = null;

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
        transactionHash = await writeContractAsync({
          address: marketData.contract_address as `0x${string}`,
          abi: MARKET_ABI,
          functionName: "buyTokens",
          args: [
            isYes, // _buyOptionA (true for YES, false for NO)
            amountIn, // _amount
            minTokensOut, // _minTokensOut
          ],
        });
      } else {
        // Sell tokens
        const tokensIn = BigInt(quantity); // quantity is already in shares

        transactionHash = await writeContractAsync({
          address: marketData.contract_address as `0x${string}`,
          abi: MARKET_ABI,
          functionName: "sellTokens",
          args: [
            isYes, // _sellOptionA (true for YES, false for NO)
            tokensIn, // _tokensIn
            1, // _minAmountOut
          ],
        });
      }

      // The transaction was submitted successfully, but we need to wait for confirmation
      if (transactionHash) {
        // Wait longer for the transaction to be confirmed
        await new Promise((resolve) => setTimeout(resolve, 8000));

        // Try to refetch data to see if the transaction was successful
        await Promise.all([refetchPrices(), refetchShares()]);

        // Wait a bit more for the refetch to complete
        await new Promise((resolve) => setTimeout(resolve, 3000));

        // Check if we have valid updated data (this indicates transaction success)
        if (!data || !sharesData) {
          throw new Error(
            "Transaction may have failed - no updated data received"
          );
        }

        // If we reach here, transaction likely succeeded - proceed with API calls
        const authToken = await getAccessToken();

        // Use the updated data from state
        const afterPrice = isYes
          ? parseFloat(formatUnits(BigInt(data[0]), 6))
          : parseFloat(formatUnits(BigInt(data[1]), 6));

        const afterActionTotalShares = isYes
          ? parseInt(sharesData[0].toString())
          : parseInt(sharesData[1].toString());

        if (isBuy) {
          // Call APIs for successful buy transaction
          await createTrade(authToken!, {
            order_type: "BUY",
            order_size: totalShares,
            amount: quantity,
            afterPrice: afterPrice,
            marketID: marketData.id,
            outcomeId: isYes
              ? marketData.outcome[0].id
              : marketData.outcome[1].id,
          });

          await createOrUpdateTokenAllocation(authToken!, {
            amount: afterActionTotalShares,
            outcomeId: isYes
              ? marketData.outcome[0].id
              : marketData.outcome[1].id,
          });

          setTransactionHash(transactionHash);
          setTransactionType("buy");
        } else {
          // Call APIs for successful sell transaction
          const sellAmount = quantity * (isYes ? priceYes : priceNo);

          await createTrade(authToken!, {
            order_type: "SELL",
            order_size: quantity,
            amount: sellAmount,
            afterPrice: afterPrice,
            marketID: marketData.id,
            outcomeId: isYes
              ? marketData.outcome[0].id
              : marketData.outcome[1].id,
          });

          await createOrUpdateTokenAllocation(authToken!, {
            amount: afterActionTotalShares,
            outcomeId: isYes
              ? marketData.outcome[0].id
              : marketData.outcome[1].id,
          });

          setTransactionHash(transactionHash);
          setTransactionType("sell");
        }
      }
    } catch (error) {
      // Reset submission state immediately on error
      setIsSubmitting(false);

      // Check for specific error types and show appropriate messages
      const errorMessage =
        error instanceof Error ? error.message.toLowerCase() : "unknown error";

      if (
        errorMessage.includes("price impact") ||
        errorMessage.includes("slippage") ||
        errorMessage.includes("too high") ||
        errorMessage.includes("exceeds") ||
        errorMessage.includes("revert")
      ) {
        toast.error(
          "Price impact too high. Trade a smaller amount and try again."
        );
      } else if (
        errorMessage.includes("insufficient") ||
        errorMessage.includes("balance")
      ) {
        toast.error("Insufficient balance. Please check your funds.");
      } else if (
        errorMessage.includes("user rejected") ||
        errorMessage.includes("denied")
      ) {
        toast.error("Transaction was cancelled.");
      } else {
        toast.error("Transaction failed. Please try again.");
      }

      // Don't call any APIs when there's an error
      return;
    }
  };

  useEffect(() => {
    if (data === undefined) return;
    setPriceYes(parseFloat(formatUnits(BigInt(data[0]), 6)));
    setPriceNo(parseFloat(formatUnits(BigInt(data[1]), 6)));
  }, [data]);

  useEffect(() => {
    if (sharesData === undefined) return;
    setUserShareYes(parseInt(sharesData[0].toString()));
    setUserShareNo(parseInt(sharesData[1].toString()));
  }, [sharesData]);

  useEffect(() => {
    if (isBuy) {
      if (isYes) setTotalShares(quantity / priceYes);
      else setTotalShares(quantity / priceNo);
    } else {
      // When selling, quantity represents shares directly
      setTotalShares(quantity);
    }
  }, [priceNo, priceYes, quantity, isBuy, isYes]);

  useEffect(() => {
    if (isBuy) {
      // When buying, check if user has enough balance
      if (
        parseFloat(formatUnits(userBalance?.value!, userBalance?.decimals!)) <
        Number(quantity)
      ) {
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
  }, [quantity, isBuy, isYes, userSharesYes, userSharesNo, userBalance]);

  return (
     <div className="bg-[#1a1a1a] rounded-2xl border border-[#2a2a2a] overflow-hidden shadow-2xl">
      {/* Panel Header */}
      <div className="bg-[#1a1a1a] px-6 py-4 border-b border-[#2a2a2a]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Trading Panel</h2>
            <p className="text-sm text-gray-400">Place your forecast</p>
          </div>
        </div>
      </div>

      {/* Buy/Sell Toggle */}
      <div className="p-6 border-b border-[#2a2a2a]">
        <div className="grid grid-cols-2 gap-2 p-1 bg-[#0f0f0f] rounded-lg">
          <button
            className={`py-3 px-4 rounded-md font-medium transition-all duration-200 ${
              isBuy
                ? "bg-green-500 text-white shadow-lg transform scale-105"
                : "text-gray-400 hover:text-white hover:bg-[#1a1a1a]"
            }`}
            onClick={() => onBuySellToggle(true)}
          >
            BUY
          </button>
          <button
            className={`py-3 px-4 rounded-md font-medium transition-all duration-200 ${
              !isBuy
                ? "bg-red-500 text-white shadow-lg transform scale-105"
                : "text-gray-400 hover:text-white hover:bg-[#1a1a1a]"
            }`}
            onClick={() => onBuySellToggle(false)}
          >
            SELL
          </button>
        </div>
      </div>

      {/* Outcome Selection */}
      <div className="p-6 border-b border-[#2a2a2a]">
        <h3 className="text-sm font-medium text-gray-400 mb-4">Outcome</h3>
        <div className="grid grid-cols-2 gap-3">
          <button
            className={`p-4 rounded-xl transition-all duration-200 border-2 ${
              isYes
                ? "bg-green-500/10 border-green-500 shadow-lg shadow-green-500/20"
                : "bg-[#0f0f0f] border-[#2a2a2a] hover:border-green-500/50"
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
                {isBuy ? (
                  `$${priceYes.toFixed(2)}`
                ) : (
                  <span className="text-xs text-gray-400">
                    {userSharesYes.toLocaleString()} shares
                  </span>
                )}
              </div>
            </div>
          </button>

          <button
            className={`p-4 rounded-xl transition-all duration-200 border-2 ${
              !isYes
                ? "bg-red-500/10 border-red-500 shadow-lg shadow-red-500/20"
                : "bg-[#0f0f0f] border-[#2a2a2a] hover:border-red-500/50"
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
                {isBuy ? (
                  `$${priceNo.toFixed(2)}`
                ) : (
                  <span className="text-xs text-gray-400">
                    {userSharesNo.toLocaleString()} shares
                  </span>
                )}
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Amount Input */}
      <div className="p-6 border-b border-[#2a2a2a]">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-medium text-gray-400">
            {isBuy ? "Forecast Amount (USDT)" : "Shares to Sell"}
          </h3>
          <span className="text-xs text-gray-500">
            Available: {isBuy ? `$${userBalance?.value ? formatUnits(userBalance.value, userBalance.decimals!) : '0'}` : `${isYes ? userSharesYes : userSharesNo} shares`}
          </span>
        </div>
        
        <div className="relative">
          <input
            type="number"
            value={quantity}
            onChange={handleQuantityChange}
            className="w-full bg-[#0f0f0f] border-2 border-[#2a2a2a] rounded-xl px-4 py-4 text-white text-lg font-medium focus:outline-none focus:border-orange-500 transition-colors"
            placeholder="0"
            min="0"
            step={isBuy ? "0.01" : "1"}
          />
          <button
            onClick={handleMaxClick}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-xs text-orange-500 bg-orange-500/10 px-3 py-1 rounded-md hover:bg-orange-500/20 transition-colors font-medium"
          >
            MAX
          </button>
        </div>

        {/* Quick Amount Buttons */}
        <div className="grid grid-cols-3 gap-2 mt-4">
          <button
            onClick={() => onQuantityChange(0)}
            className="bg-[#0f0f0f] border border-[#2a2a2a] text-gray-400 py-2 rounded-lg text-sm hover:bg-[#1a1a1a] hover:text-white transition-colors"
          >
            Reset
          </button>
          <button
            onClick={() => onQuantityChange(isBuy ? 10 : 10)}
            className="bg-[#0f0f0f] border border-[#2a2a2a] text-gray-400 py-2 rounded-lg text-sm hover:bg-[#1a1a1a] hover:text-white transition-colors"
          >
            {isBuy ? "$10" : "10"}
          </button>
          <button
            onClick={() => onQuantityChange(isBuy ? 50 : 50)}
            className="bg-[#0f0f0f] border border-[#2a2a2a] text-gray-400 py-2 rounded-lg text-sm hover:bg-[#1a1a1a] hover:text-white transition-colors"
          >
            {isBuy ? "$50" : "50"}
          </button>
        </div>
      </div>

      {/* Trade Summary */}
      <div className="p-6 border-b border-[#2a2a2a] bg-[#0f0f0f]/50">
        <h3 className="text-sm font-medium text-gray-400 mb-4">Trade Summary</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-400">
              {isBuy ? "Forecast Points:" : "Potential Returns:"}
            </span>
            <span className="text-white font-medium">
              {isBuy
                ? `${calculateReturn(quantity, isBuy)} FP`
                : `$${(quantity * (isYes ? priceYes : priceNo)).toFixed(2)}`}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-400">Total Shares:</span>
            <span className="text-white font-medium">
              {totalShares.toFixed(0)} {isYes ? "YES" : "NO"}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-400">Price per Share:</span>
            <span className="text-white font-medium">
              ${(isYes ? priceYes : priceNo).toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Submit button */}
      <div className="p-5">
        <button
          className={`w-full ${
            isBuy
              ? "bg-green-600 hover:bg-green-700"
              : "bg-red-600 hover:bg-red-700"
          } text-white font-bold py-3 px-4 rounded text-lg transition-all ${
            quantity <= 0 || balanceLow || isSubmitting
              ? "opacity-50 cursor-not-allowed"
              : ""
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
            "Place Forecast"
          )}
        </button>
      </div>

      {balanceLow && (
        <p className="text-center text-red-500 mt-5">
          {isBuy
            ? "Low Balance, please add funds."
            : "Insufficient shares to sell."}
        </p>
      )}
    </div>
  );
};

export default TradingPanel;
