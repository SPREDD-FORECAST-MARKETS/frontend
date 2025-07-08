import {
  useWriteContract,
  useWaitForTransactionReceipt,
  useReadContract,
} from "wagmi";
import { MARKET_ABI } from "../abi/MarketABI";
import { useState, useEffect, useCallback } from "react";
import type {
  UseResolveMarketProps,
  UseResolveMarketReturn,
} from "../lib/interface";
import type { MarketOutcome } from "../lib/interface";
import { MarketOutcomeValues } from "../lib/interface";

export const useResolveMarket = ({
  marketData,
  onSuccess,
  onError,
}: UseResolveMarketProps): UseResolveMarketReturn => {
  const [error, setError] = useState<string | null>(null);
  const [transactionHash, setTransactionHash] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasProcessedSuccess, setHasProcessedSuccess] = useState(false);

  const contractAddress = marketData.contract_address as `0x${string}`;

  const { data: contractMarketInfo, refetch: refetchMarketInfo } =
    useReadContract({
      abi: MARKET_ABI,
      functionName: "marketInfo",
      address: marketData.marketId as `0x${string}`,
    });

  const { data: contractMarketId } = useReadContract({
    abi: MARKET_ABI,
    functionName: "marketId",
    address: marketData.contract_address as `0x${string}`,
  });

  const {
    writeContractAsync,
    isPending: isResolving,
    error: writeError,
    reset,
  } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess,
    error: receiptError,
    data: receipt,
  } = useWaitForTransactionReceipt({
    hash: transactionHash as `0x${string}` | undefined,
  });

  const resolveMarket = async (outcome: MarketOutcome) => {
    if (
      outcome !== MarketOutcomeValues.OPTION_A &&
      outcome !== MarketOutcomeValues.OPTION_B
    ) {
      const errorMessage = `Invalid outcome: ${outcome}. Must be ${MarketOutcomeValues.OPTION_A} (OPTION_A) or ${MarketOutcomeValues.OPTION_B} (OPTION_B)`;
      setError(errorMessage);
      onError?.(errorMessage);
      throw new Error(errorMessage);
    }

    try {
      // Reset states
      setError(null);
      setIsProcessing(true);
      setHasProcessedSuccess(false);

      await refetchMarketInfo();

      // Call the resolveMarket function
      const txHash = await writeContractAsync({
        address: contractAddress,
        abi: MARKET_ABI,
        functionName: "resolveMarket",
        args: [outcome],
      });

      setTransactionHash(txHash);

      setTransactionHash(txHash);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to resolve market";
      console.error("Resolve market error:", err);
      setError(errorMessage);
      setIsProcessing(false);
      onError?.(errorMessage);
      throw err;
    }
  };

  const handleTransactionSuccess = useCallback(async () => {
    if (!hasProcessedSuccess && isSuccess && receipt && transactionHash) {
      if (receipt.status === "success") {
        setHasProcessedSuccess(true);

        try {
          await refetchMarketInfo();

          onSuccess?.();

          setTimeout(() => {
            reset();
            setError(null);
            setTransactionHash(null);
            setIsProcessing(false);
            setHasProcessedSuccess(false);
          }, 3000); // Increased delay to ensure proper state updates
        } catch (refetchError) {
          console.error("Error during success handling:", refetchError);
          // Still call onSuccess even if refetch fails
          onSuccess?.();
        }
      } else {
        // Transaction was reverted
        const errorMessage = "Transaction was reverted";
        setError(errorMessage);
        setIsProcessing(false);
        setHasProcessedSuccess(false);
        onError?.(errorMessage);
      }
    }
  }, [
    hasProcessedSuccess,
    isSuccess,
    receipt,
    transactionHash,
    onSuccess,
    refetchMarketInfo,
    reset,
    onError,
  ]);

  useEffect(() => {
    handleTransactionSuccess();
  }, [handleTransactionSuccess]);

  useEffect(() => {
    if (writeError && !hasProcessedSuccess) {
      const errorMessage = writeError.message || "Failed to submit transaction";
      setError(errorMessage);
      setIsProcessing(false);
      onError?.(errorMessage);
    }
  }, [writeError, onError, hasProcessedSuccess]);

  // Handle receipt errors
  useEffect(() => {
    if (receiptError && !hasProcessedSuccess) {
      const errorMessage = receiptError.message || "Transaction failed";
      console.error("Receipt error:", receiptError);
      setError(errorMessage);
      setIsProcessing(false);
      onError?.(errorMessage);
    }
  }, [receiptError, onError, hasProcessedSuccess]);

  // Clean up function to reset all states
  const resetState = () => {
    setError(null);
    setTransactionHash(null);
    setIsProcessing(false);
    setHasProcessedSuccess(false);
    reset();
  };

  // Function to check if transaction is pending
  const isPending = (): boolean => {
    return isProcessing || isResolving || isConfirming;
  };

  // Function to get market end time for validation
  const getMarketEndTime = (): number | null => {
    if (contractMarketInfo) {
      // endTime is the 2nd field (index 1) in MarketInfo struct
      return Number((contractMarketInfo as any)[1]);
    }
    return null;
  };

  // Function to check if market has ended
  const hasMarketEnded = (): boolean => {
    const endTime = getMarketEndTime();
    if (!endTime) return false;
    return Date.now() / 1000 >= endTime;
  };

  // Function to check if market is resolved
  const isContractResolved = (): boolean => {
    if (contractMarketInfo) {
      // resolved is the 9th field (index 8) in MarketInfo struct
      return (contractMarketInfo as any)[8] || false;
    }
    return false;
  };

  return {
    // States
    marketData,
    error,
    isProcessing,

    // Wagmi states
    isResolving,
    isConfirming,
    isSuccess,

    // Functions
    resolveMarket,
    resetState,
    isPending,
    hasMarketEnded,
    getMarketEndTime,

    // Transaction data
    receipt,
    transactionHash,

    // Contract data
    contractMarketInfo,
    contractMarketId,
    isContractResolved: isContractResolved(),
  };
};

// Helper function to map outcome values to strings for API calls
export const mapOutcomeToString = (outcome: MarketOutcome): string => {
  switch (outcome) {
    case MarketOutcomeValues.OPTION_A:
      return "YES";
    case MarketOutcomeValues.OPTION_B:
      return "NO";
    default:
      throw new Error(`Invalid outcome: ${outcome}`);
  }
};
