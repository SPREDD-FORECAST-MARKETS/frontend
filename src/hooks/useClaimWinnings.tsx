import { useState, useEffect } from "react";
import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { MARKET_ABI } from "../abi/MarketABI";
import { formatUnits } from "viem";
import { useToast } from "./useToast";

export interface ClaimWinningsData {
  originalBet: bigint;
  winnings: bigint;
  totalPayout: bigint;
  canClaim: boolean;
}

export interface UseClaimWinningsReturn {
  // Check winnings data
  winningsData: ClaimWinningsData | null;
  isCheckingWinnings: boolean;
  winningsError: Error | null;
  
  // Claim transaction data
  isClaimingWinnings: boolean;
  claimHash: string | null;
  claimError: Error | null;
  isClaimSuccess: boolean;
  
  // Actions
  checkWinnings: () => void;
  claimWinnings: () => void;
  
  // Formatted values
  formattedWinnings: string;
  formattedTotalPayout: string;
}

export const useClaimWinnings = (
  marketAddress: string | undefined,
  userAddress: string | undefined
): UseClaimWinningsReturn => {
  const [claimHash, setClaimHash] = useState<string | null>(null);
  const [isClaimingWinnings, setIsClaimingWinnings] = useState(false);
  
  const { success, error: toastError } = useToast();
  
  // Check user winnings
  const {
    data: winningsData,
    isLoading: isCheckingWinnings,
    error: winningsError,
    refetch: checkWinnings,
  } = useReadContract({
    address: marketAddress as `0x${string}`,
    abi: MARKET_ABI,
    functionName: "getUserWinnings",
    args: userAddress ? [userAddress as `0x${string}`] : undefined,
    query: {
      enabled: !!marketAddress && !!userAddress,
    },
  }) as {
    data: [bigint, bigint, bigint, boolean] | undefined;
    isLoading: boolean;
    error: Error | null;
    refetch: () => void;
  };

  // Claim winnings transaction
  const {
    writeContractAsync,
    error: claimError,
  } = useWriteContract();

  // Wait for transaction confirmation
  const { isLoading: isTransactionPending, isSuccess: isClaimSuccess } = 
    useWaitForTransactionReceipt({
      hash: claimHash as `0x${string}`,
    });

  // Process winnings data
  const processedWinningsData: ClaimWinningsData | null = winningsData ? {
    originalBet: winningsData[0],
    winnings: winningsData[1],
    totalPayout: winningsData[2],
    canClaim: winningsData[3],
  } : null;

  // Format values for display
  const formattedWinnings = processedWinningsData 
    ? formatUnits(processedWinningsData.winnings, 6)
    : "0";
    
  const formattedTotalPayout = processedWinningsData 
    ? formatUnits(processedWinningsData.totalPayout, 6)
    : "0";

  // Claim winnings function
  const claimWinnings = async () => {
    if (!marketAddress || !processedWinningsData?.canClaim) {
      toastError("Unable to claim winnings at this time");
      return;
    }

    try {
      setIsClaimingWinnings(true);
      
      const hash = await writeContractAsync({
        address: marketAddress as `0x${string}`,
        abi: MARKET_ABI,
        functionName: "claimWinnings",
      });
      
      setClaimHash(hash);
      success(`Claim transaction submitted! Hash: ${hash.slice(0, 10)}...`);
      
      // Optionally trigger balance refresh after successful transaction
      // This would need to be implemented based on your balance management strategy
      
    } catch (error: any) {
      console.error("Claim failed:", error);
      toastError(error.shortMessage || error.message || "Failed to claim winnings");
    } finally {
      setIsClaimingWinnings(false);
    }
  };

  // Handle successful claim
  useEffect(() => {
    if (isClaimSuccess && claimHash) {
      success(`Successfully claimed ${formattedTotalPayout} USDC!`);
      // Trigger winnings check refresh
      checkWinnings();
      setClaimHash(null);
    }
  }, [isClaimSuccess, claimHash, formattedTotalPayout, success, checkWinnings]);

  return {
    // Check winnings data
    winningsData: processedWinningsData,
    isCheckingWinnings,
    winningsError,
    
    // Claim transaction data
    isClaimingWinnings: isClaimingWinnings || isTransactionPending,
    claimHash,
    claimError,
    isClaimSuccess,
    
    // Actions
    checkWinnings,
    claimWinnings,
    
    // Formatted values
    formattedWinnings,
    formattedTotalPayout,
  };
};